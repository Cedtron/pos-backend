const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
const generateUniqueTrackingNumber = require('../conn/tracker');

// Wrap callback-based pool.query in a promise
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const deliveryController = {
  // Create new delivery from POS sale
  async createDelivery(req, res) {
    try {
      const { sale_id, shop_code } = req.body;

      if (!sale_id || !shop_code) {
        return res.status(400).json({ error: 'Sale ID and Shop Code are required' });
      }

      // Get sale details from POS sales table
      const saleRows = await query(
        'SELECT RegNo FROM sales_tb WHERE id = ? AND shop_code = ?',
        [sale_id, shop_code]
      );

      if (saleRows.length === 0) {
        return res.status(404).json({ error: 'Sale not found or not from this shop' });
      }

      const sale = saleRows[0];
      const trackingNumber = await generateUniqueTrackingNumber();
      const RegNo = await generateRegNo('DT', 'delivery_tracking');

      const result = await query(
        `INSERT INTO delivery_tracking
           (RegNo, source_regno, source_type, tracking_number, status, shop_code)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [RegNo, sale.RegNo, 'POS', trackingNumber, 'Processing', shop_code]
      );

      res.status(201).json({
        id: result.insertId,
        tracking_number: trackingNumber,
        message: 'POS delivery created successfully'
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all deliveries for a specific shop
  async getAllDeliveries(req, res) {
    try {
      const { shop_code } = req.query;

      if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
      }

      const rows = await query(
        'SELECT * FROM delivery_tracking WHERE shop_code = ? ORDER BY id DESC',
        [shop_code]
      );

      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single delivery with shop verification
  async getDeliveryById(req, res) {
    try {
      const { id } = req.params;
      const { shop_code } = req.query;

      if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
      }

      const rows = await query(
        'SELECT * FROM delivery_tracking WHERE id = ? AND shop_code = ?',
        [id, shop_code]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Delivery not found or not from this shop' });
      }

      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update delivery with shop verification
  async updateDelivery(req, res) {
    try {
      const { id } = req.params;
      const { shop_code } = req.body;
      const allowedFields = ['status', 'estimated_delivery', 'actual_delivery'];

      if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
      }

      // Verify delivery belongs to this shop first
      const verifyRows = await query(
        'SELECT id FROM delivery_tracking WHERE id = ? AND shop_code = ?',
        [id, shop_code]
      );

      if (verifyRows.length === 0) {
        return res.status(404).json({ error: 'Delivery not found or not from this shop' });
      }

      const fields = [];
      const values = [];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(id, shop_code);

      const result = await query(
        `UPDATE delivery_tracking SET ${fields.join(', ')} WHERE id = ? AND shop_code = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Delivery not updated' });
      }

      res.json({ message: 'Delivery updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete delivery with shop verification
  async deleteDelivery(req, res) {
    try {
      const { id } = req.params;
      const { shop_code } = req.body;

      if (!shop_code) {
        return res.status(400).json({ error: 'Shop code is required' });
      }

      const result = await query(
        'DELETE FROM delivery_tracking WHERE id = ? AND shop_code = ?',
        [id, shop_code]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Delivery not found or not from this shop' });
      }

      res.json({ message: 'Delivery deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Track delivery by tracking number
  async trackDelivery(req, res) {
    try {
      const { trackingNumber } = req.params;
      const { shop_code } = req.query;

      let sql = 'SELECT * FROM delivery_tracking WHERE tracking_number = ?';
      const params = [trackingNumber];

      if (shop_code) {
        sql += ' AND shop_code = ?';
        params.push(shop_code);
      }

      const rows = await query(sql, params);

      if (rows.length === 0) {
        return res.status(404).json({
          error: shop_code
            ? 'Delivery not found or not from this shop'
            : 'Delivery not found'
        });
      }

      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = deliveryController;