const express = require('express');
const router = express.Router();
const categoryController = require('./category');

// Create a new category
router.post('/categories', categoryController.createCategory);

// Read all categories
router.get('/categories', categoryController.getAllCategories);

// Read a single category by ID
router.get('/categories/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/categories/:id', categoryController.updateCategory);

// Delete a category by ID
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;
