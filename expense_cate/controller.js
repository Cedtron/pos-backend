const express = require('express');
const router = express.Router();
const categoryController = require('./expense'); // Adjust the path if needed

// Create a new category
router.post('/addexpend-category', categoryController.createCategory);

// Get all categories
router.get('/expend-category', categoryController.getAllCategories);

// Get a single category by ID
router.get('/expend-category/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/updatexpend-category/:id', categoryController.updateCategoryById); // Note the :id parameter in the route

// Delete a category by ID
router.delete('/delexpend-category/:id', categoryController.deleteCategoryById); // Note the :id parameter in the route

module.exports = router;