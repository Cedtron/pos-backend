const express = require('express');
const router  = express.Router();
const deliveryController = require('./delivery');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addelivery',               auth, shopGuard, deliveryController.createDelivery);
router.get   ('/delivery',                 auth, shopGuard, deliveryController.getAllDeliveries);
router.get   ('/delivery/:id',             auth, shopGuard, deliveryController.getDeliveryById);
router.put   ('/updatedelivery/:id',       auth, shopGuard, deliveryController.updateDelivery);
router.delete('/deldelivery/:id',          auth, shopGuard, deliveryController.deleteDelivery);
// Track is public — customers can track without logging in
router.get   ('/delivery/track/:trackingNumber', deliveryController.trackDelivery);

module.exports = router;
