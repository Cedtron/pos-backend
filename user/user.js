const db = require('../conn/db');
const bcrypt = require('bcrypt');

// Create a new signup entry
exports.createSignup = async (req, res) => {
    const { RegNo, Name, Username, Password, confirmPassword, Status, Role, passhint, DOR } = req.body;

    if (Password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const sql = `INSERT INTO signup_tb (RegNo, Name, Username, Password, Status, Role, passhint, DOR) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [RegNo, Name, Username, hashedPassword, Status, Role, passhint, DOR], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(201).send({ id: result.insertId });
        });
    } catch (err) {
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

// Update a signup entry by ID
exports.updateSignup = async (req, res) => {
    const { id } = req.params;
    const { RegNo, Name, Username, Password, confirmPassword, Status, Role, passhint, DOR } = req.body;

    if (Password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const sql = `UPDATE signup_tb SET RegNo = ?, Name = ?, Username = ?, Password = ?, Status = ?, Role = ?, passhint = ?, DOR = ? WHERE id = ?`;
        db.query(sql, [RegNo, Name, Username, hashedPassword, Status, Role, passhint, DOR, id], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'Signup entry not found' });
            }
            res.status(200).send({ message: 'Signup entry updated successfully' });
        });
    } catch (err) {
        return res.status(500).send(err);
    }
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
