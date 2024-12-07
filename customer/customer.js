const db = require('../conn/db');
const generateRegNo = require('../conn/reg');


// Create a new customer
exports.createCustomer = async (req, res) => {
    const { name, address, contact_number, image, shop_code } = req.body;

    if (!name || !address || !contact_number || !shop_code) {
        return res.status(400).json({ message: 'Name, address, contact number, and shop code are required' });
    }

    try {
        const uuid = require('uuid').v4(); // Generate a unique UUID
        const RegNo = await generateRegNo('C', 'customer_tb'); // Generate RegNo

        // Insert the new customer into the database
        const sql = `
            INSERT INTO customer_tb (uuid, RegNo, name, address, contact_number, image, shop_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [uuid, RegNo, name, address, contact_number, image, shop_code], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            res.status(201).json({ message: 'Customer created successfully', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error });
    }
};


// Read all customers
exports.getAllCustomers = (req, res) => {
    const { shop_code } = req.query;

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `SELECT * FROM customer_tb WHERE shop_code = ? ORDER BY id DESC`;
    db.query(sql, [shop_code], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};


// Read a single customer by ID
exports.getAllCustomers = (req, res) => {
    const { shop_code } = req.query;

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `SELECT * FROM customer_tb WHERE shop_code = ? ORDER BY id DESC`;
    db.query(sql, [shop_code], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

exports.getCustomerById = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query;

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `SELECT * FROM customer_tb WHERE id = ? AND shop_code = ?`;
    db.query(sql, [id, shop_code], (err, results) => {
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

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `
        UPDATE customer_tb
        SET name = ?, address = ?, contact_number = ?, image = ?, shop_code = ?, sync_status = 0
        WHERE id = ? AND shop_code = ?
    `;
    db.query(sql, [name, address, contact_number, image, shop_code, id, shop_code], (err, result) => {
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
    const { shop_code } = req.query;

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `DELETE FROM customer_tb WHERE id = ? AND shop_code = ?`;
    db.query(sql, [id, shop_code], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    });
};

