const express = require('express');
const { authenticateToken, requireAdmin, requireTeacher, requireStudent } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/authorizationMiddleware');

const router = express.Router();

router.get('/admin-only', authenticateToken, requirePermission('students:write'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted', user: req.user });
});

router.get('/teacher-only', authenticateToken, requirePermission('students:read:own-department'), (req, res) => {
  res.status(200).json({ success: true, message: 'Teacher access granted', user: req.user });
});

router.get('/student-only', authenticateToken, requirePermission('students:read:own'), (req, res) => {
  res.status(200).json({ success: true, message: 'Student access granted', user: req.user });
});

module.exports = router;
