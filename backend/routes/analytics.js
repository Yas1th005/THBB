const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get analytics data
router.get('/:timeRange', [verifyToken, isAdmin], analyticsController.getAnalytics);

module.exports = router;



