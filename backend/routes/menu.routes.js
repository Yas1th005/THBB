const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get all menu items (public)
router.get('/', menuController.getAllItems);

// Get a single menu item by ID (public)
router.get('/:id', menuController.getItemById);

// Create a new menu item (admin only)
router.post('/', [verifyToken, isAdmin], menuController.createItem);

// Update a menu item (admin only)
router.put('/:id', [verifyToken, isAdmin], menuController.updateItem);

// Toggle menu item availability (admin only)
router.put('/:id/availability', [verifyToken, isAdmin], menuController.toggleAvailability);

// Create sample menu items (admin only, for development)
router.post('/sample', [verifyToken, isAdmin], menuController.createSampleItems);

// Delete a menu item (admin only)
router.delete('/:id', [verifyToken, isAdmin], menuController.deleteItem);

module.exports = router;


