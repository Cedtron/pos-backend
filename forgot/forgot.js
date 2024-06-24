const db = require('../conn/db');
const bcrypt = require('bcrypt');

// Check if email exists
exports.checkEmail = (req, res) => {
    const { email } = req.body;
    const sql = `SELECT * FROM signup_tb WHERE Username = ?`;
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }
        res.json({ exists: true });
    });
};

// Confirm passhint code
exports.confirmCode = (req, res) => {
    const { email, code } = req.body;
    const sql = `SELECT * FROM signup_tb WHERE Username = ?`;
    db.query(sql, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(code, user.passhint);

        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect code' });
        }

        res.json({ correct: true });
    });
};

// Update password
exports.updatePassword = (req, res) => {
    const { email, password } = req.body;
    const sqlSelect = `SELECT * FROM signup_tb WHERE Username = ?`;
    const sqlUpdate = `UPDATE signup_tb SET Password = ? WHERE Username = ?`;

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
