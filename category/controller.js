const express = require('express');
const router = express.Router();
const categoryController = require('./category');

// Create a new category
router.post('/addcategories', categoryController.createCategory);

// Read all categories
router.get('/category', categoryController.getAllCategories);

// Read a single category by ID
router.get('/category/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/updatecategories/:id', categoryController.updateCategory);

// Delete a category by ID
router.delete('/delcategories/:id', categoryController.deleteCategory);

module.exports = router;
