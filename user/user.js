const db = require('../conn/db');
const bcrypt = require('bcrypt');

// Create a new signup entry
exports.createSignup = async (req, res) => {
    const { Name, Email, Password,  passhint} = req.body;

    const RegNo = 'RG001'; // Static value for RegNo
    const Role = 'Saler'; // Static value for Role
    const Status = 'active'; // Static value for Status
    const localDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Local date in YYYY-MM-DD HH:MM:SS format

    try {
        const emailCheckSql = 'SELECT Email FROM signup_tb WHERE Email = ?';
        db.query(emailCheckSql, [Email], async (err, result) => {
            if (err) {
                return res.status(500).send({ message: 'Database query error', error: err });
            }

            if (result.length > 0) {
                return res.status(400).send({ message: 'Email already exists' });
            } else {
                try {
                    const hashedPassword = await bcrypt.hash(Password, 10);
                    const insertSql = `INSERT INTO signup_tb (RegNo, Name, Email, Password, Status, Role, passhint, DOR) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.query(insertSql, [RegNo, Name, Email, hashedPassword, Status, Role, passhint, localDate], (err, result) => {
                        if (err) {
                           
                            return res.status(500).send({ message: 'Database insertion error', error: err });
                        }
                        res.status(201).send({ id: result.insertId });
                    });
                } catch (hashError) {
                 
                    return res.status(500).send({ message: 'Password hashing error', error: hashError });
                }
            }
        });
    } catch (err) {
       
        return res.status(500).send({ message: 'Unexpected server error', error: err });
    }
};
// Update a signup entry by ID
exports.updateSignup = async (req, res) => {
    const { id } = req.params;
    const { RegNo, Name, Email, Password, confirmPassword, Status, Role, passhint, DOR } = req.body;

    console.log('Request received to update user:', id);
    console.log('Request body:', req.body);

    if (Password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    try {
        console.log('Hashing password...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const sql = `UPDATE signup_tb SET RegNo = ?, Name = ?, Email = ?, Password = ?, Status = ?, Role = ?, passhint = ?, DOR = ? WHERE id = ?`;
        console.log('Executing SQL query:', sql);
        db.query(sql, [RegNo, Name, Email, hashedPassword, Status, Role, passhint, DOR, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send(err);
            }
            if (result.affectedRows === 0) {
                console.log('No rows affected, signup entry not found');
                return res.status(404).send({ message: 'Signup entry not found' });
            }
            console.log('Signup entry updated successfully');
            res.status(200).send({ message: 'Signup entry updated successfully' });
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send(err);
    }
};

// Read all signup entries
exports.getAllSignups = (req, res) => {
    const sql = `SELECT * FROM signup_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single signup entry by ID
exports.getSignupById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM signup_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Signup entry not found' });
        }
        res.status(200).send(result[0]);
    });
};



// Delete a signup entry by ID
exports.deleteSignup = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM signup_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Signup entry not found' });
        }
        res.status(200).send({ message: 'Signup entry deleted successfully' });
    });
};
