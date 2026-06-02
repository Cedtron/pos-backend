const express = require('express');
const router  = express.Router();
const ec      = require('./ecommerce');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

// ── Public storefront (no auth) ───────────────────────────────────────────────
router.get('/store/:shop_code',                    ec.getStorefront);
router.get('/store/:shop_code/products',           ec.getStoreProducts);
router.get('/store/:shop_code/categories',         ec.getStoreCategories);
router.get('/store/:shop_code/product/:RegNo',     ec.getStoreProduct);
router.post('/store/:shop_code/order',             ec.placeOrder);
router.get('/store/order/:RegNo',                  ec.getOrderStatus);   // ?email=

// ── Protected: shop owner manages their orders ────────────────────────────────
router.get('/ecom-orders',           auth, shopGuard, ec.getShopOrders);
router.put('/ecom-orders/:id/status',auth, shopGuard, ec.updateOrderStatus);

module.exports = router;
