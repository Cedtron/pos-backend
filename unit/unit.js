const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new unit
exports.createUnit = async (req, res) => {
    const { name, description, shop_code } = req.body;

    if (!name || !shop_code) {
        return res.status(400).json({ message: 'Name and shop_code are required' });
    }

    // Check if the unit already exists
    const checkSql = `SELECT * FROM unit_tb WHERE name = ?`;
    db.query(checkSql, [name], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Unit already exists' });
        }

        try {
            // Generate RegNo
            const RegNo = await generateRegNo('U', 'unit_tb');

            // Insert new unit
            const insertSql = `INSERT INTO unit_tb (RegNo, name, description, shop_code) VALUES (?, ?, ?, ?)`;
            db.query(insertSql, [RegNo, name, description, shop_code], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error inserting unit', error: err.message });
                }
                res.status(201).json({ message: 'Unit created successfully', id: result.insertId });
            });
        } catch (error) {
            res.status(500).json({ message: 'Error generating RegNo', error });
        }
    });
};

// Read all units
exports.getAllUnits = (req, res) => {
    const sql = `SELECT * FROM unit_tb ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Read a single unit by ID
exports.getUnitById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM unit_tb WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update a unit by ID
exports.updateUnit = (req, res) => {
    const { id } = req.params;
    const { name, description, shop_code } = req.body;

    const sql = `UPDATE unit_tb SET name = ?, description = ?, shop_code = ? WHERE id = ?`;
    db.query(sql, [name, description, shop_code, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.status(200).json({ message: 'Unit updated successfully' });
    });
};

// Delete a unit by ID
exports.deleteUnit = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM unit_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.status(200).json({ message: 'Unit deleted successfully' });
    });
};
