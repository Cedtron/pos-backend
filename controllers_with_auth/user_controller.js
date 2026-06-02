const express = require('express');
const router  = express.Router();
const signupController = require('./user');
const { upload } = require('../middleware/upload');
const { authenticateToken: auth, shopGuard, requireRole } = require('../middleware/authMiddleware');

// Public: creating a new user account (during shop onboarding)
router.post('/signup', upload.single('image'), signupController.createSignup);

// Protected: viewing / managing users requires login + same shop
router.get   ('/users',            auth, shopGuard, signupController.getAllSignups);
router.get   ('/users/:id',        auth, shopGuard, signupController.getSignupById);
router.put   ('/userupdate/:id',   auth, shopGuard, upload.single('image'), signupController.updateSignup);
router.put   ('/userstatus/:id',   auth, requireRole(['admin', 'manager']), signupController.updateUserStatus);
router.delete('/deluser/:id',      auth, requireRole(['admin']), signupController.deleteSignup);

module.exports = router;
