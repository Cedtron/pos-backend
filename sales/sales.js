const db = require('../conn/db');

// Create a new sales entry
exports.createSalesEntry = (req, res) => {
    const { RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, Date } = req.body;
    const sql = `INSERT INTO sales_tb (RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, Date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, Date], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId });
    });
};

// Read all sales entries
exports.getAllSalesEntries = (req, res) => {
    const sql = `SELECT * FROM sales_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single sales entry by ID
exports.getSalesEntryById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM sales_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Sales entry not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update a sales entry by ID
exports.updateSalesEntry = (req, res) => {
    const { id } = req.params;
    const { RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, Date } = req.body;
    const sql = `UPDATE sales_tb SET RegNo = ?, Product = ?, Unit = ?, Quantity = ?, StandardAmount = ?, TotalAmount = ?, Date = ? WHERE id = ?`;
    db.query(sql, [RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, Date, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Sales entry not found' });
        }
        res.status(200).send({ message: 'Sales entry updated successfully' });
    });
};

// Delete a sales entry by ID
exports.deleteSalesEntry = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM sales_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Sales entry not found' });
        }
        res.status(200).send({ message: 'Sales entry deleted successfully' });
    });
};
