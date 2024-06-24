const express = require('express');
const router = express.Router();
const salesController = require('./sales');

// Create a new sales entry
router.post('/sales', salesController.createSalesEntry);

// Read all sales entries
router.get('/sales', salesController.getAllSalesEntries);

// Read a single sales entry by ID
router.get('/sales/:id', salesController.getSalesEntryById);

// Update a sales entry by ID
router.put('/sales/:id', salesController.updateSalesEntry);

// Delete a sales entry by ID
router.delete('/sales/:id', salesController.deleteSalesEntry);

module.exports = router;
