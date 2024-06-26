const express = require('express');
const router = express.Router();
const itemController = require('./items');

// Create a new item entry
router.post('/additems', itemController.createItemEntry);

// Read all item entries
router.get('/items', itemController.getAllItemEntries);

// Read a single item entry by ID
router.get('/items/:id', itemController.getItemEntryById);

// Update an item entry by ID
router.put('/itemsupdaate/:id', itemController.updateItemEntry);

// Delete an item entry by ID
router.delete('/itemsdel/:id', itemController.deleteItemEntry);

module.exports = router;
