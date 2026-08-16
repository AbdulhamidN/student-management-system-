const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const { generateTemporaryPassword } = require('../utils/adminCredentials');

const normalizeStudent = (student) => ({
  name: String(student.name || '').trim().replace(/\s+/g, ' '),
  email: String(student.email || '').trim().toLowerCase(),
  phone: student.phone ? String(student.phone).trim() : null,
  department_id: student.department_id ? Number(student.department_id) : null,
});

async function getAllStudents() {
  const [rows] = await pool.execute(`
    SELECT s.id, s.user_id, s.name, s.email, s.phone, s.department_id,
           d.name AS department_name,
           COUNT(sc.course_id) AS course_count
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
    LEFT JOIN student_courses sc ON sc.student_id = s.id
    WHERE s.is_deleted = FALSE
    GROUP BY s.id
    ORDER BY s.name ASC
  `);
  return rows;
}

async function getStudentById(id, connection = pool) {
  const [rows] = await connection.execute(`
    SELECT s.id, s.user_id, s.name, s.email, s.phone, s.department_id,
           d.name AS department_name
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
    WHERE s.id = ? AND s.is_deleted = FALSE
    LIMIT 1
  `, [id]);
  return rows[0] || null;
}

async function getActiveStudentCount() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM students WHERE is_deleted = FALSE');
  return Number(rows[0].count);
}

async function getStudentsByDepartment(departmentId) {
  const [rows] = await pool.execute(`
    SELECT s.id, s.user_id, s.name, s.email, s.phone, s.department_id,
           d.name AS department_name
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
    WHERE s.department_id = ? AND s.is_deleted = FALSE
    ORDER BY s.name ASC
  `, [departmentId]);
  return rows;
}

async function createStudent(student, { createLogin = true } = {}) {
  const data = normalizeStudent(student);
  const connection = await pool.getConnection();
  let temporaryPassword = null;
  try {
    await connection.beginTransaction();
    let userId = null;

    if (createLogin) {
      temporaryPassword = generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, \'student\', TRUE)',
        [data.name, data.email, passwordHash]
      );
      userId = userResult.insertId;
    }

    const [result] = await connection.execute(
      'INSERT INTO students (user_id, name, email, phone, department_id) VALUES (?, ?, ?, ?, ?)',
      [userId, data.name, data.email, data.phone, data.department_id]
    );

    await connection.commit();
    return { ...result, userId, temporaryPassword };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateStudent(id, student) {
  const data = normalizeStudent(student);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const existing = await getStudentById(id, connection);
    if (!existing) return { affectedRows: 0 };

    const [result] = await connection.execute(
      `UPDATE students SET name = ?, email = ?, phone = ?, department_id = ?
       WHERE id = ? AND is_deleted = FALSE`,
      [data.name, data.email, data.phone, data.department_id, id]
    );

    if (existing.user_id) {
      await connection.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ? AND role = \'student\'',
        [data.name, data.email, existing.user_id]
      );
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteStudent(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const existing = await getStudentById(id, connection);
    if (!existing) return { affectedRows: 0 };
    const [result] = await connection.execute('UPDATE students SET is_deleted = TRUE WHERE id = ?', [id]);
    if (existing.user_id) {
      await connection.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [existing.user_id]);
    }
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getStudentCourses(studentId) {
  const [rows] = await pool.execute(`
    SELECT c.id, c.name, c.code, c.department_id, d.name AS department_name
    FROM student_courses sc
    JOIN courses c ON c.id = sc.course_id
    LEFT JOIN departments d ON d.id = c.department_id
    WHERE sc.student_id = ?
    ORDER BY c.name ASC
  `, [studentId]);
  return rows;
}

async function setStudentCourses(studentId, courseIds) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [studentRows] = await connection.execute(
      'SELECT department_id FROM students WHERE id = ? AND is_deleted = FALSE LIMIT 1',
      [studentId]
    );
    if (!studentRows[0]) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

    const ids = [...new Set((courseIds || []).map(Number).filter(Number.isInteger))];
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      const [courseRows] = await connection.execute(
        `SELECT id FROM courses WHERE department_id = ? AND id IN (${placeholders})`,
        [studentRows[0].department_id, ...ids]
      );
      if (courseRows.length !== ids.length) {
        throw Object.assign(new Error('One or more selected courses do not belong to the student department.'), { statusCode: 400 });
      }
    }

    await connection.execute('DELETE FROM student_courses WHERE student_id = ?', [studentId]);
    for (const courseId of ids) {
      await connection.execute('INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)', [studentId, courseId]);
    }
    await connection.commit();
    return ids;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function removeCourseFromStudent(studentId, courseId) {
  const [result] = await pool.execute(
    'DELETE FROM student_courses WHERE student_id = ? AND course_id = ?',
    [studentId, courseId]
  );
  return result;
}

async function validateDepartment(departmentId, connection = pool) {
  if (!departmentId) return true;
  const [rows] = await connection.execute('SELECT id FROM departments WHERE id = ? LIMIT 1', [departmentId]);
  return Boolean(rows[0]);
}

module.exports = {
  normalizeStudent,
  getAllStudents,
  getStudentById,
  getActiveStudentCount,
  getStudentsByDepartment,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentCourses,
  setStudentCourses,
  removeCourseFromStudent,
  validateDepartment,
};
