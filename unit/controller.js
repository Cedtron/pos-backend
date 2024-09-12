const express = require('express');
const router = express.Router();
const unitController = require('./unit');

// Create a new unit
router.post('/units', unitController.createUnit);

// Read all units
router.get('/units', unitController.getAllUnits);

// Read a single unit by ID
router.get('/units/:id', unitController.getUnitById);

// Update a unit by ID
router.put('/units/:id', unitController.updateUnit);

// Delete a unit by ID
router.delete('/units/:id', unitController.deleteUnit);

module.exports = router;
