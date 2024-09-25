const db = require('../conn/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateRegNo = require('../conn/reg'); 
// Secret key for JWT
const JWT_SECRET = 'boombaala';

// Login a user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from users_tb
        const sql = `SELECT * FROM users_tb WHERE Email = ?`;
        db.query(sql, [email], async (err, result) => {
            if (err) {
                return res.status(500).send({ message: 'Internal Server Error', error: err });
            }
            if (result.length === 0) {
                return res.status(401).send({ message: 'Invalid Email' });
            }

            const user = result[0];

            // Check password
            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                console.log('Password does not match');
                return res.status(401).send({ message: 'Invalid password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.Email }, JWT_SECRET, { expiresIn: '1h' });

            // Generate a new RegNo for the log entry
            const logRegNo = await generateRegNo('L', 'logs_tb');

            // Get current time from the local machine
            const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Insert log entry into logs_tb
            const logSql = `INSERT INTO logs_tb (RegNo, username, action, log_date, shop_code) VALUES (?, ?, ?, ?, ?)`;
            db.query(logSql, [logRegNo, user.Name, 'User login', currentTime, user.shop_code], (err) => {
                if (err) {
                    console.error('Error inserting log entry:', err);
                }
            });

            // Assuming you already have the necessary imports and setup

const currencySql = `SELECT currency FROM companydetails_tb WHERE shop_code = ?`;
db.query(currencySql, [user.shop_code], (err, currencyResult) => {
    if (err) {
        console.error('Error fetching currency:', err);
        return res.status(500).send({ message: 'Internal Server Error', error: err });
    }

    // Default currency to null if not found
    const currency = currencyResult.length > 0 ? currencyResult[0].currency : null;

    // Fetch screen and nav data from display table
    const displaySql = `SELECT screen, nav FROM display_tb WHERE RegNo = ?`;
    db.query(displaySql, [user.RegNo], (err, displayResult) => {
        if (err) {
            console.error('Error fetching display data:', err);
            return res.status(500).send({ message: 'Internal Server Error', error: err });
        }

        // Prepare the display data
        const displayData = displayResult.map(row => ({
            screen: row.screen,
            nav: row.nav
        }));

        // Send response with the token, user information, currency, and display data
        res.status(200).send({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                regNo: user.RegNo,
                name: user.Name,
                email: user.Email,
                status: user.Status,
                shop: user.shop_code,
                role: user.Role,
                currency, // Include the currency in the user object
                display: displayData // Include display data
            }
        });
 

           
                });
            });
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ message: 'Internal Server Error', error: err });
    }
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
