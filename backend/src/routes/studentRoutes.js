const express = require('express');
const studentController = require('../controllers/studentController');
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requirePermission, requireAnyPermission, studentRecordPolicy } = require('../middleware/authorizationMiddleware');
const { distributedRateLimit } = require('../middleware/distributedRateLimit');

const router = express.Router();
router.use(authenticateToken, distributedRateLimit());

router.get('/count', requirePermission('students:read'), studentController.getStudentCount);
router.get('/department/:deptId', requirePermission('students:read'), studentController.getStudentsByDepartment);
router.post('/import', requirePermission('students:write'), upload.single('file'), studentController.importStudents);
router.get('/', requirePermission('students:read'), studentController.getAllStudents);
router.post('/', requirePermission('students:write'), studentController.createStudent);
router.get('/:id/courses', requireAnyPermission(['students:read', 'students:read:own', 'students:read:own-department'], studentRecordPolicy), studentController.getStudentCourses);
router.put('/:id/courses', requirePermission('students:write'), studentController.setCourses);
router.post('/:id/courses', requirePermission('students:write'), studentController.assignCourse);
router.delete('/:id/courses/:courseId', requirePermission('students:write'), studentController.removeCourseFromStudent);
router.get('/:id', requireAnyPermission(['students:read', 'students:read:own', 'students:read:own-department'], studentRecordPolicy), studentController.getStudentById);
router.put('/:id', requirePermission('students:write'), studentController.updateStudent);
router.delete('/:id', requirePermission('students:write'), studentController.deleteStudent);

module.exports = router;
