const express = require('express');
const router  = express.Router();
const suppliersController = require('./supplier');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addsuppliers',        auth, shopGuard, suppliersController.createSupplier);
router.get   ('/suppliers',           auth, shopGuard, suppliersController.getAllSuppliers);
router.get   ('/suppliers/:id',       auth, shopGuard, suppliersController.getSupplierById);
router.put   ('/updatesuppliers/:id', auth, shopGuard, suppliersController.updateSupplier);
router.delete('/delsuppliers/:id',    auth, shopGuard, suppliersController.deleteSupplier);

module.exports = router;
