const express  = require('express');
const router   = express.Router();
const sub      = require('./subscribe');
const { authenticateToken: auth, shopGuard, requireRole } = require('../middleware/authMiddleware');

// ─── Public: pricing page reads plans without login ──────────────────────────
router.get('/plans', sub.getAllPlans);
router.get('/plans/:id', sub.getPlanById);

// ─── Public: feature gate check (frontend calls this to decide what to show) ─
router.get('/can-access/:shop_code/:feature_key', auth, sub.checkFeatureAccess);

// ─── Shop: get own subscription ───────────────────────────────────────────────
router.get('/subscription/:shop_code', auth, shopGuard, sub.getShopSubscription);

// ─── Shop: subscribe / upgrade ────────────────────────────────────────────────
router.post('/subscription', auth, shopGuard, sub.subscribeToPlan);

// ─── Super-admin: manage plans + view all subscriptions ──────────────────────
// requireRole(['admin']) — only admin users can create/edit/delete plans
router.post  ('/plans',        auth, requireRole(['admin']), sub.createPlan);
router.put   ('/plans/:id',    auth, requireRole(['admin']), sub.updatePlan);
router.delete('/plans/:id',    auth, requireRole(['admin']), sub.deletePlan);
router.get   ('/subscriptions',auth, requireRole(['admin']), sub.getAllSubscriptions);

module.exports = router;
