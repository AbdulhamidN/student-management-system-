/**
 * =====================================================
 * departmentController.js
 * =====================================================
 */

const departmentModel = require("../models/departmentModel");

// CREATE  POST /api/departments
exports.createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const result = await departmentModel.createDepartment({ name });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL  GET /api/departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentModel.getAllDepartments();
        res.json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BY ID  GET /api/departments/:id
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await departmentModel.getDepartmentById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE  PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        await departmentModel.updateDepartment(req.params.id, { name });

        res.json({ success: true, message: "Department updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE  DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
    try {
        await departmentModel.deleteDepartment(req.params.id);
        res.json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
