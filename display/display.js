const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

// Create a new display entry
exports.createDisplay = async (req, res) => {
    const { nav, shop_code } = req.body; // Get nav and shop_code from the request body
    const screen = ''; // Set screen to blank as per your requirement
    const user = req.body.RegNo; // Use RegNo from the frontend to align it as the 'user'

    if (!user || !nav || !shop_code) {
        return res.status(400).json({ message: 'User (RegNo), nav, and shop code are required' });
    }

    try {
        // Generate a unique RegNo for the display entry
        const RegNo = await generateRegNo('D', 'display_tb');

        // Prepare SQL for inserting the display entry
        const insertSql = `INSERT INTO display_tb (RegNo, user, nav, screen, shop_code) VALUES (?, ?, ?, ?, ?)`;

        // Execute the query to insert the display entry into the database
        db.query(insertSql, [RegNo, user, JSON.stringify(nav), screen, shop_code], (err, result) => {
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
    const { regno } = req.params; // Ensure this matches your route parameter
    const selectSql = `SELECT * FROM display_tb WHERE user = ?`;

    console.log('Fetching display for RegNo:', regno); // Log the RegNo being searched

    db.query(selectSql, [regno], (err, results) => {
        if (err) {
            console.error('Database error:', err.message); // Log the error
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
    const { regno } = req.params; 
    const { user, nav } = req.body;

    // Check if at least one field is provided
    if (!user && !nav) {
        return res.status(400).json({ message: 'At least one field (user or nav) must be provided' });
    }

    // First, retrieve the current nav value
    const selectSql = `SELECT nav FROM display_tb WHERE regno = ?`;
    db.query(selectSql, [regno], (selectErr, selectResult) => {
        if (selectErr) {
            return res.status(500).json({ message: 'Error retrieving display entry', error: selectErr.message });
        }
        if (selectResult.length === 0) {
            return res.status(404).json({ message: 'Display entry not found' });
        }

        // Parse the existing nav data
        let existingNav = JSON.parse(selectResult[0].nav);

        // Update the existing nav with the new values
        if (nav) {
            existingNav = { ...existingNav, ...nav }; // Merge new nav values
        }

        // Prepare the SQL update statement
        let updateFields = [];
        let values = [];

        if (user) {
            updateFields.push('user = ?');
            values.push(user);
        }

        // Update the nav field
        updateFields.push('nav = ?');
        values.push(JSON.stringify(existingNav)); // Convert updated nav object back to JSON string

        // Add the regno to the values array for the WHERE clause
        values.push(regno);

        // Construct the update SQL query
        const updateSql = `UPDATE display_tb SET ${updateFields.join(', ')} WHERE user = ?`;

        db.query(updateSql, values, (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Error updating display entry', error: updateErr.message });
            }
            res.status(200).json({ message: 'Display entry updated successfully' });
        });
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
