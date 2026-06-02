const express = require('express');
const router  = express.Router();
const customerController = require('./customer');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post  ('/addcustomers',       auth, shopGuard, customerController.createCustomer);
router.get   ('/customers',          auth, shopGuard, customerController.getAllCustomers);
router.get   ('/customers/:id',      auth, shopGuard, customerController.getCustomerById);
router.put   ('/updatecustomers/:id',auth, shopGuard, customerController.updateCustomer);
router.delete('/delcustomers/:id',   auth, shopGuard, customerController.deleteCustomer);

module.exports = router;
