/**
 * =====================================================
 * studentRoutes.js
 * -----------------------------------------------------
 * Purpose:
 * Define all student API endpoints.
 *
 * Routes connect:
 *
 * HTTP Request
 *        |
 *        ↓
 * Controller Function
 *
 * =====================================================
 */

// Import express router
const express = require("express");

// Create router object
const router = express.Router();

// Import controller functions
const studentController = require("../controllers/studentController");

/**
 * =====================================================
 * CREATE STUDENT
 * =====================================================
 *
 * HTTP Method:
 * POST
 *
 * URL:
 * /api/students
 *
 * Request Body:
 *
 * {
 *   "name": "Abebe",
 *   "email": "abebe@gmail.com",
 *   "phone": "1234567890",
 *   "department_id": 1
 * }
 *
 */
router.post("/", studentController.createStudent);

/**
 * =====================================================
 * GET ALL ACTIVE STUDENTS
 * =====================================================
 *
 * HTTP Method:
 * GET
 *
 * URL:
 * /api/students
 *
 * Description:
 * Returns all students where is_deleted = FALSE
 *
 */
router.get("/", studentController.getAllStudents);

/**
 * =====================================================
 * GET TOTAL ACTIVE STUDENTS COUNT
 * =====================================================
 *
 * HTTP Method:
 * GET
 *
 * URL:
 * /api/students/count
 *
 * Description:
 * Returns the total number of active students
 *
 * Response:
 * {
 *   "success": true,
 *   "count": 5
 * }
 *
 */
router.get("/count", studentController.getStudentCount);

/**
 * =====================================================
 * GET STUDENTS BY DEPARTMENT
 * =====================================================
 *
 * HTTP Method:
 * GET
 *
 * URL:
 * /api/students/department/:deptId
 *
 * Example:
 * /api/students/department/1
 *
 * Description:
 * Returns all active students belonging to a specific department
 *
 */
router.get("/department/:deptId", studentController.getStudentsByDepartment);

/**
 * =====================================================
 * GET STUDENT BY ID
 * =====================================================
 *
 * HTTP Method:
 * GET
 *
 * URL:
 * /api/students/:id
 *
 * Example:
 * /api/students/1
 *
 */
router.get("/:id", studentController.getStudentById);

/**
 * =====================================================
 * UPDATE STUDENT
 * =====================================================
 *
 * HTTP Method:
 * PUT
 *
 * URL:
 * /api/students/:id
 *
 * Example:
 * PUT /api/students/1
 *
 * Request Body:
 * {
 *   "name": "Abebe",
 *   "email": "abebe@gmail.com",
 *   "phone": "1234567890",
 *   "department_id": 1
 * }
 *
 */
router.put("/:id", studentController.updateStudent);

/**
 * =====================================================
 * SOFT DELETE STUDENT
 * =====================================================
 *
 * HTTP Method:
 * DELETE
 *
 * URL:
 * /api/students/:id
 *
 * Description:
 * Sets is_deleted = TRUE instead of permanently deleting
 *
 */
router.delete("/:id", studentController.deleteStudent);

// Export router
module.exports = router;