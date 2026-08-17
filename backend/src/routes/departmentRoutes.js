/**
 * =====================================================
 * departmentRoutes.js
 * =====================================================
 *
 * POST    /api/departments
 * GET     /api/departments
 * GET     /api/departments/:id
 * PUT     /api/departments/:id
 * DELETE  /api/departments/:id
 */

const express = require("express");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authenticateToken, requireAdmin);
const departmentController = require("../controllers/departmentController");

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
