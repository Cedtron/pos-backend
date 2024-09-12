const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new order
exports.createOrder = async (req, res) => {
    const { Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code } = req.body;

    if (!Product || !Unit || !Quantity || !Status || !StandardAmount || !TotalAmount || !Date || !shop_code) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Generate RegNo
        const RegNo = await generateRegNo('O', 'order_tb');

        // Insert new order
        const insertSql = `INSERT INTO order_tb (RegNo, Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertSql, [RegNo, Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting order', error: err.message });
            }
            res.status(201).json({ message: 'Order created successfully', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating RegNo', error });
    }
};

// Read all orders
exports.getAllOrders = (req, res) => {
    const sql = `SELECT * FROM order_tb ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Read a single order by ID
exports.getOrderById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM order_tb WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update an order by ID
exports.updateOrder = (req, res) => {
    const { id } = req.params;
    const { Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code } = req.body;

    const sql = `UPDATE order_tb SET Product = ?, Unit = ?, Quantity = ?, Status = ?, StandardAmount = ?, TotalAmount = ?, Date = ?, shop_code = ? WHERE id = ?`;
    db.query(sql, [Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order updated successfully' });
    });
};

// Delete an order by ID
exports.deleteOrder = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM order_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    });
};
