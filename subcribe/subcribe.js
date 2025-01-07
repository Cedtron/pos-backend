const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

async function createSubscription(req, res) {
  const { shop_code, subscription_date, expiry_date, status } = req.body;
  const RegNo = await generateRegNo('S', 'subscription_tb');

  const query = `
    INSERT INTO subscription_tb (RegNo, shop_code, subscription_date, expiry_date, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [RegNo, shop_code, subscription_date, expiry_date, status], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Subscription created successfully', id: result.insertId });
  });
}

async function getSubscriptions(req, res) {
  const query = 'SELECT * FROM subscription_tb';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
}

async function getSubscriptionById(req, res) {
  const { id } = req.params;
  const query = 'SELECT * FROM subscription_tb WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results[0]);
  });
}

async function updateSubscription(req, res) {
  const { id } = req.params;
  const { shop_code, subscription_date, expiry_date, status } = req.body;
  const query = `
    UPDATE subscription_tb
    SET shop_code = ?, subscription_date = ?, expiry_date = ?, status = ?
    WHERE id = ?
  `;

  db.query(query, [shop_code, subscription_date, expiry_date, status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Subscription updated successfully' });
  });
}

async function deleteSubscription(req, res) {
  const { id } = req.params;
  const query = 'DELETE FROM subscription_tb WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Subscription deleted successfully' });
  });
}

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription
};