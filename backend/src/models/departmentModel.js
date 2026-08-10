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
    const [rows] = await pool.execute("SELECT * FROM departments");
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
