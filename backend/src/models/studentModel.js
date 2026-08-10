/**
 * =====================================================
 * studentModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for students table.
 *
 * Responsibilities:
 * - Insert student (with phone and department_id)
 * - Get active students (joined with departments)
 * - Get student by ID (joined with departments)
 * - Update student (with phone and department_id)
 * - Soft delete student (set is_deleted = TRUE)
 * - Get total active student count
 * - Get students by department
 * =====================================================
 */

// Import database connection pool
const pool = require("../config/db");

/**
 * =====================================================
 * CREATE STUDENT
 * =====================================================
 * Insert new student into database with phone and department_id
 */
const createStudent = async (student) => {
    const sql = `
        INSERT INTO students
        (name, email, phone, department_id)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        student.name,
        student.email,
        student.phone,
        student.department_id
    ];

    const [result] = await pool.execute(sql, values);
    return result;
};

/**
 * =====================================================
 * GET ALL ACTIVE STUDENTS
 * =====================================================
 * Returns only students with is_deleted = FALSE
 * Joins with departments table to get department name
 */
const getAllStudents = async () => {
    const [rows] = await pool.execute(`
        SELECT s.*, d.name AS department_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.is_deleted = FALSE
    `);
    return rows;
};

/**
 * =====================================================
 * GET STUDENT BY ID
 * =====================================================
 * Returns a single active student with department name
 */
const getStudentById = async (id) => {
    const [rows] = await pool.execute(`
        SELECT s.*, d.name AS department_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.id = ? AND s.is_deleted = FALSE
    `, [id]);
    return rows[0];
};

/**
 * =====================================================
 * UPDATE STUDENT
 * =====================================================
 * Update student details (only if not soft-deleted)
 */
const updateStudent = async (id, student) => {
    const sql = `
        UPDATE students
        SET name = ?,
            email = ?,
            phone = ?,
            department_id = ?
        WHERE id = ? AND is_deleted = FALSE
    `;

    const values = [
        student.name,
        student.email,
        student.phone,
        student.department_id,
        id
    ];

    const [result] = await pool.execute(sql, values);
    return result;
};

/**
 * =====================================================
 * SOFT DELETE STUDENT
 * =====================================================
 * Instead of deleting, set is_deleted = TRUE
 */
const deleteStudent = async (id) => {
    const [result] = await pool.execute(
        "UPDATE students SET is_deleted = TRUE WHERE id = ?",
        [id]
    );
    return result;
};

/**
 * =====================================================
 * GET ACTIVE STUDENT COUNT
 * =====================================================
 * Returns total number of students with is_deleted = FALSE
 */
const getActiveStudentCount = async () => {
    const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM students WHERE is_deleted = FALSE"
    );
    return rows[0].count;
};

/**
 * =====================================================
 * GET STUDENTS BY DEPARTMENT
 * =====================================================
 * Returns active students belonging to a specific department
 */
const getStudentsByDepartment = async (departmentId) => {
    const [rows] = await pool.execute(`
        SELECT s.*, d.name AS department_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.department_id = ? AND s.is_deleted = FALSE
    `, [departmentId]);
    return rows;
};

// Export functions
module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getActiveStudentCount,
    getStudentsByDepartment
};