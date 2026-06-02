const express = require('express');
const router  = express.Router();
const logsController = require('./activity');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/logs',    auth, shopGuard, logsController.createLog);
router.get   ('/logs',    auth, shopGuard, logsController.getAllLogs);
router.get   ('/logs/:id',auth, shopGuard, logsController.getLogById);
router.put   ('/logs/:id',auth, shopGuard, logsController.updateLog);
router.delete('/logs/:id',auth, shopGuard, logsController.deleteLog);

module.exports = router;
