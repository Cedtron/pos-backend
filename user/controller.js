const express = require('express');
const router = express.Router();
const signupController = require('./user');

// Create a new signup entry
router.post('/signup', signupController.createSignup);

// Read all signup entries
router.get('/users', signupController.getAllSignups);

// Read a single signup entry by ID
router.get('/user/:id', signupController.getSignupById);


// Update a signup entry by ID
router.put('/userupdate/:id', signupController.updateSignup);

// Delete a signup entry by ID
router.delete('/deluser/:id', signupController.deleteSignup);

module.exports = router;
