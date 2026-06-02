const express = require('express');
const router = express.Router();
const deliveryController = require('./delivery');

// Track delivery by tracking number — must be BEFORE /:id to avoid conflict
router.get('/delivery/track/:trackingNumber', deliveryController.trackDelivery);

// Create delivery
router.post('/addelivery', deliveryController.createDelivery);

// Get all deliveries
router.get('/delivery', deliveryController.getAllDeliveries);

// Get single delivery by ID
router.get('/delivery/:id', deliveryController.getDeliveryById);

// Update delivery
router.put('/updatedelivery/:id', deliveryController.updateDelivery);

// Delete delivery
router.delete('/deldelivery/:id', deliveryController.deleteDelivery);

module.exports = router;