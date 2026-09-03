const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin', authenticateToken, requireAdmin, dashboardController.getAdminDashboard);

module.exports = router;
