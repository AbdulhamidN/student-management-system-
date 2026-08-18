/**
 * =====================================================
 * departmentModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for the departments table.
 * =====================================================
 */

const { pool } = require("../config/db");

const createDepartment = async (department) => {
    const sql = `INSERT INTO departments (name) VALUES (?)`;
    const [result] = await pool.execute(sql, [department.name]);
    return result;
};

const getAllDepartments = async () => {
    const sql = `
        SELECT d.*,
          (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) AS student_count,
          (SELECT COUNT(*) FROM teachers t WHERE t.department_id = d.id) AS teacher_count,
          (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) AS course_count
        FROM departments d
        ORDER BY d.name ASC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
};

const getDepartmentById = async (id) => {
    const [rows] = await pool.execute(
        "SELECT * FROM departments WHERE id=?",
        [id]
    );
    return rows[0];
};

const updateDepartment = async (id, department) => {
    const sql = `UPDATE departments SET name=? WHERE id=?`;
    const [result] = await pool.execute(sql, [department.name, id]);
    return result;
};

const deleteDepartment = async (id) => {
    const [result] = await pool.execute(
        "DELETE FROM departments WHERE id=?",
        [id]
    );
    return result;
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
