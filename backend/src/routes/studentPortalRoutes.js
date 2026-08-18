const express = require('express');
const studentPortalController = require('../controllers/studentPortalController');
const { authenticateToken, requireStudent, requireTeacher } = require('../middleware/authMiddleware');

const router = express.Router();

// Student-only portal endpoints
router.get('/profile', authenticateToken, requireStudent, studentPortalController.getStudentProfile);
router.get('/schedule', authenticateToken, requireStudent, studentPortalController.getSelfSchedule);
router.post('/schedule', authenticateToken, requireStudent, studentPortalController.createSelfSchedule);
router.delete('/schedule/:id', authenticateToken, requireStudent, studentPortalController.deleteSelfSchedule);
router.get('/results', authenticateToken, requireStudent, studentPortalController.getAcademicResults);
router.get('/exam-schedules', authenticateToken, requireStudent, studentPortalController.getExamSchedules);
router.get('/notifications', authenticateToken, requireStudent, studentPortalController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, requireStudent, studentPortalController.markNotificationRead);
router.get('/announcements', authenticateToken, studentPortalController.getAnnouncements);

// Teacher actions for Student Panel
router.post('/exam-schedules', authenticateToken, requireTeacher, studentPortalController.createExamSchedule);
router.post('/notifications', authenticateToken, requireTeacher, studentPortalController.sendNotification);

module.exports = router;
