const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
const { v4: uuidv4 } = require('uuid'); // For UUID generation

// Create a new display entry
exports.createDisplay = async (req, res) => {
    const { nav, shop_code } = req.body;
    const screen = req.body.screen || ''; // Default blank screen
    const user = req.body.RegNo; // Use RegNo from frontend

    if (!user || !nav || !shop_code) {
        return res.status(400).json({ message: 'User (RegNo), nav, and shop code are required' });
    }

    try {
        const RegNo = await generateRegNo('D', 'display_tb');
        const uuid = uuidv4(); // Generate UUID

        const insertSql = `INSERT INTO display_tb (uuid, RegNo, user, nav, screen, shop_code) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(insertSql, [uuid, RegNo, user, JSON.stringify(nav), screen, shop_code], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting display entry', error: err.message });
            }
            res.status(201).json({ message: 'Display entry created successfully', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating RegNo', error });
    }
};

// Fetch all display entries for a shop
exports.getDisplays = (req, res) => {
    const { shop_code } = req.query;
    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const selectSql = `SELECT * FROM display_tb WHERE shop_code = ? ORDER BY id DESC`;
    db.query(selectSql, [shop_code], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Fetch a single display entry by user (RegNo)
exports.getDisplayById = (req, res) => {
    const { regno } = req.params;
    const selectSql = `SELECT * FROM display_tb WHERE user = ?`;

    db.query(selectSql, [regno], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Display entry not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update display entry by user (RegNo)
exports.updateDisplay = (req, res) => {
    const { regno } = req.params;
    const { nav } = req.body;
    const user = regno;

    if (!nav) {
        return res.status(400).json({ message: 'Nav must be provided' });
    }

    const selectSql = `SELECT nav FROM display_tb WHERE user = ?`;
    db.query(selectSql, [regno], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving display entry', error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Display entry not found' });
        }

        const existingNav = JSON.parse(result[0].nav || '{}');
        const updatedNav = { ...existingNav, ...nav };

        const updateSql = `UPDATE display_tb SET nav = ?, sync_status = 0 WHERE user = ?`;
        db.query(updateSql, [JSON.stringify(updatedNav), user], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Error updating display entry', error: updateErr.message });
            }
            res.status(200).json({ message: 'Display entry updated successfully' });
        });
    });
};

// Delete a display entry by ID (soft delete)
exports.deleteDisplay = (req, res) => {
    const { id } = req.params;
    const deleteSql = `UPDATE display_tb SET deleted_at = CURRENT_TIMESTAMP, sync_status = 0 WHERE id = ?`;

    db.query(deleteSql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting display entry', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Display entry not found' });
        }
        res.status(200).json({ message: 'Display entry deleted successfully' });
    });
};
