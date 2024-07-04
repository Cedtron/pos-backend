const db = require('../conn/db');
const bcrypt = require('bcrypt');

// Check if email exists
exports.checkEmail = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Query to check if the email exists in the database
    const sql = `SELECT * FROM signup_tb WHERE Email = ?`;

    db.query(sql, [email], (err, results) => {
        if (err) {
            // console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if any row was returned
        if (results.length > 0) {
            return res.json({ exists: true }); // Email found
            // console.log("Email found")
        } else {
            return res.json({ exists: false }); // Email not found
            // console.log("Email not found")
        }
    });
};

// Confirm passhint code
exports.confirmCode = (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Code are required' });
    }

    const sql = `SELECT * FROM signup_tb WHERE Email = ?`;
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
            // console.log("Internal Server Error")
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
            // console.log("No email")
        }

        const user = result[0];
        const isMatch = code === user.passhint;

        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect code' });
        }

        res.json({ correct: true });
    });
};

// Update password
exports.updatePassword = (req, res) => {
    const { email, password } = req.body;
    const sqlSelect = `SELECT * FROM signup_tb WHERE Email = ?`;
    const sqlUpdate = `UPDATE signup_tb SET Password = ? WHERE Email = ?`;

    db.query(sqlSelect, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Email not found or incorrect code' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(sqlUpdate, [hashedPassword, email], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ success: true });
        });
    });
};
