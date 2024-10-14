const db = require('../conn/db');
const generateRegNo = require('../conn/reg');


exports.createSalesEntry = (req, res) => {
    const { Products, shop_code, user, grandTotal, discount, Taxes } = req.body;

    if (!Products || !shop_code || !user) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (!Array.isArray(Products) || Products.length === 0) {
        return res.status(400).json({ message: 'Products should be a non-empty array' });
    }

    // Generate the sales RegNo dynamically (you can adjust the generateRegNo function as needed)
    generateRegNo('S', 'sales_tb', (err, RegNo) => {
        if (err) {
            return res.status(500).json({ message: 'Error generating RegNo' });
        }

        let totalUnits = 0;
        let totalAmount = 0;
        let totalQuantity = 0;
        let standardAmounts = [];

        Products.forEach(product => {
            totalQuantity += product.Quantity;
            totalAmount += product.TotalAmount;
            standardAmounts.push(product.StandardAmount);
            totalUnits += product.Unit * product.Quantity;
        });

        let finalAmount = totalAmount;
        if (discount && discount > 0) {
            finalAmount -= discount;
        }
        if (Taxes && Taxes > 0) {
            finalAmount += Taxes;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        // Execute the MySQL insert query
        const query = `
            INSERT INTO sales_tb (RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, discount, Taxes, Date, user, shop_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            RegNo,
            JSON.stringify(Products),  // Store products as a JSON string
            totalUnits,
            totalQuantity,
            standardAmounts.reduce((a, b) => a + b, 0),
            finalAmount,
            discount,
            Taxes,
            currentDate,
            user,
            shop_code
        ];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ message: 'Error creating sale entry', error });
            }

            // Check if the insert was successful
            if (result.affectedRows > 0) {
                const saleId = result.insertId;

                // Proceed with stock update logic for each product
                Products.forEach(product => {
                    const { product_code, Quantity, stock } = product;
                    const updatedStock = stock - Quantity;

                    // Update the stock for each product
                    const updateStockQuery = `
                        UPDATE products_tb 
                        SET stock = ? 
                        WHERE RegNo = ? AND shop_code = ?
                    `;
                    db.query(updateStockQuery, [updatedStock, product_code, shop_code], (err) => {
                        if (err) {
                            console.error('Error updating stock:', err);
                        }
                    });

                    // Insert into the stock log
                    const stockRegNo = generateRegNo('S', 'stock_tb'); // Adjust this as needed
                    const status = 'sales';
                    const stockReason = `Sold ${Quantity} of ${stock} units`;

                    const stockLogQuery = `
                        INSERT INTO stock_tb (RegNo, product_code, quantity, status, reason, user, shop_code)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.query(stockLogQuery, [stockRegNo, product_code, Quantity, status, stockReason, user, shop_code], (err) => {
                        if (err) {
                            console.error('Error inserting stock log:', err);
                        }
                    });
                });

                return res.status(201).json({ message: 'Sale entry created successfully', saleId });
            } else {
                return res.status(500).json({ message: 'Sale entry not created' });
            }
        });
    });
};


// Read all sales entries
exports.getAllSalesEntries = (req, res) => {
    const sql = `SELECT * FROM sales_tb ORDER BY id DESC`;

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
// Read a single sales entry by ID
exports.getSalesEntryByUser = (req, res) => {
    const { user } = req.params; // Access the user from the URL parameters

    // Ensure that user is provided
    if (!user) {
        return res.status(400).send({ message: 'User parameter is required' });
    }

    const sql = `SELECT * FROM sales_tb WHERE user = ? ORDER BY id DESC`; // SQL query to select sales by user

    db.query(sql, [user], (err, result) => {
        if (err) {
            return res.status(500).send(err); // Handle database errors
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Saler user entry not found' }); // No entries found for the user
        }
        res.status(200).send(result); // Send back the result
    });
};
// Update a sales entry by ID
exports.updateSalesEntry = (req, res) => {
    const { id } = req.params;
    const { Product, Unit, Quantity, StandardAmount, TotalAmount, Date, shop_code } = req.body;

    const sql = `UPDATE sales_tb SET Product = ?, Unit = ?, Quantity = ?, StandardAmount = ?, TotalAmount = ?, Date = ?, shop_code = ? WHERE id = ?`;

    db.query(sql, [Product, Unit, Quantity, StandardAmount, TotalAmount, Date, shop_code, id], (err, result) => {
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