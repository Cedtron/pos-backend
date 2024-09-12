const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new stock entry
exports.createStock = async (req, res) => {
    const { product_code, quantity, reason, shop_code } = req.body;

    if (!product_code || !quantity || !shop_code) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        // Generate RegNo
        const RegNo = await generateRegNo('S', 'stock_tb');

        // Insert new stock entry
        const insertSql = `INSERT INTO stock_tb (RegNo, product_code, quantity, reason, shop_code) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertSql, [RegNo, product_code, quantity, reason, shop_code], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting stock entry', error: err.message });
            }
            res.status(201).json({ message: 'Stock entry created successfully', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating RegNo', error });
    }
};

// Read all stock entries
exports.getAllStocks = (req, res) => {
    const sql = `SELECT * FROM stock_tb ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Read a single stock entry by ID
exports.getStockById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM stock_tb WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Stock entry not found' });
        }
        res.status(200).json(results[0]);
    });
};


// Read a single stock entry by RegNo
exports.getStockByRegNo = (req, res) => {
    const { RegNo } = req.params; // Get RegNo from URL parameters
    const { shop_code } = req.query; // Get shop_code from query parameters
    const sql = `SELECT * FROM stock_tb WHERE product_code = ? AND shop_code = ?`;
    
    db.query(sql, [RegNo, shop_code], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No stock entries found for this product and shop' });
        }
        
        // Return all matching stock entries
        res.status(200).json(results);
    });
};

// Update a stock entry by ID
exports.updateStock = (req, res) => {
    const { id } = req.params;
    const { product_code, quantity, reason, shop_code } = req.body;

    const sql = `UPDATE stock_tb SET product_code = ?, quantity = ?, reason = ?, shop_code = ? WHERE id = ?`;
    db.query(sql, [product_code, quantity, reason, shop_code, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Stock entry not found' });
        }
        res.status(200).json({ message: 'Stock entry updated successfully' });
    });
};

// Delete a stock entry by ID
exports.deleteStock = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM stock_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Stock entry not found' });
        }
        res.status(200).json({ message: 'Stock entry deleted successfully' });
    });
};
