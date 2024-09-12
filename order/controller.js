const express = require('express');
const router = express.Router();
const orderController = require('./order');

// Create a new order
router.post('/addorders', orderController.createOrder);

// Read all orders
router.get('/orders', orderController.getAllOrders);

// Read a single order by ID
router.get('/orders/:id', orderController.getOrderById);

// Update an order by ID
router.put('/updateorders/:id', orderController.updateOrder);

// Delete an order by ID
router.delete('/delorders/:id', orderController.deleteOrder);

module.exports = router;