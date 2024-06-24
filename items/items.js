const db = require('../conn/db');

// Create a new item entry
exports.createItemEntry = (req, res) => {
    const { RegNo, Name, Category_id } = req.body;
    const sql = `INSERT INTO items_tb (RegNo, Name, Category_id) VALUES (?, ?, ?)`;
    db.query(sql, [RegNo, Name, Category_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId });
    });
};

// Read all item entries
exports.getAllItemEntries = (req, res) => {
    const sql = `SELECT * FROM items_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single item entry by ID
exports.getItemEntryById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM items_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Item entry not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update an item entry by ID
exports.updateItemEntry = (req, res) => {
    const { id } = req.params;
    const { RegNo, Name, Category_id } = req.body;
    const sql = `UPDATE items_tb SET RegNo = ?, Name = ?, Category_id = ? WHERE id = ?`;
    db.query(sql, [RegNo, Name, Category_id, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Item entry not found' });
        }
        res.status(200).send({ message: 'Item entry updated successfully' });
    });
};

// Delete an item entry by ID
exports.deleteItemEntry = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM items_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Item entry not found' });
        }
        res.status(200).send({ message: 'Item entry deleted successfully' });
    });
};
