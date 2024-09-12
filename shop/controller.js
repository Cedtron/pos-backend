const express = require('express');
const router = express.Router();
const companyController = require('./shop');

// Create a new company entry
router.post('/addcompany', companyController.createCompany);
 
// Read all company entries
router.get('/companies', companyController.getAllCompanies);

// Read a single company entry by shop_code
router.get('/company/:shop_code', companyController.getCompanyByShopCode); // Updated to use shop_code

// Update a company entry by shop_code
router.put('/updatecompany/:shop_code', companyController.updateCompany); // Updated to use shop_code

// Delete a company entry by shop_code
router.delete('/delcompany/:shop_code', companyController.deleteCompany); // Updated to use shop_code


router.get('/check-company', companyController.checkIfCompanyExists); 

module.exports = router;
