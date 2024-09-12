const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

// Create a new customer
exports.createCustomer = async (req, res) => {
    const { name, address, contact_number, image, shop_code } = req.body;

    if (!name || !address || !contact_number || !shop_code) {
        return res.status(400).json({ message: 'Name, address, contact number, and shop code are required' });
    }

    try {
        // Check if customer with the same name already exists
        const checkSql = `SELECT id FROM customer_tb WHERE name = ?`;
        db.query(checkSql, [name], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Customer with this name already exists' });
            }

            // Generate RegNo
            const RegNo = await generateRegNo('C', 'customer_tb');

            // Insert new customer
            const insertSql = `INSERT INTO customer_tb (RegNo, name, address, contact_number, image, shop_code) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(insertSql, [RegNo, name, address, contact_number, image, shop_code], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error inserting customer', error: err.message });
                }
                res.status(201).json({ message: 'Customer created successfully', id: result.insertId });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating RegNo', error });
    }
};

// Read all customers
exports.getAllCustomers = (req, res) => {
    const sql = `SELECT * FROM customer_tb ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Read a single customer by ID
exports.getCustomerById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM customer_tb WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update a customer by ID
exports.updateCustomer = (req, res) => {
    const { id } = req.params;
    const { name, address, contact_number, image, shop_code } = req.body;

    const sql = `UPDATE customer_tb SET name = ?, address = ?, contact_number = ?, image = ?, shop_code = ? WHERE id = ?`;
    db.query(sql, [name, address, contact_number, image, shop_code, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer updated successfully' });
    });
};

// Delete a customer by ID
exports.deleteCustomer = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM customer_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    });
};
