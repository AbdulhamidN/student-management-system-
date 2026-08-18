const express = require('express');
const teacherController = require('../controllers/teacherController');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher self-profile management
router.get('/me', authenticateToken, requireTeacher, teacherController.getTeacherProfile);
router.put('/me', authenticateToken, requireTeacher, teacherController.updateTeacherProfile);

// Admin-only teacher management
router.get('/', authenticateToken, requireAdmin, teacherController.getAllTeachers);
router.get('/:id', authenticateToken, requireAdmin, teacherController.getTeacherById);
router.get('/:id/courses', authenticateToken, requireAdmin, teacherController.getTeacherCourses);
router.post('/', authenticateToken, requireAdmin, teacherController.createTeacher);
router.put('/:id', authenticateToken, requireAdmin, teacherController.updateTeacher);
router.delete('/:id', authenticateToken, requireAdmin, teacherController.deleteTeacher);

module.exports = router;
