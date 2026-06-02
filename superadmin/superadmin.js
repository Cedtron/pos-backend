/**
 * superadmin/superadmin.js
 * All queries are cross-shop. Every route protected by requireRole(['admin']).
 */
const db   = require('../conn/db');
const bcrypt = require('bcrypt');

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

// ─── KPI summary ──────────────────────────────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const [
      [shops], [users], [products], [revenue], [ecomRev],
      [newShops], [activeSubs], [paidSubs], [activeShops]
    ] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM companydetails_tb`),
      query(`SELECT COUNT(*) AS total FROM users_tb`),
      query(`SELECT COUNT(*) AS total FROM products_tb`),
      query(`SELECT COALESCE(SUM(TotalAmount),0) AS total FROM sales_tb`),
      query(`SELECT COALESCE(SUM(total),0) AS total FROM ecom_orders_tb WHERE status != 'cancelled'`),
      query(`SELECT COUNT(*) AS total FROM companydetails_tb WHERE id >= (SELECT MAX(id) - 9 FROM companydetails_tb)`),
      query(`SELECT COUNT(*) AS total FROM shop_subscriptions_tb WHERE status IN ('active','trial')`),
      query(`SELECT COUNT(*) AS total FROM shop_subscriptions_tb ss JOIN plans_tb p ON ss.plan_id = p.id WHERE p.price > 0 AND ss.status = 'active'`),
      query(`SELECT COUNT(*) AS total FROM companydetails_tb WHERE is_active = 1`),
    ]);
    res.status(200).json({
      totalShops:      shops.total,
      activeShops:     activeShops.total,
      totalUsers:      users.total,
      totalProducts:   products.total,
      totalRevenue:    Number(revenue.total) + Number(ecomRev.total),
      posRevenue:      Number(revenue.total),
      ecomRevenue:     Number(ecomRev.total),
      newShopsRecent:  newShops.total,
      activeSubsCount: activeSubs.total,
      paidSubsCount:   paidSubs.total,
    });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── All shops ────────────────────────────────────────────────────────────────
exports.getAllShops = async (req, res) => {
  try {
    const shops = await query(`
      SELECT
        c.id, c.shop_code, c.name, c.email, c.city, c.country,
        c.contact_number, c.currency, c.logo, c.color, c.business_type,
        c.is_active,
        p.id            AS plan_id,
        p.display_name  AS plan_name,
        p.price         AS plan_price,
        ss.id           AS sub_id,
        ss.status       AS sub_status,
        ss.expires_at,
        ss.started_at,
        (SELECT COUNT(*) FROM users_tb u WHERE u.shop_code = c.shop_code) AS user_count,
        (SELECT COUNT(*) FROM products_tb pr WHERE pr.shop_code = c.shop_code) AS product_count,
        (SELECT COALESCE(SUM(s.TotalAmount),0) FROM sales_tb s WHERE s.shop_code = c.shop_code) AS pos_revenue,
        (SELECT COALESCE(SUM(e.total),0) FROM ecom_orders_tb e WHERE e.shop_code = c.shop_code AND e.status != 'cancelled') AS ecom_revenue,
        (SELECT MAX(l.log_date) FROM logs_tb l WHERE l.shop_code = c.shop_code) AS last_activity
      FROM companydetails_tb c
      LEFT JOIN shop_subscriptions_tb ss ON ss.shop_code = c.shop_code
      LEFT JOIN plans_tb p ON p.id = ss.plan_id
      ORDER BY c.id DESC
    `);
    res.status(200).json(shops.map(s => ({
      ...s,
      total_revenue: Number(s.pos_revenue) + Number(s.ecom_revenue),
      sub_expired:   s.expires_at && new Date(s.expires_at) < new Date(),
    })));
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Toggle shop active / inactive ───────────────────────────────────────────
exports.toggleShop = async (req, res) => {
  const { shop_code } = req.params;
  const { is_active } = req.body; // 1 = active, 0 = inactive
  if (is_active === undefined) return res.status(400).json({ message: 'is_active (0 or 1) required' });
  try {
    await query(`UPDATE companydetails_tb SET is_active = ? WHERE shop_code = ?`, [is_active ? 1 : 0, shop_code]);
    res.status(200).json({ message: `Shop ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Single shop detail ───────────────────────────────────────────────────────
