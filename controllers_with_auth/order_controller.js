const express = require('express');
const router  = express.Router();
const orderController = require('./order');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addorders',       auth, shopGuard, orderController.createOrder);
router.get   ('/orders',          auth, shopGuard, orderController.getAllOrders);
router.get   ('/orders/:id',      auth, shopGuard, orderController.getOrderById);
router.put   ('/updateorders/:id',auth, shopGuard, orderController.updateOrder);
router.delete('/delorders/:id',   auth, shopGuard, orderController.deleteOrder);

module.exports = router;
