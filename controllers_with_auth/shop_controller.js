const express = require('express');
const router  = express.Router();
const companyController = require('./shop');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

// Public: used during onboarding before any user is logged in
router.post('/addcompany',    companyController.createCompany);
router.get ('/check-company', companyController.checkIfCompanyExists);

// Public: needed by Layout to fetch branding (logo, color) right after login
// before token is in use; also used by e-commerce storefront
router.get('/company/:shop_code', companyController.getCompanyByShopCode);

// Protected: only logged-in shop members can list / edit / delete
router.get   ('/companies',              auth, companyController.getAllCompanies);
router.put   ('/updatecompany/:shop_code', auth, shopGuard, companyController.updateCompany);
router.delete('/delcompany/:shop_code',   auth, shopGuard, companyController.deleteCompany);

module.exports = router;