exports.getShopDetail = async (req, res) => {
  const { shop_code } = req.params;
  try {
    const [shop] = await query(
      `SELECT c.*, p.id AS plan_id, p.display_name AS plan_name, p.price AS plan_price,
              ss.id AS sub_id, ss.status AS sub_status, ss.expires_at, ss.started_at
       FROM companydetails_tb c
       LEFT JOIN shop_subscriptions_tb ss ON ss.shop_code = c.shop_code
       LEFT JOIN plans_tb p ON p.id = ss.plan_id
       WHERE c.shop_code = ?`, [shop_code]
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const [users, products, revenue, recentLogs, plans] = await Promise.all([
      query(`SELECT id, RegNo, Name, Email, Role, Status, DOR FROM users_tb WHERE shop_code = ?`, [shop_code]),
      query(`SELECT COUNT(*) AS total FROM products_tb WHERE shop_code = ?`, [shop_code]),
      query(`SELECT COALESCE(SUM(TotalAmount),0) AS total FROM sales_tb WHERE shop_code = ?`, [shop_code]),
      query(`SELECT username, action, log_date FROM logs_tb WHERE shop_code = ? ORDER BY log_date DESC LIMIT 15`, [shop_code]),
      query(`SELECT id, display_name, name, price, currency FROM plans_tb WHERE is_active = 1 ORDER BY price ASC`),
    ]);

    res.status(200).json({
      ...shop,
      users,
      product_count: products[0].total,
      pos_revenue:   Number(revenue[0].total),
      recent_logs:   recentLogs,
      available_plans: plans,
    });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Toggle user on / off ─────────────────────────────────────────────────────
exports.toggleUser = async (req, res) => {
  const { user_id } = req.params;
  const { status }  = req.body; // 'active' or 'inactive'
  const allowed = ['active', 'inactive', 'suspended'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
  }
  try {
    const result = await query(`UPDATE users_tb SET Status = ? WHERE id = ?`, [status, user_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: `User status set to ${status}` });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Reset user password ──────────────────────────────────────────────────────
exports.resetUserPassword = async (req, res) => {
  const { user_id }     = req.params;
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  try {
    const hashed = await bcrypt.hash(new_password, 10);
    const result = await query(`UPDATE users_tb SET Password = ? WHERE id = ?`, [hashed, user_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Update shop subscription (plan + expiry) ─────────────────────────────────
exports.updateShopSubscription = async (req, res) => {
  const { shop_code }              = req.params;
  const { plan_id, expires_at, status } = req.body;
  if (!plan_id) return res.status(400).json({ message: 'plan_id is required' });
  try {
    const [plan] = await query(`SELECT * FROM plans_tb WHERE id = ?`, [plan_id]);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const startedAt = new Date().toISOString().slice(0, 10);
    const expiresAt = expires_at || new Date(Date.now() + plan.duration_days * 86400000).toISOString().slice(0, 10);
    const subStatus = status || 'active';

    await query(
      `INSERT INTO shop_subscriptions_tb (shop_code, plan_id, status, started_at, expires_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE plan_id=VALUES(plan_id), status=VALUES(status),
         started_at=VALUES(started_at), expires_at=VALUES(expires_at)`,
      [shop_code, plan_id, subStatus, startedAt, expiresAt]
    );
    res.status(200).json({ message: 'Subscription updated', plan: plan.display_name, expires_at: expiresAt });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Update plan price / details ─────────────────────────────────────────────
exports.updatePlanPrice = async (req, res) => {
  const { plan_id }                              = req.params;
  const { price, currency, display_name, duration_days } = req.body;
  if (price === undefined) return res.status(400).json({ message: 'price is required' });
  try {
    const fields = ['price = ?'];
    const values = [price];
    if (currency)      { fields.push('currency = ?');      values.push(currency); }
    if (display_name)  { fields.push('display_name = ?');  values.push(display_name); }
    if (duration_days) { fields.push('duration_days = ?'); values.push(duration_days); }
    values.push(plan_id);
    await query(`UPDATE plans_tb SET ${fields.join(', ')} WHERE id = ?`, values);
    res.status(200).json({ message: 'Plan updated successfully' });
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Revenue chart ────────────────────────────────────────────────────────────
exports.getRevenueChart = async (req, res) => {
  try {
    const posMonthly  = await query(`SELECT DATE_FORMAT(Date, '%Y-%m') AS month, COALESCE(SUM(TotalAmount),0) AS revenue FROM sales_tb WHERE Date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month ASC`);
    const ecomMonthly = await query(`SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COALESCE(SUM(total),0) AS revenue FROM ecom_orders_tb WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND status != 'cancelled' GROUP BY month ORDER BY month ASC`);
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    const posMap  = Object.fromEntries(posMonthly.map(r  => [r.month, Number(r.revenue)]));
    const ecomMap = Object.fromEntries(ecomMonthly.map(r => [r.month, Number(r.revenue)]));
    res.status(200).json(months.map(m => ({ month:m, pos:posMap[m]||0, ecom:ecomMap[m]||0, total:(posMap[m]||0)+(ecomMap[m]||0) })));
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Per-shop revenue ─────────────────────────────────────────────────────────
exports.getShopRevenue = async (req, res) => {
  try {
    const rows = await query(`SELECT c.shop_code, c.name, c.color, COALESCE(SUM(s.TotalAmount),0) AS pos_revenue, COALESCE((SELECT SUM(e.total) FROM ecom_orders_tb e WHERE e.shop_code=c.shop_code AND e.status!='cancelled'),0) AS ecom_revenue FROM companydetails_tb c LEFT JOIN sales_tb s ON s.shop_code=c.shop_code GROUP BY c.shop_code,c.name,c.color ORDER BY pos_revenue DESC LIMIT 10`);
    res.status(200).json(rows.map(r => ({ ...r, total:Number(r.pos_revenue)+Number(r.ecom_revenue) })));
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Activity feed ────────────────────────────────────────────────────────────
exports.getRecentActivity = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const logs = await query(`SELECT l.log_id, l.username, l.action, l.log_date, l.shop_code, c.name AS shop_name FROM logs_tb l LEFT JOIN companydetails_tb c ON c.shop_code=l.shop_code ORDER BY l.log_date DESC LIMIT ?`, [limit]);
    res.status(200).json(logs);
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};

// ─── Subscription stats ───────────────────────────────────────────────────────
exports.getSubscriptionStats = async (req, res) => {
  try {
    const byPlan = await query(`SELECT p.display_name AS plan, p.name AS plan_key, p.price, p.currency, COUNT(ss.id) AS count, SUM(CASE WHEN ss.status='active' THEN 1 ELSE 0 END) AS active_count, SUM(CASE WHEN ss.status='trial' THEN 1 ELSE 0 END) AS trial_count, SUM(CASE WHEN ss.status='expired' THEN 1 ELSE 0 END) AS expired_count FROM plans_tb p LEFT JOIN shop_subscriptions_tb ss ON ss.plan_id=p.id GROUP BY p.id,p.display_name,p.name,p.price,p.currency ORDER BY p.price ASC`);
    res.status(200).json(byPlan);
  } catch (err) { res.status(500).json({ message: 'DB error', error: err.message }); }
};
