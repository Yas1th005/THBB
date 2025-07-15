const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Backend is connected successfully!' });
});

// Auth routes
router.use('/auth', require('./auth.routes'));

// Menu routes
router.use('/menu', require('./menu.routes'));

// User routes
router.use('/users', require('./user.routes'));

// Order routes
router.use('/orders', require('./order.routes'));

module.exports = router;


