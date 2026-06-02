const db           = require('../conn/db');
const generateRegNo = require('../conn/reg');

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Storefront APIs (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/store/:shop_code
// Returns shop branding + active status
exports.getStorefront = async (req, res) => {
  const { shop_code } = req.params;
  try {
    // Check shop exists
    const [shop] = await query(
      `SELECT name, email, logo, color, tagline, business_type, city, country, contact_number, currency
       FROM companydetails_tb WHERE shop_code = ?`,
      [shop_code]
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // Check ecommerce feature is enabled for this shop
    const subRows = await query(
      `SELECT pf.feature_key FROM shop_subscriptions_tb ss
       JOIN plans_tb p ON ss.plan_id = p.id
       JOIN plan_features_tb pf ON pf.plan_id = p.id
       WHERE ss.shop_code = ? AND pf.feature_key = 'ecommerce'
         AND ss.status IN ('active','trial')`,
      [shop_code]
    );

    res.status(200).json({
      ...shop,
      shop_code,
      ecommerce_enabled: subRows.length > 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/store/:shop_code/products
// Returns published products for the storefront (stock > 0 only)
exports.getStoreProducts = async (req, res) => {
  const { shop_code } = req.params;
  const { category, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let sql = `SELECT id, RegNo, title, description, price, stock, images, category,
                      sub_category, brand, color, bar_code
               FROM products_tb
               WHERE shop_code = ? AND stock > 0`;
    const params = [shop_code];

    if (category) { sql += ` AND category = ?`;           params.push(category); }
    if (search)   { sql += ` AND title LIKE ?`;           params.push(`%${search}%`); }

    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const products = await query(sql, params);

    // Parse images JSON for each product
    const parsed = products.map(p => ({
      ...p,
      images: (() => { try { return JSON.parse(p.images) || []; } catch { return []; } })(),
    }));

    // Total count for pagination
    let countSql = `SELECT COUNT(*) AS total FROM products_tb WHERE shop_code = ? AND stock > 0`;
    const countParams = [shop_code];
    if (category) { countSql += ` AND category = ?`; countParams.push(category); }
    if (search)   { countSql += ` AND title LIKE ?`; countParams.push(`%${search}%`); }
    const [{ total }] = await query(countSql, countParams);

    res.status(200).json({ products: parsed, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/store/:shop_code/categories
// Returns distinct categories that have in-stock products
exports.getStoreCategories = async (req, res) => {
  const { shop_code } = req.params;
  try {
    const rows = await query(
      `SELECT DISTINCT category FROM products_tb
       WHERE shop_code = ? AND stock > 0 AND category IS NOT NULL
       ORDER BY category`,
      [shop_code]
    );
    res.status(200).json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/store/:shop_code/product/:RegNo
// Single product detail
exports.getStoreProduct = async (req, res) => {
  const { shop_code, RegNo } = req.params;
  try {
    const [product] = await query(
      `SELECT id, RegNo, title, description, price, stock, images, category,
              sub_category, brand, color, bar_code, location
       FROM products_tb WHERE shop_code = ? AND RegNo = ?`,
      [shop_code, RegNo]
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.images = (() => { try { return JSON.parse(product.images) || []; } catch { return []; } })();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Place order
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/store/:shop_code/order
exports.placeOrder = async (req, res) => {
  const { shop_code } = req.params;
  const {
    customer_name, customer_email, customer_phone,
    delivery_address, customer_note,
    items, // [{ RegNo, title, price, quantity, images }]
    payment_method = 'cash_on_delivery',
    delivery_fee = 0,
  } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !delivery_address) {
    return res.status(400).json({ message: 'Customer name, email, phone, and delivery address are required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }

  try {
    // Validate stock for each item
    for (const item of items) {
      const [product] = await query(
        `SELECT stock, title FROM products_tb WHERE RegNo = ? AND shop_code = ?`,
        [item.RegNo, shop_code]
      );
      if (!product) return res.status(400).json({ message: `Product ${item.RegNo} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.title}". Available: ${product.stock}`,
        });
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total    = subtotal + parseFloat(delivery_fee);
    const RegNo    = await generateRegNo('EC', 'ecom_orders_tb');

    // Insert order
    await query(
      `INSERT INTO ecom_orders_tb
         (RegNo, shop_code, customer_name, customer_email, customer_phone,
          delivery_address, customer_note, subtotal, delivery_fee, total,
          items, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        RegNo, shop_code, customer_name, customer_email, customer_phone,
        delivery_address, customer_note || null,
        subtotal, delivery_fee, total,
        JSON.stringify(items), payment_method,
      ]
    );

    // Deduct stock for each item
    for (const item of items) {
      await query(
        `UPDATE products_tb SET stock = stock - ? WHERE RegNo = ? AND shop_code = ?`,
        [item.quantity, item.RegNo, shop_code]
      );
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderRegNo: RegNo,
      total,
    });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/store/order/:RegNo?email=customer@email.com
// Customer can look up their order by RegNo + email (no auth needed)
exports.getOrderStatus = async (req, res) => {
  const { RegNo } = req.params;
  const { email }  = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required to look up an order' });

  try {
    const [order] = await query(
      `SELECT RegNo, customer_name, status, payment_status, subtotal, delivery_fee,
              total, items, tracking_number, created_at, payment_method
       FROM ecom_orders_tb WHERE RegNo = ? AND customer_email = ?`,
      [RegNo, email]
    );
    if (!order) return res.status(404).json({ message: 'Order not found or email does not match' });
    order.items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED: Shop owner manages orders
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ecom-orders (shop owner — all orders for their shop)
exports.getShopOrders = async (req, res) => {
  const { shop_code } = req.query;
  const { status, page = 1, limit = 30 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let sql = `SELECT id, RegNo, customer_name, customer_email, customer_phone,
                      total, status, payment_status, created_at, tracking_number
               FROM ecom_orders_tb WHERE shop_code = ?`;
    const params = [shop_code];
    if (status) { sql += ` AND status = ?`; params.push(status); }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const orders = await query(sql, params);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/ecom-orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, tracking_number, payment_status } = req.body;
  const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const fields = [];
    const values = [];
    if (status)          { fields.push('status = ?');          values.push(status); }
    if (tracking_number) { fields.push('tracking_number = ?'); values.push(tracking_number); }
    if (payment_status)  { fields.push('payment_status = ?');  values.push(payment_status); }
    if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update' });

    values.push(id);
    await query(`UPDATE ecom_orders_tb SET ${fields.join(', ')} WHERE id = ?`, values);
    res.status(200).json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
