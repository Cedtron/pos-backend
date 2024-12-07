const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
const { v4: uuidv4 } = require('uuid'); // Import UUID library for generating UUIDs

// Create a new category
exports.createCategory = async (req, res) => {
    const { category, subCategory, shop_code } = req.body;

    try {
        // Check if the category already exists
        const checkSql = `SELECT * FROM category_tb WHERE category = ? AND sub_category = ? AND shop_code = ?`;
        db.query(checkSql, [category, subCategory, shop_code], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error', error: err });
            }

            // If the category already exists, return an error
            if (results.length > 0) {
                return res.status(400).json({ message: 'Category already exists' });
            }

            // Generate a new RegNo and UUID for the category
            const regNo = await generateRegNo('C', 'category_tb');
            const uuid = uuidv4();

            // Insert the new category
            const insertSql = `INSERT INTO category_tb (uuid, RegNo, category, sub_category, shop_code) VALUES (?, ?, ?, ?, ?)`;
            db.query(insertSql, [uuid, regNo, category, subCategory, shop_code], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error', error: err });
                }
                res.status(201).json({ message: 'Category created successfully', id: result.insertId, uuid });
            });
        });
    } catch (err) {
        console.error('Error during category creation:', err);
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// Read all categories for a specific shop
exports.getAllCategories = (req, res) => {
    const { shop_code } = req.query; // Assuming shop_code is passed as a query parameter

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `SELECT * FROM category_tb WHERE shop_code = ? ORDER BY id DESC`;
    db.query(sql, [shop_code], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        res.status(200).json(results);
    });
};

// Read a single category by ID for a specific shop
exports.getCategoryById = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query; // Assuming shop_code is passed as a query parameter

    if (!shop_code) {
        return res.status(400).json({ message: 'Shop code is required' });
    }

    const sql = `SELECT * FROM category_tb WHERE id = ? AND shop_code = ?`;
    db.query(sql, [id, shop_code], (err, result) => {
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


// Update a category by ID
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { category, subCategory } = req.body;

    // Check if the category already exists
    const checkSql = `SELECT id FROM category_tb WHERE category = ? AND sub_category = ? AND id != ?`;
    db.query(checkSql, [category, subCategory, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }

        if (results.length > 0) {
            // Category already exists
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Proceed with update
        const updateSql = `UPDATE category_tb SET category = ?, sub_category = ? WHERE id = ?`;
        db.query(updateSql, [category, subCategory, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json({ message: 'Category updated successfully' });
        });
    });
};

// Delete a category by ID
exports.deleteCategory = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM category_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    });
};
