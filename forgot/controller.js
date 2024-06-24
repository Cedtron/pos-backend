const express = require('express');
const router = express.Router();
const forgotController = require('./forgot');

// Check if email exists
router.post('/check-email', forgotController.checkEmail);

// Confirm passhint code
router.post('/confirm-code', forgotController.confirmCode);

// Update password
router.post('/update-password', forgotController.updatePassword);

module.exports = router;
