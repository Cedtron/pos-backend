const express = require('express');
const router  = express.Router();
const displayController = require('./display');
const { authenticateToken: auth, shopGuard } = require('../middleware/authMiddleware');

router.post('/adddisplays',         auth, shopGuard, displayController.createDisplay);
router.get ('/displays',            auth, shopGuard, displayController.getDisplays);
router.get ('/displays/:regno',     auth,            displayController.getDisplayById);
router.put ('/updisplays/:regno',   auth, shopGuard, displayController.updateDisplay);
router.delete('/deldisplays/:id',   auth, shopGuard, displayController.deleteDisplay);

module.exports = router;
