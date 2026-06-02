const express = require('express');
const router  = express.Router();
const sa      = require('./superadmin');
const { authenticateToken: auth, requireRole } = require('../middleware/authMiddleware');

const adminOnly = [auth, requireRole(['admin'])];

// Read
router.get('/admin/summary',              ...adminOnly, sa.getSummary);
router.get('/admin/shops',                ...adminOnly, sa.getAllShops);
router.get('/admin/shop/:shop_code',      ...adminOnly, sa.getShopDetail);
router.get('/admin/revenue-chart',        ...adminOnly, sa.getRevenueChart);
router.get('/admin/shop-revenue',         ...adminOnly, sa.getShopRevenue);
router.get('/admin/activity',             ...adminOnly, sa.getRecentActivity);
router.get('/admin/subscription-stats',   ...adminOnly, sa.getSubscriptionStats);

// Shop actions
router.patch('/admin/shop/:shop_code/toggle',       ...adminOnly, sa.toggleShop);
router.put  ('/admin/shop/:shop_code/subscription', ...adminOnly, sa.updateShopSubscription);

// User actions
router.patch('/admin/user/:user_id/toggle',         ...adminOnly, sa.toggleUser);
router.patch('/admin/user/:user_id/reset-password', ...adminOnly, sa.resetUserPassword);

// Plan price
router.patch('/admin/plan/:plan_id/price',          ...adminOnly, sa.updatePlanPrice);

module.exports = router;
