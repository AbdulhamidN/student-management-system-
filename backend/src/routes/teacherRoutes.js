const express = require('express');
const teacherController = require('../controllers/teacherController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken, requireAdmin);
router.get('/', teacherController.getAllTeachers);
router.post('/', teacherController.createTeacher);
router.get('/:id/courses', teacherController.getTeacherCourses);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
