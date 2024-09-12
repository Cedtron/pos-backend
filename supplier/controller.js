const express = require('express');
const router = express.Router();
const suppliersController = require('./supplier');

// Create a new supplier
router.post('/addsuppliers', suppliersController.createSupplier);

// Read all suppliers
router.get('/suppliers', suppliersController.getAllSuppliers);

// Read a single supplier by ID
router.get('/suppliers/:id', suppliersController.getSupplierById);

// Update a supplier by ID
router.put('/updatesuppliers/:id', suppliersController.updateSupplier);

// Delete a supplier by ID
router.delete('/delsuppliers/:id', suppliersController.deleteSupplier);

module.exports = router;
