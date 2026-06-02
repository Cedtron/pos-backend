const express = require('express');
const router  = express.Router();
const categoriesController = require('./categories');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addcategories',        auth, shopGuard, categoriesController.createCategory);
router.get   ('/categories',           auth, shopGuard, categoriesController.getAllCategories);
router.get   ('/categories/:id',       auth, shopGuard, categoriesController.getCategoryById);
router.put   ('/updatecategories/:id', auth, shopGuard, categoriesController.updateCategory);
router.delete('/delcategories/:id',    auth, shopGuard, categoriesController.deleteCategory);

module.exports = router;
