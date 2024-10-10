const db = require('../conn/db');
const generateRegNo = require('../conn/reg');


exports.createSalesEntry = async (req, res) => {
    const { Products, shop_code, user, grandTotal, discount, Taxes } = req.body;

    // Validate required fields
    if (!Products || !shop_code || !user) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Ensure Products is a non-empty array
    if (!Array.isArray(Products) || Products.length === 0) {
        return res.status(400).json({ message: 'Products should be a non-empty array' });
    }

    try {
        // Generate RegNo for the sale
        const RegNo = await generateRegNo('S', 'sales_tb');

        let totalUnits = 0;
        let totalAmount = 0;
        let totalQuantity = 0;
        let standardAmounts = [];

        // Calculate totals for the sale entry
        Products.forEach(product => {
            totalQuantity += product.Quantity;
            totalAmount += product.TotalAmount;
            standardAmounts.push(product.StandardAmount);

            // Add up total units
            totalUnits += product.Unit * product.Quantity;
        });

        // Calculate the final amount after discount and taxes
        let finalAmount = totalAmount;
        if (discount && discount > 0) {
            finalAmount -= discount;
        }
        if (Taxes && Taxes > 0) {
            finalAmount += Taxes;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        // Insert the sale entry into sales_tb
        const sql = `
            INSERT INTO sales_tb (RegNo, Unit, Quantity, StandardAmount, TotalAmount, discount, Taxes, Date, user, shop_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            RegNo,
            totalUnits, // Total units as int
            totalQuantity, // Total quantity as int
            standardAmounts.reduce((a, b) => a + b, 0), // Sum of standard amounts
            finalAmount, // Final calculated amount
            discount,
            Taxes,
            currentDate,
            user,
            shop_code
        ]);

        // Check if the insert was successful and handle stock updates
        if (result.affectedRows > 0) {
            const saleId = result.insertId; // New sale ID

            // Update stock and create stock entries for each product
            for (const product of Products) {
                const { product_code, Quantity, stock } = product;
                const updatedStock = stock - Quantity;

                // Update product stock in the products_tb
                const updateSql = `
                    UPDATE products_tb 
                    SET stock = ? 
                    WHERE RegNo = ? AND shop_code = ?
                `;
                await db.query(updateSql, [updatedStock, product_code, shop_code]);

                // Create a stock entry for the sold product
                const stockRegNo = await generateRegNo('S', 'stock_tb');
                const status = 'sales';
                const stockReason = `Sold ${Quantity} of ${stock} units`;
                const stockSql = `
                    INSERT INTO stock_tb (RegNo, product_code, quantity, status, reason, user, shop_code)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await db.query(stockSql, [stockRegNo, product_code, Quantity, status, stockReason, user, shop_code]);
            }

            // Send success response with the new sale ID
            return res.status(201).json({ message: 'Sale entry created successfully', saleId });
        } else {
            return res.status(500).json({ message: 'Sale entry not created' });
        }

    } catch (error) {
        // Log error and send response
        console.error('Error creating sale entry:', error);
        return res.status(500).json({ message: 'Error creating sale entry', error: error.message });
    }
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