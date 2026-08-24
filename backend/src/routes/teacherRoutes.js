const express = require('express');
const teacherController = require('../controllers/teacherController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/authorizationMiddleware');
const { distributedRateLimit } = require('../middleware/distributedRateLimit');

const router = express.Router();
router.use(authenticateToken, distributedRateLimit());
router.get('/', requirePermission('teachers:read'), teacherController.getAllTeachers);
router.post('/', requirePermission('teachers:write'), teacherController.createTeacher);
router.get('/:id/courses', requirePermission('teachers:read'), teacherController.getTeacherCourses);
router.put('/:id', requirePermission('teachers:write'), teacherController.updateTeacher);
router.delete('/:id', requirePermission('teachers:write'), teacherController.deleteTeacher);

module.exports = router;
