const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

// Create a new category
exports.createCategory = async (req, res) => {
    const { name, shop_code } = req.body;

    try {
        const checkSql = `SELECT * FROM category_name_tb WHERE name = ?`;
        db.query(checkSql, [name], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error', error: err });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Category already exists' });
            }

            // Generate a new RegNo for the category
            const regNo = await generateRegNo('C','category_name_tb');

            const insertSql = `INSERT INTO category_name_tb (RegNo, name, shop_code) VALUES (?,?,?)`;
            db.query(insertSql, [regNo, name, shop_code], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error', error: err });
                }
                res.status(201).json({ message: 'Category created successfully', id: result.insertId });
            });
        });
    } catch (err) {
        console.error('Error during category creation:', err);
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all categories
exports.getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM category_name_tb ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        res.status(200).json(results);
    });
};

// Get a single category by ID
exports.getCategoryById = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM category_name_tb WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(result[0]);
    });
};

// Update a category
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const checkSql = `SELECT * FROM category_name_tb WHERE name = ? AND id != ?`;
    db.query(checkSql, [name, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const updateSql = `UPDATE category_name_tb SET name = ? WHERE id = ?`;
        db.query(updateSql, [name, id], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error', error: err });
            }
            res.status(200).json({ message: 'Category updated successfully' });
        });
    });
};

// Delete a category
exports.deleteCategory = (req, res) => {
    const { id } = req.params;
    const deleteSql = 'DELETE FROM category_name_tb WHERE id = ?';
    db.query(deleteSql, [id], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    });
};