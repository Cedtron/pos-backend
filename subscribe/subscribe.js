const db = require('../conn/db');

// ─── Helper: query as promise ────────────────────────────────────────────────
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

// ─────────────────────────────────────────────────────────────────────────────
// PLANS (super-admin)
// ─────────────────────────────────────────────────────────────────────────────

// GET all plans with their features
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await query(`SELECT * FROM plans_tb WHERE is_active = 1 ORDER BY price ASC`);

    // Attach feature keys to each plan
    for (const plan of plans) {
      const features = await query(
        `SELECT feature_key FROM plan_features_tb WHERE plan_id = ?`,
        [plan.id]
      );
      plan.features = features.map(f => f.feature_key);
    }

    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// GET single plan
exports.getPlanById = async (req, res) => {
  try {
    const [plan] = await query(`SELECT * FROM plans_tb WHERE id = ?`, [req.params.id]);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const features = await query(
      `SELECT feature_key FROM plan_features_tb WHERE plan_id = ?`,
      [plan.id]
    );
    plan.features = features.map(f => f.feature_key);
    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// POST create plan (super-admin only)
exports.createPlan = async (req, res) => {
  const { name, display_name, price, currency, duration_days, description, features = [] } = req.body;
  if (!name || !display_name || price === undefined) {
    return res.status(400).json({ message: 'name, display_name, and price are required' });
  }
  try {
    const result = await query(
      `INSERT INTO plans_tb (name, display_name, price, currency, duration_days, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, display_name, price, currency || 'UGX', duration_days || 30, description || '']
    );
    const planId = result.insertId;

    // Insert features
    for (const key of features) {
      await query(
        `INSERT IGNORE INTO plan_features_tb (plan_id, feature_key) VALUES (?, ?)`,
        [planId, key]
      );
    }

    res.status(201).json({ id: planId, message: 'Plan created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Plan name already exists' });
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// PUT update plan price + features (super-admin only)
exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { display_name, price, currency, duration_days, description, features } = req.body;

  try {
    const fields  = [];
    const values  = [];

    if (display_name   !== undefined) { fields.push('display_name = ?');  values.push(display_name); }
    if (price          !== undefined) { fields.push('price = ?');         values.push(price); }
    if (currency       !== undefined) { fields.push('currency = ?');      values.push(currency); }
    if (duration_days  !== undefined) { fields.push('duration_days = ?'); values.push(duration_days); }
    if (description    !== undefined) { fields.push('description = ?');   values.push(description); }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE plans_tb SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    // Replace features if provided
    if (Array.isArray(features)) {
      await query(`DELETE FROM plan_features_tb WHERE plan_id = ?`, [id]);
      for (const key of features) {
        await query(
          `INSERT IGNORE INTO plan_features_tb (plan_id, feature_key) VALUES (?, ?)`,
          [id, key]
        );
      }
    }

    res.status(200).json({ message: 'Plan updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// DELETE (soft-delete: set is_active = 0)
exports.deletePlan = async (req, res) => {
  try {
    await query(`UPDATE plans_tb SET is_active = 0 WHERE id = ?`, [req.params.id]);
    res.status(200).json({ message: 'Plan deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SHOP SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────

// GET shop's current subscription + plan features
exports.getShopSubscription = async (req, res) => {
  const { shop_code } = req.params;
  try {
    const rows = await query(
      `SELECT ss.*, p.name AS plan_name, p.display_name, p.price, p.currency, p.duration_days
       FROM shop_subscriptions_tb ss
       JOIN plans_tb p ON ss.plan_id = p.id
       WHERE ss.shop_code = ?`,
      [shop_code]
    );

    if (rows.length === 0) {
      // No subscription record — return free plan defaults
      return res.status(200).json({
        shop_code,
        plan_name: 'free',
        display_name: 'Free',
        status: 'active',
        features: ['dashboard', 'pos', 'products', 'categories', 'customers'],
        expires_at: null,
      });
    }

    const sub = rows[0];

    // Auto-expire if past expiry
    if (sub.expires_at && new Date(sub.expires_at) < new Date() && sub.status === 'active') {
      await query(
        `UPDATE shop_subscriptions_tb SET status = 'expired' WHERE shop_code = ?`,
        [shop_code]
      );
      sub.status = 'expired';
    }

    const features = await query(
      `SELECT feature_key FROM plan_features_tb WHERE plan_id = ?`,
      [sub.plan_id]
    );
    sub.features = features.map(f => f.feature_key);

    res.status(200).json(sub);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// POST subscribe shop to a plan (or upgrade)
exports.subscribeToPlan = async (req, res) => {
  const { shop_code, plan_id, payment_ref } = req.body;
  if (!shop_code || !plan_id) {
    return res.status(400).json({ message: 'shop_code and plan_id are required' });
  }

  try {
    const [plan] = await query(`SELECT * FROM plans_tb WHERE id = ? AND is_active = 1`, [plan_id]);
    if (!plan) return res.status(404).json({ message: 'Plan not found or inactive' });

    const startedAt  = new Date().toISOString().slice(0, 10);
    const expiresAt  = new Date(Date.now() + plan.duration_days * 86400000).toISOString().slice(0, 10);

    // Upsert — update if shop already has a record
    await query(
      `INSERT INTO shop_subscriptions_tb (shop_code, plan_id, status, started_at, expires_at, payment_ref)
       VALUES (?, ?, 'active', ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         plan_id = VALUES(plan_id),
         status = 'active',
         started_at = VALUES(started_at),
         expires_at = VALUES(expires_at),
         payment_ref = VALUES(payment_ref)`,
      [shop_code, plan_id, startedAt, expiresAt, payment_ref || null]
    );

    res.status(200).json({
      message: `Subscribed to ${plan.display_name} plan`,
      plan_name: plan.name,
      expires_at: expiresAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// GET all subscriptions (super-admin)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const rows = await query(
      `SELECT ss.*, p.name AS plan_name, p.display_name, p.price, p.currency
       FROM shop_subscriptions_tb ss
       JOIN plans_tb p ON ss.plan_id = p.id
       ORDER BY ss.updated_at DESC`
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE GATE CHECK (called by frontend or middleware)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/can-access/:shop_code/:feature_key
// Returns { allowed: true/false, plan: 'free'/'pro'/... }
exports.checkFeatureAccess = async (req, res) => {
  const { shop_code, feature_key } = req.params;
  try {
    const rows = await query(
      `SELECT pf.feature_key, p.name AS plan_name, ss.status, ss.expires_at
       FROM shop_subscriptions_tb ss
       JOIN plans_tb p ON ss.plan_id = p.id
       JOIN plan_features_tb pf ON pf.plan_id = p.id
       WHERE ss.shop_code = ? AND pf.feature_key = ?`,
      [shop_code, feature_key]
    );

    if (rows.length === 0) {
      return res.status(200).json({ allowed: false, plan: 'free' });
    }

    const row     = rows[0];
    const expired = row.expires_at && new Date(row.expires_at) < new Date();
    const active  = row.status === 'active' || row.status === 'trial';

    res.status(200).json({
      allowed:   active && !expired,
      plan:      row.plan_name,
      status:    row.status,
      expiresAt: row.expires_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};
