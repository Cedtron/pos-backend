const db = require('../conn/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Login a user
exports.loginUser = (req, res) => {
    const { Email, Password } = req.body;
    
    // Fetch user from signup_tb
    const sql = `SELECT * FROM signup_tb WHERE Email = ?`;
    db.query(sql, [Email], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(401).send({ message: 'Invalid Email or password' });
        }

        const user = result[0];

        // Check password
        bcrypt.compare(Password, user.Password, (err, isMatch) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid Email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, Email: user.Email }, JWT_SECRET, { expiresIn: '1h' });

            // Save login time in time_tb
            const timeSql = `INSERT INTO time_tb (Email, Time) VALUES (?, NOW())`;
            db.query(timeSql, [Email], (err) => {
                if (err) {
                    return res.status(500).send(err);
                }

                // Set cookie with the token
                res.cookie('token', token, { httpOnly: true });
                res.status(200).send({ message: 'Login successful' });
            });
        });
    });
};

// Logout a user
exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: 'Logout successful' });
};

// Protected route example
exports.protectedRoute = (req, res) => {
    res.status(200).send({ message: 'You have access to this protected route', user: req.user });
};
