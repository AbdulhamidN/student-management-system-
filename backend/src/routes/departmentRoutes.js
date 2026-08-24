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
const { authenticateToken } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/authorizationMiddleware");
const { distributedRateLimit } = require("../middleware/distributedRateLimit");
const router = express.Router();
router.use(authenticateToken, distributedRateLimit());
const departmentController = require("../controllers/departmentController");

router.post("/", requirePermission('departments:write'), departmentController.createDepartment);
router.get("/", requirePermission('departments:read'), departmentController.getAllDepartments);
router.get("/:id", requirePermission('departments:read'), departmentController.getDepartmentById);
router.put("/:id", requirePermission('departments:write'), departmentController.updateDepartment);
router.delete("/:id", requirePermission('departments:write'), departmentController.deleteDepartment);

module.exports = router;
