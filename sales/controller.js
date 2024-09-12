const express = require('express');
const router = express.Router();
const salesController = require('./sales');


// Create a new sales entry
router.post('/addsales', salesController.createSalesEntry);

// Read all sales entries
router.get('/sales', salesController.getAllSalesEntries);

// Read a single sales entry by ID
router.get('/sales/:id', salesController.getSalesEntryById);
// Read a single sales entry by user
router.get('/sale/:user', salesController.getSalesEntryByUser);

// Update a sales entry by ID
router.put('/updatesales/:id', salesController.updateSalesEntry);

// Delete a sales entry by ID
router.delete('/delsales/:id', salesController.deleteSalesEntry);

module.exports = router;
