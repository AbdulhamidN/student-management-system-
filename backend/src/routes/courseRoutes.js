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
const router = express.Router();
router.use(authenticateToken);
const courseController = require("../controllers/courseController");

// IMPORTANT: specific routes before /:id so "assign" and "student"
// aren't swallowed by the :id param route
router.post("/assign", courseController.assignCourseToStudent);
router.get("/student/:studentId", courseController.getCoursesForStudent);

router.post("/", courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.get("/department/:departmentId", courseController.getCoursesByDepartment);
router.get("/:id", courseController.getCourseById);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;