/**
 * =====================================================
 * courseController.js
 * =====================================================
 */

const courseModel = require("../models/courseModel");

// CREATE  POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const { name, code, department_id } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Course name and code are required"
            });
        }

        const result = await courseModel.createCourse({ name, code, department_id });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL  GET /api/courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await courseModel.getAllCourses();
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BY ID  GET /api/courses/:id
exports.getCourseById = async (req, res) => {
    try {
        const course = await courseModel.getCourseById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE  PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const { name, code, department_id } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Course name and code are required"
            });
        }

        await courseModel.updateCourse(req.params.id, { name, code, department_id });

        res.json({ success: true, message: "Course updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE  DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        await courseModel.deleteCourse(req.params.id);
        res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ASSIGN COURSE TO STUDENT
 * POST /api/courses/assign
 * body: { student_id, course_id }
 */
exports.assignCourseToStudent = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;

        if (!student_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: "student_id and course_id are required"
            });
        }

        await courseModel.assignCourseToStudent(student_id, course_id);

        res.status(201).json({
            success: true,
            message: "Course assigned to student successfully"
        });
    } catch (error) {
        // Duplicate assignment (same student+course twice) hits the
        // composite primary key -> MySQL error code ER_DUP_ENTRY
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This student is already enrolled in this course"
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET COURSES FOR A STUDENT
 * GET /api/courses/student/:studentId
 */
exports.getCoursesForStudent = async (req, res) => {
    try {
        const courses = await courseModel.getCoursesForStudent(req.params.studentId);
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
