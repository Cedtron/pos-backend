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

exports.getAllOrders = (req, res) => {
    const { shop_code } = req.query; // Optional query parameter to filter by shop_code

    let sql = `SELECT * FROM order_tb`;
    const params = [];

    if (shop_code) {
        sql += ` WHERE shop_code = ?`;
        params.push(shop_code);
    }

    sql += ` ORDER BY id DESC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
};


exports.getOrderById = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query; // Optional query parameter to filter by shop_code

    let sql = `SELECT * FROM order_tb WHERE id = ?`;
    const params = [id];

    if (shop_code) {
        sql += ` AND shop_code = ?`;
        params.push(shop_code);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching order:", err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(results[0]);
    });
};


exports.updateOrder = (req, res) => {
    const { id } = req.params;
    const { Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code } = req.body;

    // Validate required fields
    if (!Product || !Unit || !Quantity || !Status || !StandardAmount || !TotalAmount || !Date || !shop_code) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
        UPDATE order_tb 
        SET Product = ?, Unit = ?, Quantity = ?, Status = ?, 
            StandardAmount = ?, TotalAmount = ?, Date = ?, 
            shop_code = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND shop_code = ?
    `;

    db.query(sql, [Product, Unit, Quantity, Status, StandardAmount, TotalAmount, Date, shop_code, id, shop_code], (err, result) => {
        if (err) {
            console.error("Error updating order:", err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order updated successfully' });
    });
};

exports.deleteOrder = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query; // Ensure shop_code is provided

    if (!shop_code) {
        return res.status(400).json({ message: 'shop_code is required' });
    }

    const sql = `DELETE FROM order_tb WHERE id = ? AND shop_code = ?`;

    db.query(sql, [id, shop_code], (err, result) => {
        if (err) {
            console.error("Error deleting order:", err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    });
};
