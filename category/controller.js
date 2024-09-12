const express = require('express');
const router = express.Router();
const categoryController = require('./category');

// Create a new category
router.post('/addcategory', categoryController.createCategory);

// Read all categories
router.get('/category', categoryController.getAllCategories);

// Read a single category by ID
router.get('/category/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/updatecategory/:id', categoryController.updateCategory);

// Delete a category by ID
router.delete('/delcategory/:id', categoryController.deleteCategory);

module.exports = router;
