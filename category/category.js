const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new category

exports.createCategory = async (req, res) => {
    const { category, subCategory , shop_code} = req.body;

    try {
        // Check if the category already exists
        const checkSql = `SELECT * FROM category_tb WHERE category = ? AND sub_category = ? AND shop_code = ?`;
        db.query(checkSql, [category, subCategory, shop_code], async (err, results) => {
            if (err) {
                return res.status(500).send(err);
            }
 
            // If the category already exists, return an error
            if (results.length > 0) {
                return res.status(400).send({ message: 'Category already exists' });
            }
 
            // Generate a new RegNo for the category
            const regNo = await generateRegNo('C','category_tb');

            // Insert the new category with the generated RegNo
            const insertSql = `INSERT INTO category_tb (RegNo, category, sub_category, shop_code) VALUES (?, ?, ?, ?)`;
            db.query(insertSql, [regNo, category, subCategory, shop_code], (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.status(201).send({ id: result.insertId });
            });
        });
    } catch (err) {
        return res.status(500).send({ message: 'Server error', error: err });
    }
};

exports.getAllCategories = (req, res) => {
    const { shop_code } = req.query;
    let sql = `SELECT * FROM category_tb`;
    const params = [];

    if (shop_code) {
        sql += ` WHERE shop_code = ?`;
        params.push(shop_code);
    }

    sql += ` ORDER BY id DESC`;

    db.query(sql, params, (err, results) => {
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