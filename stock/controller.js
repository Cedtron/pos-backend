const express = require('express');
const router = express.Router();
const stockController = require('./stock');

// Create a new stock entry
router.post('/addstocks', stockController.createStock);

// Read all stock entries
router.get('/stocks', stockController.getAllStocks);

// Read a single stock entry by ID
router.get('/stocks/:id', stockController.getStockById);
// Read a single stock entry by RegNo
router.get('/stock/:RegNo', stockController.getStockByRegNo);
// Update a stock entry by ID
router.put('/updatestocks/:id', stockController.updateStock);

// Delete a stock entry by ID
router.delete('/delstocks/:id', stockController.deleteStock);

module.exports = router;
