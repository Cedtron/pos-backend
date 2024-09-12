const express = require('express');
const router = express.Router();
const customerController = require('./customer');

// Create a new customer
router.post('/addcustomers', customerController.createCustomer);

// Read all customers
router.get('/customers', customerController.getAllCustomers);

// Read a single customer by ID
router.get('/customers/:id', customerController.getCustomerById);

// Update a customer by ID
router.put('/updatecustomers/:id', customerController.updateCustomer);

// Delete a customer by ID
router.delete('/delcustomers/:id', customerController.deleteCustomer);

module.exports = router;
