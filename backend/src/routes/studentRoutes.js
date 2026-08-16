const express = require('express');
const studentController = require('../controllers/studentController');
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/count', studentController.getStudentCount);
router.get('/department/:deptId', studentController.getStudentsByDepartment);
router.post('/import', upload.single('file'), studentController.importStudents);
router.get('/', studentController.getAllStudents);
router.post('/', studentController.createStudent);
router.get('/:id/courses', studentController.getStudentCourses);
router.put('/:id/courses', studentController.setCourses);
router.post('/:id/courses', studentController.assignCourse);
router.delete('/:id/courses/:courseId', studentController.removeCourseFromStudent);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
