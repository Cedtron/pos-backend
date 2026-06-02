const express = require('express');
const router  = express.Router();
const salesController = require('./sales');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addsales',        auth, shopGuard, salesController.createSalesEntry);
router.get   ('/sales',           auth, shopGuard, salesController.getAllSalesEntries);
router.get   ('/sales/:id',       auth, shopGuard, salesController.getSalesEntryById);
router.get   ('/sale/:user',      auth, shopGuard, salesController.getSalesEntryByUser);
router.put   ('/updatesales/:id', auth, shopGuard, salesController.updateSalesEntry);
router.delete('/delsales/:id',    auth, shopGuard, salesController.deleteSalesEntry);

module.exports = router;
