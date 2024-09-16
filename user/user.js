const db = require('../conn/db');
const bcrypt = require('bcrypt');
const generateRegNo = require('../conn/reg');

// Create a new user entry
exports.createSignup = async (req, res) => {
    const { Name, Email, Password, passhint, Role, company_name } = req.body; // Include company_name

    const Status = 'active'; // Static value for Status
    const localDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Local date in YYYY-MM-DD HH:MM:SS format

    try {
        // Step 1: Check if the email exists
        const emailCheckSql = 'SELECT Email FROM users_tb WHERE Email = ?';
        db.query(emailCheckSql, [Email], async (err, result) => {
            if (err) {
                return res.status(500).send({ message: 'Database query error', error: err });
            }

            if (result.length > 0) {
                return res.status(400).send({ message: 'Email already exists' });
            } else {
                // Step 2: Determine how to retrieve the shop_code
                let shopCodeSql;
                let params;

                if (company_name) {
                    // If company_name is provided, query by company_name
                    shopCodeSql = 'SELECT shop_code FROM companydetails_tb WHERE company_name = ?';
                    params = [company_name];
                } else {
                    // If company_name is null, get the first shop_code from companydetails_tb
                    shopCodeSql = 'SELECT shop_code FROM companydetails_tb LIMIT 1';
                    params = [];
                }

                db.query(shopCodeSql, params, async (err, companyResult) => {
                    if (err) {
                        return res.status(500).send({ message: 'Error retrieving company details', error: err });
                    }

                    if (companyResult.length === 0) {
                        return res.status(400).send({ message: 'No company found' });
                    }

                    const shop_code = companyResult[0].shop_code; // Get the shop_code from the result

                    try {
                        const hashedPassword = await bcrypt.hash(Password, 10);
                        const RegNo = await generateRegNo('R', 'users_tb'); // Generate unique RegNo

                        // Step 3: Insert the new user with the retrieved shop_code
                        const insertSql = `INSERT INTO users_tb (RegNo, Name, Email, Password, Status, Role, passhint, DOR, shop_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        db.query(insertSql, [RegNo, Name, Email, hashedPassword, Status, Role, passhint, localDate, shop_code], (err, result) => {
                            if (err) {
                                return res.status(500).send({ message: 'Database insertion error', error: err });
                            }
                            res.status(201).send({ id: result.insertId });
                        });
                    } catch (hashError) {
                        return res.status(500).send({ message: 'Password hashing error', error: hashError });
                    }
                });
            }
        });
    } catch (err) {
        return res.status(500).send({ message: 'Unexpected server error', error: err });
    }
};

// Read all users
exports.getAllSignups = (req, res) => {
    const sql = `SELECT * FROM users_tb ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single user by ID
exports.getSignupById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM users_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update a user entry by ID
exports.updateSignup = async (req, res) => {
    const { id } = req.params;
    const { RegNo, Name, Email, Password, confirmPassword, Status, Role, passhint, DOR } = req.body;

    // Check if passwords match only if Password is provided
    if (Password && Password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    try {
        let updates = [];
        let values = [];

        // Check if each field is present and prepare the update statement accordingly
        if (RegNo) {
            updates.push('RegNo = ?');
            values.push(RegNo);
        }
        if (Name) {
            updates.push('Name = ?');
            values.push(Name);
        }
        if (Email) {
            updates.push('Email = ?');
            values.push(Email);
        }
        if (Password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(Password, saltRounds);
            updates.push('Password = ?');
            values.push(hashedPassword);
        }
        if (Status) {
            updates.push('Status = ?');
            values.push(Status);
        }
        if (Role) {
            updates.push('Role = ?');
            values.push(Role);
        }
        if (passhint) {
            updates.push('passhint = ?');
            values.push(passhint);
        }
        if (DOR) {
            updates.push('DOR = ?');
            values.push(DOR);
        }

        // If no updates were made, return a 400 response
        if (updates.length === 0) {
            return res.status(400).send({ message: 'No fields to update' });
        }

        // Construct the SQL query
        const sql = `UPDATE users_tb SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id); // Add id to the values

        // Execute the update query
        db.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.status(200).send({ message: 'User updated successfully' });
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

// Delete a user by ID
exports.deleteSignup = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM users_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    });
};
