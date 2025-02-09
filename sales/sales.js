const db = require('../conn/db');
const generateRegNo = require('../conn/reg');

// Wrapping db.query in a promise
const queryPromise = (query, values) => {
    return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.createSalesEntry = async (req, res) => {
    const { Products, shop_code, user, grandTotal, discount, Taxes } = req.body;

    if (!Products || !shop_code || !user) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (!Array.isArray(Products) || Products.length === 0) {
        return res.status(400).json({ message: 'Products should be a non-empty array' });
    }

    try {
        // Generate the sales RegNo dynamically
        const RegNo = await generateRegNo('S', 'sales_tb');

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

        // Insert the sale entry
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

        // Use the queryPromise function to execute the query and get the result
        const result = await queryPromise(query, values);

        // Check if sale entry was created
        if (result.affectedRows > 0) {
            const saleId = result.insertId;

            // Proceed with stock update logic for each product
            for (const product of Products) {
                const { product_code, Quantity, stock } = product;
                const updatedStock = stock - Quantity;

                // Update the stock for each product
                const updateStockQuery = `
                    UPDATE products_tb 
                    SET stock = ? 
                    WHERE RegNo = ? AND shop_code = ?
                `;
                await queryPromise(updateStockQuery, [updatedStock, product_code, shop_code]);

                // Insert into the stock log
                const stockRegNo = await generateRegNo('S', 'stock_tb'); // Ensure RegNo is unique
                const status = 'sales';
                const stockReason = `Sold ${Quantity} of ${stock} units`;

                const stockLogQuery = `
                    INSERT INTO stock_tb (RegNo, product_code, quantity, status, reason, user, shop_code)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await queryPromise(stockLogQuery, [stockRegNo, product_code, Quantity, status, stockReason, user, shop_code]);
            }

            return res.status(201).json({ message: 'Sale entry created successfully', saleId });
        } else {
            return res.status(500).json({ message: 'Sale entry not created' });
        }
    } catch (error) {
        console.error('Error during sale entry creation:', error); // Log the error
        res.status(500).json({ message: 'Error creating sale entry', error });
    }
};




exports.getAllSalesEntries = (req, res) => {
    // Extract shop_code from the query parameters
    const { shop_code } = req.query;

    // Base SQL query
    let sql = `SELECT * FROM sales_tb`;

    // If shop_code is provided, add a WHERE clause to filter results
    if (shop_code) {
        sql += ` WHERE shop_code = ?`;
    }

    // Always order by id DESC
    sql += ` ORDER BY id DESC`;

    // Execute the query
    db.query(sql, shop_code ? [shop_code] : [], (err, results) => {
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