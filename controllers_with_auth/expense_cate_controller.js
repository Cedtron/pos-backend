const express = require('express');
const router  = express.Router();
const categoryController = require('./expense');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addexpend-category',        auth, shopGuard, categoryController.createCategory);
router.get   ('/expend-category',           auth, shopGuard, categoryController.getAllCategories);
router.get   ('/expend-category/:id',       auth, shopGuard, categoryController.getCategoryById);
router.put   ('/updatexpend-category/:id',  auth, shopGuard, categoryController.updateCategoryById);
router.delete('/delexpend-category/:id',    auth, shopGuard, categoryController.deleteCategoryById);

module.exports = router;
