const db = require('../conn/db');

// Create a new category
exports.createCategory = (req, res) => {
    const { category, subCategory } = req.body;

    // Check if the category already exists
    const checkSql = `SELECT * FROM category_tb WHERE category = ? AND sub_category = ?`;
    db.query(checkSql, [category, subCategory], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        // If the category already exists, return an error
        if (results.length > 0) {
            return res.status(400).send({ message: 'Category already exists' });
        }

        // Insert the new category
        const insertSql = `INSERT INTO category_tb (category, sub_category) VALUES (?, ?)`;
        db.query(insertSql, [category, subCategory], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(201).send({ id: result.insertId });
        });
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
    const { category, subCategory } = req.body;

    // Check if the category already exists
    const checkSql = `SELECT id FROM category_tb WHERE category = ? AND id != ?`;
    db.query(checkSql, [category, id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (results.length > 0) {
            // Category already exists
            return res.status(400).send({ message: 'Category already exists' });
        }

        // Proceed with update
        const updateSql = `UPDATE category_tb SET category = ?, sub_category = ? WHERE id = ?`;
        db.query(updateSql, [category, subCategory, id], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'Category not found' });
            }
            res.status(200).send({ message: 'Category updated successfully' });
        });
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