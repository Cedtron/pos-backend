const db = require('../conn/db');

// Create a new expense entry
exports.createExpenseEntry = (req, res) => {
    const { RegNo, Reason, Amount, Date, Description } = req.body;
    const sql = `INSERT INTO expense_tb (RegNo, Reason, Amount, Date, Description) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [RegNo, Reason, Amount, Date, Description], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId });
    });
};

// Read all expense entries
exports.getAllExpenseEntries = (req, res) => {
    const sql = `SELECT * FROM expense_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single expense entry by ID
exports.getExpenseEntryById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM expense_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Expense entry not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update an expense entry by ID
exports.updateExpenseEntry = (req, res) => {
    const { id } = req.params;
    const { RegNo, Reason, Amount, Date, Description } = req.body;
    const sql = `UPDATE expense_tb SET RegNo = ?, Reason = ?, Amount = ?, Date = ?, Description = ? WHERE id = ?`;
    db.query(sql, [RegNo, Reason, Amount, Date, Description, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Expense entry not found' });
        }
        res.status(200).send({ message: 'Expense entry updated successfully' });
    });
};

// Delete an expense entry by ID
exports.deleteExpenseEntry = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM expense_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Expense entry not found' });
        }
        res.status(200).send({ message: 'Expense entry deleted successfully' });
    });
};
