const express = require('express');
const router = express.Router();
const timeController = require('./activity');

// Create a new time entry
router.post('/addtimes', timeController.createTimeEntry);

// Read all time entries
router.get('/times', timeController.getAllTimeEntries);

// Read a single time entry by ID
router.get('/times/:id', timeController.getTimeEntryById);

// Update a time entry by ID
router.put('/updatetimes/:id', timeController.updateTimeEntry);

// Delete a time entry by ID
router.delete('/deltimes/:id', timeController.deleteTimeEntry);

module.exports = router;
