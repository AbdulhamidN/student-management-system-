const express = require('express');
const { authenticateToken, requireAdmin, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted', user: req.user });
});

router.get('/teacher-only', authenticateToken, requireTeacher, (req, res) => {
  res.status(200).json({ success: true, message: 'Teacher access granted', user: req.user });
});

router.get('/student-only', authenticateToken, requireStudent, (req, res) => {
  res.status(200).json({ success: true, message: 'Student access granted', user: req.user });
});

module.exports = router;
