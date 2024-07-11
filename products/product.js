const db = require('../conn/db');

// Create a new product
exports.createProduct = (req, res) => {
    const RegNo = '001';
    const { title, description, brand, price, costprice, color, expdate, stock, rating, images, category_id, properties } = req.body;

    // SQL query to check if a product with the same title already exists
    const checkTitleSql = `SELECT id FROM products_tb WHERE title = ?`;

    db.query(checkTitleSql, [title], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (result.length > 0) {
            // Product with the same title already exists
            return res.status(400).send({ message: 'Product already exists' });
        }

        // SQL query to insert the new product
        const insertSql = `INSERT INTO products_tb (RegNo, title, description, brand, price, costprice, color, expdate, stock, rating, images, category_id, properties) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(insertSql, [RegNo, title, description, brand, price, costprice, color, expdate, stock, rating, JSON.stringify(images), category_id, JSON.stringify(properties)], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.status(201).send({ id: result.insertId });
        });
    });
};

// Read all products
exports.getAllProducts = (req, res) => {
    const sql = `SELECT * FROM products_tb`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single product by ID
exports.getProductById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM products_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update a product by ID
exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { RegNo, title, description, brand, price, costprice, color, expdate, stock, rating, images, category_id, properties } = req.body;
    const sql = `UPDATE products_tb SET RegNo = ?, title = ?, description = ?, brand = ?, price = ?, costprice = ?, color = ?, expdate = ?, stock = ?, rating = ?, images = ?, category_id = ?, properties = ? WHERE id = ?`;
    db.query(sql, [RegNo, title, description, brand, price, costprice, color, expdate, stock, rating, JSON.stringify(images), category_id, JSON.stringify(properties), id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.status(200).send({ message: 'Product updated successfully' });
    });
};

// Delete a product by ID
exports.deleteProduct = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM products_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.status(200).send({ message: 'Product deleted successfully' });
    });
};


exports.uploadImages = (req, res) => {
    console.log(req.files); // Log the files to check if they are being received correctly

    const files = req.files;
    if (!files || files.length === 0) {
        console.log('No files were uploaded.'); // Log this error for debugging
        return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const links = files.map(file => ({
        filename: file.filename,
        url: `/uploads/products/${file.filename}`
    }));

    res.status(200).json({ links });
};
