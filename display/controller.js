const express = require('express');
const router = express.Router();
const displayController = require('./display');

router.post('/adddisplays', displayController.createDisplay);
router.get('/displays', displayController.getDisplays);
router.get('/displays/:regno', displayController.getDisplayById);
router.put('/updisplays/:regno', displayController.updateDisplay);
router.delete('/deldisplays/:id', displayController.deleteDisplay);

module.exports = router;
