const db = require('../conn/db');

// Create a new time entry
exports.createTimeEntry = (req, res) => {
    const { Username, Time } = req.body;
    const sql = `INSERT INTO time_tb (Username, Time) VALUES (?, ?)`;
    db.query(sql, [Username, Time], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId });
    });
};

// Read all time entries
exports.getAllTimeEntries = (req, res) => {
    const sql = `SELECT * FROM time_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single time entry by ID
exports.getTimeEntryById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM time_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Time entry not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update a time entry by ID
exports.updateTimeEntry = (req, res) => {
    const { id } = req.params;
    const { Username, Time } = req.body;
    const sql = `UPDATE time_tb SET Username = ?, Time = ? WHERE id = ?`;
    db.query(sql, [Username, Time, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Time entry not found' });
        }
        res.status(200).send({ message: 'Time entry updated successfully' });
    });
};

// Delete a time entry by ID
exports.deleteTimeEntry = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM time_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Time entry not found' });
        }
        res.status(200).send({ message: 'Time entry deleted successfully' });
    });
};
