/**
 * =====================================================
 * courseRoutes.js
 * =====================================================
 *
 * POST    /api/courses
 * GET     /api/courses
 * GET     /api/courses/:id
 * PUT     /api/courses/:id
 * DELETE  /api/courses/:id
 * POST    /api/courses/assign
 * GET     /api/courses/student/:studentId
 */

const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/authorizationMiddleware");
const { distributedRateLimit } = require("../middleware/distributedRateLimit");
const router = express.Router();
router.use(authenticateToken, distributedRateLimit());
const courseController = require("../controllers/courseController");

// IMPORTANT: specific routes before /:id so "assign" and "student"
// aren't swallowed by the :id param route
router.post("/assign", requirePermission('courses:write'), courseController.assignCourseToStudent);
router.get("/student/:studentId", requirePermission('courses:read'), courseController.getCoursesForStudent);

router.post("/", requirePermission('courses:write'), courseController.createCourse);
router.get("/", requirePermission('courses:read'), courseController.getAllCourses);
router.get("/department/:departmentId", requirePermission('courses:read'), courseController.getCoursesByDepartment);
router.get("/:id", requirePermission('courses:read'), courseController.getCourseById);
router.put("/:id", requirePermission('courses:write'), courseController.updateCourse);
router.delete("/:id", requirePermission('courses:write'), courseController.deleteCourse);

module.exports = router;