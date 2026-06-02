const express = require('express');
const router  = express.Router();
const categoryController = require('./category');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addcategory',        auth, shopGuard, categoryController.createCategory);
router.get   ('/category',           auth, shopGuard, categoryController.getAllCategories);
router.get   ('/category/:id',       auth, shopGuard, categoryController.getCategoryById);
router.put   ('/updatecategory/:id', auth, shopGuard, categoryController.updateCategory);
router.delete('/delcategory/:id',    auth, shopGuard, categoryController.deleteCategory);

module.exports = router;
