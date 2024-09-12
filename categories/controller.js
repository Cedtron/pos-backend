const express = require('express');
const router = express.Router();
const categoriesController = require('./categories'); 

// Create a new category
router.post('/addcategories', categoriesController.createCategory);

// Read all categories
router.get('/categories', categoriesController.getAllCategories);

// Read a single category by ID
router.get('/categories/:id', categoriesController.getCategoryById);

// Update a category
router.put('/updatecategories/:id', categoriesController.updateCategory);

// Delete a category
router.delete('/delcategories/:id', categoriesController.deleteCategory);

module.exports = router;
