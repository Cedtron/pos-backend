const express = require('express');
const router = express.Router();
const subscribeController = require('./subcribe');

// Create a new subscription
router.post('/addsubscription', subscribeController.createSubscription);

// Get all subscriptions
router.get('/subscriptions-legacy', subscribeController.getSubscriptions);

// Get a single subscription by ID
router.get('/subscriptions-legacy/:id', subscribeController.getSubscriptionById);

// Update a subscription by ID
router.put('/updatesubscription/:id', subscribeController.updateSubscription);

// Delete a subscription by ID
router.delete('/delsubscription/:id', subscribeController.deleteSubscription);

module.exports = router;
