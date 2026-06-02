const express = require('express');
const router  = express.Router();
const productController = require('./product');
const upload  = require('./upload');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

// Protected product management
router.post  ('/addproducts',               auth, shopGuard, productController.createProduct);
router.get   ('/products',                  auth, shopGuard, productController.getAllProducts);
router.get   ('/products/:id',              auth, shopGuard, productController.getProductById);
router.put   ('/productsupdate/:id',        auth, shopGuard, productController.updateProducts);
router.put   ('/update-product/:RegNo',     auth, shopGuard, productController.updateProduct);
router.delete('/delproducts/:id',           auth, shopGuard, productController.deleteProduct);

// Image upload — requires auth but no shopGuard (shop_code not in this request)
router.post('/upload', auth, upload.array('file', 10), productController.uploadImages);

// Public: product detail view (used by e-commerce storefront / barcode scan)
router.get('/product/:shop_code/:RegNo', productController.getProductByShopCodeAndRegNo);

module.exports = router;
