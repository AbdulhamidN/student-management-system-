/**
 * =====================================================
 * studentController.js
 * -----------------------------------------------------
 * Purpose:
 * Handle HTTP requests and responses for students.
 *
 * Responsibilities:
 * - Create student (with validation)
 * - Get all active students
 * - Get student by ID
 * - Update student (with validation)
 * - Soft delete student
 * - Get total active student count
 * - Get students by department
 * =====================================================
 */

const studentModel = require("../models/studentModel");

/**
 * CREATE STUDENT
 * POST /api/students
 */
exports.createStudent = async (req, res) => {
    try {
        const { name, email, phone, department_id } = req.body;

        // Validation: Return 400 if name or email is missing
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required fields"
            });
        }

        const result = await studentModel.createStudent({
            name,
            email,
            phone,
            department_id
        });

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            id: result.insertId
        });
    } catch (error) {
        // Handle duplicate email error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET ALL ACTIVE STUDENTS
 * GET /api/students
 */
exports.getAllStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET STUDENT BY ID
 * GET /api/students/:id
 */
exports.getStudentById = async (req, res) => {
    try {
        const student = await studentModel.getStudentById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * UPDATE STUDENT
 * PUT /api/students/:id
 */
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, phone, department_id } = req.body;

        // Validation: Return 400 if name or email is missing
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required fields"
            });
        }

        const result = await studentModel.updateStudent(req.params.id, {
            name,
            email,
            phone,
            department_id
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found or already deleted"
            });
        }

        res.json({
            success: true,
            message: "Student updated successfully"
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * SOFT DELETE STUDENT
 * DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res) => {
    try {
        const result = await studentModel.deleteStudent(req.params.id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Student soft-deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET TOTAL ACTIVE STUDENTS COUNT
 * GET /api/students/count
 */
exports.getStudentCount = async (req, res) => {
    try {
        const count = await studentModel.getActiveStudentCount();
        res.json({
            success: true,
            count: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET STUDENTS BY DEPARTMENT
 * GET /api/students/department/:deptId
 */
exports.getStudentsByDepartment = async (req, res) => {
    try {
        const deptId = req.params.deptId;
        const students = await studentModel.getStudentsByDepartment(deptId);
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};