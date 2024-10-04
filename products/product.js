const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new product
exports.createProduct = async (req, res) => {
    const { title, description, brand, price, costprice, color, expdate, stock, unit, images, category, subCategory, shop_code, barcode,location } = req.body;

    // SQL query to check if a product with the same title already exists
    const checkTitleSql = `SELECT * FROM products_tb WHERE title = ? AND shop_code = ?`;

    db.query(checkTitleSql, [title, shop_code], async (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (result.length > 0) {
            // Product with the same title already exists in the same shop
            return res.status(400).send({ message: 'Product already exists' });
        }

        try {
            // Generate a new RegNo for the product entry
            const RegNo = await generateRegNo('P', 'products_tb');

            // If barcode is not provided, set it to null
            const productBarcode = barcode || null;

            // SQL query to insert the new product
            const insertSql = `INSERT INTO products_tb (RegNo, title, description, brand, price, costprice, color, expdate, stock, unit, images, category, sub_category, bar_code,location, shop_code) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(insertSql, [RegNo, title, description, brand, price, costprice, color, expdate, stock, unit, JSON.stringify(images), category, subCategory, productBarcode,location, shop_code], (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }

                res.status(201).send({ id: result.insertId, RegNo });
            });
        } catch (err) {
            console.error("Error generating RegNo:", err);
            return res.status(500).send({ message: 'Error generating RegNo' });
        }
    });
};


// Read all products
exports.getAllProducts = (req, res) => {
    const sql = `SELECT * FROM products_tb ORDER BY id DESC`;
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

exports.updateProducts = async (req, res) => {
    const { id } = req.params;
    const { title, description, brand, price, costprice, color, expdate, stock, unit, images, category, subCategory, shop_code, barcode, location } = req.body;

    // Create an array to store the fields to update
    let fieldsToUpdate = [];
    let values = [];

    // Add only the fields that are not undefined or null
    if (title !== undefined) {
        fieldsToUpdate.push('title = ?');
        values.push(title);
    }
    if (description !== undefined) {
        fieldsToUpdate.push('description = ?');
        values.push(description);
    }
    if (brand !== undefined) {
        fieldsToUpdate.push('brand = ?');
        values.push(brand);
    }
    if (price !== undefined) {
        fieldsToUpdate.push('price = ?');
        values.push(price);
    }
    if (costprice !== undefined) {
        fieldsToUpdate.push('costprice = ?');
        values.push(costprice);
    }
    if (color !== undefined) {
        fieldsToUpdate.push('color = ?');
        values.push(color);
    }
    if (expdate !== undefined) {
        fieldsToUpdate.push('expdate = ?');
        values.push(expdate);
    }
    if (stock !== undefined) {
        fieldsToUpdate.push('stock = ?');
        values.push(stock);
    }
    if (unit !== undefined) {
        fieldsToUpdate.push('unit = ?');
        values.push(unit);
    }
    if (images !== undefined) {
        fieldsToUpdate.push('images = ?');
        values.push(JSON.stringify(images));
    }
    if (category !== undefined) {
        fieldsToUpdate.push('category = ?');
        values.push(category);
    }
    if (subCategory !== undefined) {
        fieldsToUpdate.push('sub_category = ?');
        values.push(subCategory);
    }
    if (barcode !== undefined) {
        fieldsToUpdate.push('bar_code = ?');
        values.push(barcode);
    }
    if (location !== undefined) {
        fieldsToUpdate.push('location = ?');
        values.push(location);
    }
    // If no fields are provided, send an error response
    if (fieldsToUpdate.length === 0) {
        return res.status(400).send({ message: 'No fields to update' });
    }

    // Add id and shop_code to the values array for the WHERE clause
    values.push(id, shop_code);

    // Build the SQL query dynamically
    const updateSql = `UPDATE products_tb SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND shop_code = ?`;

    // Execute the query
    db.query(updateSql, values, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.status(200).send({ message: 'Product updated successfully' });
    });
};



exports.updateProduct = async (req, res) => {
    const { stock, user, RegNo, shop_code } = req.body; // Get stock, user, RegNo, and shop_code from the request body

    // Get a connection from the pool
    db.getConnection(async (err, connection) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Start a transaction
        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return res.status(500).send(err);
            }

            try {
                // SQL query to update the product stock only
                const updateSql = `UPDATE products_tb SET stock = stock + ? WHERE RegNo = ? AND shop_code = ?`;

                // Update the product stock
                await new Promise((resolve, reject) => {
                    connection.query(updateSql, [stock, RegNo, shop_code], (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                });

                // Generate a new RegNo for the stock record
                const stockRegNo = await generateRegNo('S', 'stock_tb');
const status="updated"
                // SQL query to insert a record into stock_tb
                const stockSql = `
                    INSERT INTO stock_tb (RegNo, product_code, quantity,status, reason, user, shop_code)
                    VALUES (?, ?, ?, ?,?, ?, ?)
                `;

                const stockReason = `Updated stock for product RegNo: ${RegNo} with quantity: ${stock}`;
                
                // Insert the stock record
                await new Promise((resolve, reject) => {
                    connection.query(stockSql, [stockRegNo, RegNo, stock,status, stockReason, user, shop_code], (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                });

                // Commit the transaction
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send(err);
                        });
                    }
                    connection.release(); // Release the connection back to the pool
                    res.status(200).send({ message: 'Product stock updated successfully' });
                });
            } catch (error) {
                // Rollback the transaction in case of an error
                connection.rollback(() => {
                    connection.release();
                    res.status(500).send(error);
                });
            }
        });
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

exports.getProductByShopCodeAndRegNo = (req, res) => {
    const { shop_code, RegNo } = req.params;
    const sql = `SELECT * FROM products_tb WHERE shop_code = ? AND RegNo = ?`;
    
    db.query(sql, [shop_code, RegNo], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Database query error', error: err });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.status(200).send(result[0]);
    });
};