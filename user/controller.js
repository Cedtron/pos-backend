const express = require('express');
const router = express.Router();
const signupController = require('./user');

// Create a new signup entry
router.post('/signups', signupController.createSignup);

// Read all signup entries
router.get('/signups', signupController.getAllSignups);

// Read a single signup entry by ID
router.get('/signups/:id', signupController.getSignupById);

// Update a signup entry by ID
router.put('/signups/:id', signupController.updateSignup);

// Delete a signup entry by ID
router.delete('/signups/:id', signupController.deleteSignup);

module.exports = router;
