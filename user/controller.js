const express = require('express');
const router = express.Router();
const signupController = require('./user');
const upload = require('../middleware/upload');

// Create a new signup entry
router.post('/signup', upload.single('image'), signupController.createSignup);

// Read all signup entries
router.get('/users', signupController.getAllSignups);

// Read a single signup entry by ID
router.get('/users/:id', signupController.getSignupById);


// Update a signup entry by ID
router.put('/userupdate/:id', signupController.updateSignup);
router.put('/userstatus/:id', signupController.updateUserStatus);
// Delete a signup entry by ID
router.delete('/deluser/:id', signupController.deleteSignup);

module.exports = router;
