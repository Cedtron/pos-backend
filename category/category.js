const db = require('../conn/db');

// Create a new category
exports.createCategory = (req, res) => {
    const { RegNo, Name } = req.body;
    const sql = `INSERT INTO category_tb (RegNo, Name) VALUES (?, ?)`;
    db.query(sql, [RegNo, Name], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId });
    });
};

// Read all categories
exports.getAllCategories = (req, res) => {
    const sql = `SELECT * FROM category_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single category by ID
exports.getCategoryById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM category_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Category not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update a category by ID
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { RegNo, Name } = req.body;
    const sql = `UPDATE category_tb SET RegNo = ?, Name = ? WHERE id = ?`;
    db.query(sql, [RegNo, Name, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Category not found' });
        }
        res.status(200).send({ message: 'Category updated successfully' });
    });
};

// Delete a category by ID
exports.deleteCategory = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM category_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Category not found' });
        }
        res.status(200).send({ message: 'Category deleted successfully' });
    });
};
