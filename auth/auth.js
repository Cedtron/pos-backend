const db = require('../conn/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
 
// Secret key for JWT
const JWT_SECRET = 'boombaala';

// Login a user
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    // Fetch user from signup_tb
    const sql = `SELECT * FROM signup_tb WHERE Email = ?`;
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Internal Server Error', error: err });
        }
        if (result.length === 0) {
       
            return res.status(401).send({ message: 'Invalid Email' });
        }

        const user = result[0];

        // Check password
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send({ message: 'Internal Server Error', error: err });
            }
            if (!isMatch) {
                console.log('Password does not match');
                return res.status(401).send({ message: 'Invalid password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.Email }, JWT_SECRET, { expiresIn: '1h' });

            // Get current time from the local machine
            const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Save login time in time_tb
            const timeSql = `INSERT INTO time_tb (Email, Time) VALUES (?, ?)`;
            db.query(timeSql, [email, currentTime], (err) => {
                if (err) {
                    return res.status(500).send({ message: 'Internal Server Error', error: err });
                }

                // Send response with the token and user information
                res.status(200).send({ 
                    message: 'Login successful', 
                    token,
                    user: {
                        id: user.id,
                        regNo: user.RegNo,
                        name: user.Name,
                        email: user.Email,
                        status: user.Status,
                        role: user.Role
                    }
                });
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
    res.status(200).send({ message: 'Token has been verified', user: req.user });
};
