const db = require('../conn/db');
const generateRegNo = require('../conn/reg');


// Create a new sales entry
exports.createSalesEntry = async (req, res) => {
    const { Products, shop_code, user, grandTotal, discount, Taxes } = req.body;

    if (!Products || !shop_code || !user) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        // Generate RegNo for the sale
        const RegNo = await generateRegNo('S', 'sales_tb');

        // Calculate totals for the sale entry
        let totalUnits = 0;
        const totalQuantity = Products.reduce((sum, product) => sum + product.Quantity, 0);
        const standardAmounts = Products.map(product => product.StandardAmount);
        const totalAmount = Products.reduce((sum, product) => sum + product.TotalAmount, 0);

        // Calculate the discount and taxes if provided
        let finalAmount = totalAmount;
        if (discount && discount > 0) {
            finalAmount -= discount; // Subtract discount if it's greater than 0
        }
        if (Taxes && Taxes > 0) {
            finalAmount += Taxes; // Add taxes if it's greater than 0
        }

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

        const currentDate = new Date().toISOString().split('T')[0];

        // Insert the sale entry into sales_tb
        const sql = `
            INSERT INTO sales_tb (RegNo, Product, Unit, Quantity, StandardAmount, TotalAmount, discount, Taxes, Date, user, shop_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result =  db.query(sql, [
            RegNo,
            productsJson,
            totalUnits,
            totalQuantity,
            JSON.stringify(standardAmounts),
            finalAmount,
            discount,
            Taxes,
            currentDate,
            user,
            shop_code
        ]);
        
        if (result.affectedRows > 0) {
            const saleId = result.insertId; // This will contain the new sale ID
            res.status(201).json({ message: 'Sale entry created successfully', saleId });
        } else {
            res.status(500).json({ message: 'Sale entry not created' });
        }
        // Get the inserted sale entry ID
        const saleId = result.insertId; // This will contain the new sale ID

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
             db.query(updateSql, [updatedStock, product_code, shop_code]);

            // Create a stock entry for the sold product
            const stockRegNo = await generateRegNo('S', 'stock_tb');
            const status = 'sales';
            const stockReason = `Sold ${Quantity} of ${stock} units`;
            const stockSql = `
                INSERT INTO stock_tb (RegNo, product_code, quantity, status, reason, user, shop_code)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
             db.query(stockSql, [stockRegNo, product_code, Quantity, status, stockReason, user, shop_code]);
        }

        // Send success response with the new sale ID
        res.status(201).json({ message: 'Sale entry created successfully', saleId });

    } catch (error) {
        // Log error and send response
        console.error('Error creating sale entry:', error);
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