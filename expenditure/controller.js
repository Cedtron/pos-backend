const express = require('express');
const router = express.Router();
const expenseController = require('./expend');

// Create a new expense entry
router.post('/addexpenses', expenseController.createExpenseEntry);
 
// Read all expense entries
router.get('/expenses', expenseController.getAllExpenseEntries);

// Read a single expense entry by ID
router.get('/expenses/:id', expenseController.getExpenseEntryById);

// Update an expense entry by ID
router.put('/updatexpenses/:id', expenseController.updateExpenseEntry);

// Delete an expense entry by ID
router.delete('/delexpenses/:id', expenseController.deleteExpenseEntry);

module.exports = router;
