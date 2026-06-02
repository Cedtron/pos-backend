const express = require('express');
const router  = express.Router();
const stockController = require('./stock');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addstocks',        auth, shopGuard, stockController.createStock);
router.get   ('/stocks',           auth, shopGuard, stockController.getAllStocks);
router.get   ('/stocks/:id',       auth, shopGuard, stockController.getStockById);
router.get   ('/stock/:RegNo',     auth, shopGuard, stockController.getStockByRegNo);
router.put   ('/updatestocks/:id', auth, shopGuard, stockController.updateStock);
router.delete('/delstocks/:id',    auth, shopGuard, stockController.deleteStock);

module.exports = router;
