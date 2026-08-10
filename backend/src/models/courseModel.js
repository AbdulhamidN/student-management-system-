/**
 * =====================================================
 * courseModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for the courses table,
 * plus the student_courses junction table (assignments).
 * =====================================================
 */

const { pool } = require("../config/db");

const createCourse = async (course) => {
    const sql = `
        INSERT INTO courses (name, code, department_id)
        VALUES (?, ?, ?)
    `;
    const values = [course.name, course.code, course.department_id || null];
    const [result] = await pool.execute(sql, values);
    return result;
};

const getAllCourses = async () => {
    // Join so the department name is available without a second request
    const sql = `
        SELECT courses.*, departments.name AS department_name
        FROM courses
        LEFT JOIN departments ON courses.department_id = departments.id
    `;
    const [rows] = await pool.execute(sql);
    return rows;
};

const getCourseById = async (id) => {
    const [rows] = await pool.execute(
        "SELECT * FROM courses WHERE id=?",
        [id]
    );
    return rows[0];
};

const updateCourse = async (id, course) => {
    const sql = `
        UPDATE courses
        SET name=?, code=?, department_id=?
        WHERE id=?
    `;
    const values = [course.name, course.code, course.department_id || null, id];
    const [result] = await pool.execute(sql, values);
    return result;
};

const deleteCourse = async (id) => {
    const [result] = await pool.execute(
        "DELETE FROM courses WHERE id=?",
        [id]
    );
    return result;
};

/**
 * =====================================================
 * ASSIGN COURSE TO STUDENT (student_courses junction)
 * =====================================================
 */
const assignCourseToStudent = async (studentId, courseId) => {
    const sql = `
        INSERT INTO student_courses (student_id, course_id)
        VALUES (?, ?)
    `;
    const [result] = await pool.execute(sql, [studentId, courseId]);
    return result;
};

const getCoursesForStudent = async (studentId) => {
    const sql = `
        SELECT courses.*
        FROM courses
        INNER JOIN student_courses ON courses.id = student_courses.course_id
        WHERE student_courses.student_id = ?
    `;
    const [rows] = await pool.execute(sql, [studentId]);
    return rows;
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    assignCourseToStudent,
    getCoursesForStudent
};
