const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new supplier
exports.createSupplier = async (req, res) => {
    const { supplier_name, address, contact_number, contact_person, shop_code } = req.body;

    if (!supplier_name || !address || !contact_number || !contact_person || !shop_code) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the supplier already exists
    const checkSql = `SELECT * FROM suppliers_tb WHERE supplier_name = ? AND shop_code = ?`;
    db.query(checkSql, [supplier_name, shop_code], async (err, results) => {
       if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Supplier already exists' });
        }

        try {
            // Generate RegNo
            const RegNo = await generateRegNo('S', 'suppliers_tb');

            // Insert new supplier
            const insertSql = `INSERT INTO suppliers_tb (RegNo, supplier_name, address, contact_number, contact_person, shop_code) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(insertSql, [RegNo, supplier_name, address, contact_number, contact_person, shop_code], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error inserting supplier', error: err.message });
                }
                res.status(201).json({ message: 'Supplier created successfully', id: result.insertId });
            });
        } catch (error) {
            res.status(500).json({ message: 'Error generating RegNo', error });
        }
    });
};

// Read all suppliers
exports.getAllSuppliers = (req, res) => {
    const { shop_code } = req.query;
    let sql = `SELECT * FROM suppliers_tb`;
    const params = [];

    if (shop_code) {
        sql += ` WHERE shop_code = ?`;
        params.push(shop_code);
    }

    sql += ` ORDER BY id DESC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Read a single supplier by ID
exports.getSupplierById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM suppliers_tb WHERE supplier_id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update a supplier by ID
exports.updateSupplier = (req, res) => {
    const { id } = req.params;
    const { supplier_name, address, contact_number, contact_person, shop_code } = req.body;

    const sql = `UPDATE suppliers_tb SET supplier_name = ?, address = ?, contact_number = ?, contact_person = ?, shop_code = ? WHERE supplier_id = ?`;
    db.query(sql, [supplier_name, address, contact_number, contact_person, shop_code, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json({ message: 'Supplier updated successfully' });
    });
};

// Delete a supplier by ID
exports.deleteSupplier = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM suppliers_tb WHERE supplier_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json({ message: 'Supplier deleted successfully' });
    });
};