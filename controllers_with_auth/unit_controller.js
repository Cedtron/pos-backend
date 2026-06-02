const express = require('express');
const router  = express.Router();
const unitController = require('./unit');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/units',    auth, shopGuard, unitController.createUnit);
router.get   ('/units',    auth, shopGuard, unitController.getAllUnits);
router.get   ('/units/:id',auth, shopGuard, unitController.getUnitById);
router.put   ('/units/:id',auth, shopGuard, unitController.updateUnit);
router.delete('/units/:id',auth, shopGuard, unitController.deleteUnit);

module.exports = router;
