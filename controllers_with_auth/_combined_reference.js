/**
 * PROTECTED CONTROLLERS — Gula Nang auth patch
 * Each file below replaces the matching controller.js in pos-backend-main.
 * Every route (except public ones) now requires a valid JWT + matching shop_code.
 *
 * HOW TO USE THIS FILE:
 * Split it at each "// ════ FILE: ..." marker and save as the indicated path.
 * Or just copy the individual controller blocks from the patch zip.
 */

// ════ FILE: categories/controller.js ════════════════════════════════════════
const express_cat      = require('express');
const router_cat       = express_cat.Router();
const categoriesCtrl   = require('./categories');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router_cat.post  ('/addcategories',       auth, shopGuard, categoriesCtrl.createCategory);
router_cat.get   ('/categories',          auth, shopGuard, categoriesCtrl.getAllCategories);
router_cat.get   ('/categories/:id',      auth, shopGuard, categoriesCtrl.getCategoryById);
router_cat.put   ('/updatecategories/:id',auth, shopGuard, categoriesCtrl.updateCategory);
router_cat.delete('/delcategories/:id',   auth, shopGuard, categoriesCtrl.deleteCategory);

module.exports = router_cat;
