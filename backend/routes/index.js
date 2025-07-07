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

module.exports = router;


