const express = require('express');
const router = express.Router();
const logsController = require('./activity'); // Adjust the path as needed

// Create a new log entry
router.post('/logs', logsController.createLog);

// Read all log entries
router.get('/logs', logsController.getAllLogs);

// Read a single log entry by ID
router.get('/logs/:id', logsController.getLogById);

// Update a log entry by ID
router.put('/logs/:id', logsController.updateLog);

// Delete a log entry by ID
router.delete('/logs/:id', logsController.deleteLog);

module.exports = router;
