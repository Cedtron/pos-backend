const { v4: uuidv4 } = require('uuid'); // For UUID generation
const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

exports.createCategory = async (req, res) => {
    const { name, shop_code } = req.body;

    try {
        const checkSql = `SELECT * FROM category_name_tb WHERE name = ? AND shop_code = ?`;
        db.query(checkSql, [name, shop_code], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error', error: err });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Category already exists for this shop' });
            }

            // Generate a new RegNo for the category
            const regNo = await generateRegNo('C', 'category_name_tb');
            const uuid = uuidv4(); // Generate a UUID for global uniqueness

            const insertSql = `INSERT INTO category_name_tb (uuid, RegNo, name, shop_code, sync_status) VALUES (?, ?, ?, ?, ?)`;
            db.query(insertSql, [uuid, regNo, name, shop_code, 0], (err, result) => {
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
    const { shop_code } = req.query; // Get shop_code from query params

    let sql = 'SELECT * FROM category_name_tb';
    const params = [];

    // Filter by shop_code if provided
    if (shop_code) {
        sql += ' WHERE shop_code = ?';
        params.push(shop_code);
    }

    sql += ' ORDER BY id DESC';

    db.query(sql, params, (err, results) => {
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
    const { shop_code } = req.query; // Get shop_code from query params

    let sql = 'SELECT * FROM category_name_tb WHERE id = ?';
    const params = [id];

    // Add shop_code filter if provided
    if (shop_code) {
        sql += ' AND shop_code = ?';
        params.push(shop_code);
    }

    db.query(sql, params, (err, result) => {
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
    const { name, shop_code } = req.body;

    const checkSql = `SELECT * FROM category_name_tb WHERE name = ? AND shop_code = ? AND id != ?`;
    db.query(checkSql, [name, shop_code, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Category already exists in this shop' });
        }

        const updateSql = `UPDATE category_name_tb SET name = ? WHERE id = ? AND shop_code = ?`;
        db.query(updateSql, [name, id, shop_code], (err) => {
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
    const { shop_code } = req.query; // Get shop_code from query params

    const deleteSql = 'DELETE FROM category_name_tb WHERE id = ? AND shop_code = ?';
    db.query(deleteSql, [id, shop_code], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    });
};