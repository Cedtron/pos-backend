const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

// Create a new display entry
exports.createDisplay = async (req, res) => {
    const { user, nav, screen, shop_code } = req.body;

    if (!user || !nav || !screen || !shop_code) {
        return res.status(400).json({ message: 'User, nav, screen, and shop code are required' });
    }

    try {
        // Generate RegNo
        const RegNo = await generateRegNo('D', 'display_tb');

        // Insert new display entry
        const insertSql = `INSERT INTO display_tb (RegNo, user, nav, screen, shop_code) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertSql, [RegNo, user, nav, screen, shop_code], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting display entry', error: err.message });
            }
            res.status(201).json({ message: 'Display entry created successfully', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating RegNo', error });
    }
};

// Get all display entries
exports.getDisplays = (req, res) => {
    const selectSql = `SELECT * FROM display_tb`;
    db.query(selectSql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Get a single display entry by ID
exports.getDisplayById = (req, res) => {
    const { id } = req.params;
    const selectSql = `SELECT * FROM display_tb WHERE id = ?`;
    db.query(selectSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Display entry not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update a display entry by ID
exports.updateDisplay = (req, res) => {
    const { id } = req.params;
    const { user, nav, screen } = req.body;

    // Check if at least one field is provided
    if (!user && !nav && !screen) {
        return res.status(400).json({ message: 'At least one field (user, nav, or screen) must be provided' });
    }

    // Build the SQL query dynamically
    let updateFields = [];
    let values = [];

    if (user) {
        updateFields.push('user = ?');
        values.push(user);
    }
    if (nav) {
        updateFields.push('nav = ?');
        values.push(nav);
    }
    if (screen) {
        updateFields.push('screen = ?');
        values.push(screen);
    }

    // Add the id to the values array for the WHERE clause
    values.push(id);

    // Join the fields to form the SQL query
    const updateSql = `UPDATE display_tb SET ${updateFields.join(', ')} WHERE id = ?`;

    db.query(updateSql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating display entry', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Display entry not found' });
        }
        res.status(200).json({ message: 'Display entry updated successfully' });
    });
};


// Delete a display entry by ID
exports.deleteDisplay = (req, res) => {
    const { id } = req.params;
    const deleteSql = `DELETE FROM display_tb WHERE id = ?`;
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
