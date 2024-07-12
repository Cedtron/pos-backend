const db = require('../conn/db');

// Create a new expense entry
// Create a new expense entry
exports.createExpenseEntry = (req, res) => {
    const RegNo = "001"; // Assuming a static RegNo, adjust as needed
    const { expcategory, amount, date, description } = req.body;

    // Validate input
    if (!expcategory || !amount || !date || !description) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    // Map expcategory to Reason
    const Reason = expcategory;

    const sql = `INSERT INTO expense_tb (RegNo, Reason, Amount, Date, Description) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [RegNo, Reason, amount, date, description], (err, result) => {
        if (err) {
            console.error("Error inserting expense:", err);
            return res.status(500).send({ message: 'Error creating expense entry' });
        }
        res.status(201).send({ message: 'Expense entry created successfully', id: result.insertId });
    });
};

// Read all expense entries
exports.getAllExpenseEntries = (req, res) => {
    const sql = `SELECT * FROM expense_tb`;
    db.query(sql, (err, results) => {
        if (err) {
          
            return res.status(500).send({ message: 'Error retrieving expenses' });
        }
        res.status(200).send( results );
    });
  };

// Read a single expense entry by ID
exports.getExpenseEntryById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM expense_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error fetching expense:", err);
            return res.status(500).send({ message: 'Error retrieving expense entry' });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Expense entry not found' });
        }
        res.status(200).send(result[0] );
    });
};

// Update an expense entry by ID
exports.updateExpenseEntry = (req, res) => {
    const { id } = req.params;
    const { expcategory, amount, date, description } = req.body;

    // Validate input
    if (!expcategory || !amount || !date || !description) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    // Map expcategory to Reason
    const Reason = expcategory;

    const sql = `UPDATE expense_tb SET Reason = ?, Amount = ?, Date = ?, Description = ? WHERE id = ?`;
    db.query(sql, [Reason, amount, date, description, id], (err, result) => {
        if (err) {
            //console.error("Error updating expense:", err);
            return res.status(500).send({ message: 'Error updating expense entry' });
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
            console.error("Error deleting expense:", err);
            return res.status(500).send({ message: 'Error deleting expense entry' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Expense entry not found' });
        }
        res.status(200).send({ message: 'Expense entry deleted successfully' });
    });
};
