const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get user profile
router.get('/profile', verifyToken, userController.getUserProfile);

// Update user address
router.put('/update-address', verifyToken, userController.updateUserAddress);

// Get all delivery personnel (admin only)
router.get('/delivery', [verifyToken, isAdmin], userController.getDeliveryPersonnel);

module.exports = router;


