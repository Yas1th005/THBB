const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Create a new order
router.post('/', verifyToken, orderController.createOrder);

// Get user's orders
router.get('/user', verifyToken, orderController.getUserOrders);

// Get order by token
router.get('/token/:token', verifyToken, orderController.getOrderByToken);

// Assign delivery guy to an order (admin only)
router.post('/assign-delivery', [verifyToken, isAdmin], orderController.assignDeliveryGuy);

// Get orders assigned to a delivery person
router.get('/assigned/:deliveryGuyId', verifyToken, orderController.getAssignedOrders);

// Update order status
router.put('/:orderId/status', verifyToken, orderController.updateOrderStatus);

// Get all orders (admin only)
router.get('/all', [verifyToken, isAdmin], orderController.getAllOrders);

// Get orders by user ID (admin only)
router.get('/user/:userId', [verifyToken, isAdmin], orderController.getOrdersByUserId);

module.exports = router;

 



