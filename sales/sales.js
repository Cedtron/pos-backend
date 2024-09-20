const db = require('../conn/db');
const generateRegNo = require('../conn/reg');


// Create a new sales entry
exports.createSalesEntry = async (req, res) => {
    const { Products, shop_code, user ,grandTotal } = req.body;

    if (!Products || !shop_code || !user) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        // Generate RegNo for the sale
        const RegNo = await generateRegNo('S', 'sales_tb');

        // Calculate totals for the sale entry
        let totalUnits = 0;
        const totalQuantity = Products.reduce((sum, product) => sum + product.Quantity, 0);
        const totalStandardAmount = Products.reduce((sum, product) => sum + product.StandardAmount, 0);
        const totalAmount = Products.reduce((sum, product) => sum + product.TotalAmount, 0);

        // Calculate total units and stringify Products array
        const productsJson = JSON.stringify(
            Products.map((product) => {
                const totalProductUnits = product.Unit * product.Quantity;
                totalUnits += totalProductUnits; // Sum up the total units
                return {
                    ...product,
                    TotalUnits: totalProductUnits, // Add TotalUnits for each product
                };
            })
        );

        // Insert the sale entry into sales_tb
        const sql = `
            INSERT INTO sales_tb (RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, Date, user, shop_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            RegNo,
            productsJson,
            totalUnits,
            totalQuantity,
            totalStandardAmount,
            totalAmount,
            new Date().toISOString(),
            user,
            shop_code
        ], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting sale entry', error: err.message });
            }

            const newSaleId = result.insertId;

            // Update stock and create stock entries for each product
            for (const product of Products) {
                const { product_code, Quantity, stock } = product;
                const updatedStock = stock - Quantity;

                try {
                    // Update product stock in the products_tb
                    const updateSql = `
                        UPDATE products_tb 
                        SET stock = ? 
                        WHERE RegNo = ? AND shop_code = ?
                    `;
                    
                    await db.query(updateSql, [updatedStock, product_code, shop_code]);
                    console.log(`Successfully updated stock for product: ${product_code}`);

                    // Create a stock entry for the sold product
                    const stockRegNo = await generateRegNo('S', 'stock_tb');
                    const stockSql = `
                        INSERT INTO stock_tb (RegNo, product_code, quantity, reason, user, shop_code)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    const stockReason = `Sold ${Quantity} of ${stock} units`;
                    await db.query(stockSql, [stockRegNo, product_code, Quantity, stockReason, user, shop_code]);
                } catch (error) {
                    console.error(`Error updating stock for product ${product_code}:`, error);
                    return res.status(500).json({ message: 'Error updating product stock', error: error.message });
                }
            }

            res.status(201).json({ message: 'Sale entry created successfully', id: newSaleId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating sale entry', error: error.message });
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