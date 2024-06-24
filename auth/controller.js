const express = require('express');
const router = express.Router();
const authController = require('./auth');
const authMiddleware = require('../middleware/authMiddleware');

// Login route
router.post('/login', authController.loginUser);

// Logout route
router.post('/logout', authController.logoutUser);

// Protected route example
router.get('/protected', authMiddleware.authenticateToken, authController.protectedRoute);

module.exports = router;
