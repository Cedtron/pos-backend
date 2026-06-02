const express = require('express');
const router  = express.Router();
const expenseController = require('./expend');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addexpenses',       auth, shopGuard, expenseController.createExpenseEntry);
router.get   ('/expenses',          auth, shopGuard, expenseController.getAllExpenseEntries);
router.get   ('/expenses/:id',      auth, shopGuard, expenseController.getExpenseEntryById);
router.put   ('/updatexpenses/:id', auth, shopGuard, expenseController.updateExpenseEntry);
router.delete('/delexpenses/:id',   auth, shopGuard, expenseController.deleteExpenseEntry);

module.exports = router;
