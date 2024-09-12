const express = require('express');
const router = express.Router();
const productController = require('./product');
const upload = require('./upload');

// Create a new product
router.post('/addproducts', productController.createProduct);

// Read all products
router.get('/products', productController.getAllProducts);

// Read a single product by ID
router.get('/products/:id', productController.getProductById);

// Update a product by ID
router.put('/productsupdate/:id', productController.updateProducts);

router.put('/update-product/:RegNo', productController.updateProduct);
// Delete a product by ID
router.delete('/delproducts/:id', productController.deleteProduct);

// Upload images
router.post('/upload', upload.array('file', 10), productController.uploadImages);

module.exports = router;