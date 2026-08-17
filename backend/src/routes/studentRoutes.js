const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticateToken, requireAdmin, requireTeacherOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Read student list & student details (Teachers and Admins)
router.get('/', authenticateToken, studentController.getAllStudents);
router.get('/:id', authenticateToken, studentController.getStudentById);

// Gradebook mark entry & updates (Teachers and Admins)
router.patch('/:id/marks', authenticateToken, requireTeacherOrAdmin, studentController.updateStudentMarks);
router.put('/:id/marks', authenticateToken, requireTeacherOrAdmin, studentController.updateStudentMarks);

// Student registration CRUD (Admin ONLY - Teachers get 403 Forbidden)
router.post('/', authenticateToken, requireAdmin, studentController.createStudent);
router.put('/:id', authenticateToken, requireAdmin, studentController.updateStudent);
router.delete('/:id', authenticateToken, requireAdmin, studentController.deleteStudent);

module.exports = router;
