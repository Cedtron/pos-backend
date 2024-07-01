const express = require('express');
const router = express.Router();
const productController = require('./product');

// Create a new product
router.post('/addproducts', productController.createProduct);

// Read all products
router.get('/products', productController.getAllProducts);

// Read a single product by ID
router.get('/products/:id', productController.getProductById);

// Update a product by ID
router.put('/productsupdate/:id', productController.updateProduct);

// Delete a product by ID
router.delete('/delproducts/:id', productController.deleteProduct);

module.exports = router;
