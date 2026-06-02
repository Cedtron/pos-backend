const db = require('../conn/db');

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

// GET /api/alerts/low-stock?shop_code=XXX
// Returns products where stock <= low_stock_threshold
exports.getLowStockAlerts = async (req, res) => {
  const { shop_code } = req.query;
  if (!shop_code) return res.status(400).json({ message: 'shop_code required' });

  try {
    const rows = await query(
      `SELECT id, RegNo, title, stock, low_stock_threshold, images, category, brand
       FROM products_tb
       WHERE shop_code = ? AND stock <= low_stock_threshold
       ORDER BY stock ASC`,
      [shop_code]
    );

    const parsed = rows.map(p => ({
      ...p,
      images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
      severity: p.stock === 0 ? 'out' : p.stock <= Math.floor(p.low_stock_threshold / 2) ? 'critical' : 'low',
    }));

    res.status(200).json({
      total:    parsed.length,
      out:      parsed.filter(p => p.severity === 'out').length,
      critical: parsed.filter(p => p.severity === 'critical').length,
      low:      parsed.filter(p => p.severity === 'low').length,
      items:    parsed,
    });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// PUT /api/alerts/threshold/:product_id
// Update the low stock threshold for a product
exports.updateThreshold = async (req, res) => {
  const { product_id }        = req.params;
  const { low_stock_threshold, shop_code } = req.body;

  if (low_stock_threshold === undefined || low_stock_threshold < 0) {
    return res.status(400).json({ message: 'low_stock_threshold must be >= 0' });
  }

  try {
    const result = await query(
      `UPDATE products_tb SET low_stock_threshold = ? WHERE id = ? AND shop_code = ?`,
      [low_stock_threshold, product_id, shop_code]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Threshold updated' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// GET /api/alerts/low-stock/count?shop_code=XXX
// Lightweight count only — called by sidebar badge
exports.getLowStockCount = async (req, res) => {
  const { shop_code } = req.query;
  if (!shop_code) return res.status(400).json({ message: 'shop_code required' });

  try {
    const [row] = await query(
      `SELECT COUNT(*) AS count FROM products_tb
       WHERE shop_code = ? AND stock <= low_stock_threshold`,
      [shop_code]
    );
    res.status(200).json({ count: row.count });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};
