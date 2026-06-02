const express = require('express');
const router  = express.Router();
const alerts  = require('./alerts');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.get ('/alerts/low-stock',          auth, shopGuard, alerts.getLowStockAlerts);
router.get ('/alerts/low-stock/count',    auth, shopGuard, alerts.getLowStockCount);
router.put ('/alerts/threshold/:product_id', auth, shopGuard, alerts.updateThreshold);

module.exports = router;
