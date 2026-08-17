const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const { generateTemporaryPassword } = require('../utils/adminCredentials');

function normalizeTeacher(data = {}) {
  return {
    name: String(data.name || '').trim().replace(/\s+/g, ' '),
    email: String(data.email || '').trim().toLowerCase(),
    phone: data.phone ? String(data.phone).trim() : null,
    department_id: data.department_id ? Number(data.department_id) : null,
    courseIds: [...new Set((Array.isArray(data.courseIds) ? data.courseIds : []).map(Number).filter(Number.isInteger))],
  };
}

async function validateDepartmentAndCourses(departmentId, courseIds, connection = pool) {
  if (!departmentId) throw Object.assign(new Error('Department is required.'), { statusCode: 400 });
  const [departmentRows] = await connection.execute('SELECT id FROM departments WHERE id = ? LIMIT 1', [departmentId]);
  if (!departmentRows[0]) throw Object.assign(new Error('Selected department does not exist.'), { statusCode: 400 });

  if (!courseIds.length) return;
  const placeholders = courseIds.map(() => '?').join(',');
  const [courseRows] = await connection.execute(
    `SELECT id FROM courses WHERE department_id = ? AND id IN (${placeholders})`,
    [departmentId, ...courseIds]
  );
  if (courseRows.length !== courseIds.length) {
    throw Object.assign(new Error('All selected courses must belong to the selected department.'), { statusCode: 400 });
  }
}

async function getAllTeachers() {
  const [rows] = await pool.execute(`
    SELECT t.id, t.user_id, t.phone, t.department_id,
           u.name, u.email, d.name AS department_name,
           COUNT(tc.course_id) AS course_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN departments d ON d.id = t.department_id
    LEFT JOIN teacher_courses tc ON tc.teacher_id = t.id
    WHERE t.is_deleted = FALSE
    GROUP BY t.id
    ORDER BY u.name ASC
  `);
  return rows;
}

async function getTeacherCourses(teacherId) {
  const [rows] = await pool.execute(`
    SELECT c.id, c.name, c.code, c.department_id, d.name AS department_name
    FROM teacher_courses tc
    JOIN courses c ON c.id = tc.course_id
    LEFT JOIN departments d ON d.id = c.department_id
    WHERE tc.teacher_id = ?
    ORDER BY c.name ASC
  `, [teacherId]);
  return rows;
}

async function createTeacher(data) {
  const teacher = normalizeTeacher(data);
  const connection = await pool.getConnection();
  let temporaryPassword = null;
  try {
    await connection.beginTransaction();
    await validateDepartmentAndCourses(teacher.department_id, teacher.courseIds, connection);
    temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, \'teacher\', TRUE)',
      [teacher.name, teacher.email, passwordHash]
    );
    const [teacherResult] = await connection.execute(
      'INSERT INTO teachers (user_id, phone, department_id) VALUES (?, ?, ?)',
      [userResult.insertId, teacher.phone, teacher.department_id]
    );

    for (const courseId of teacher.courseIds) {
      await connection.execute('INSERT INTO teacher_courses (teacher_id, course_id) VALUES (?, ?)', [teacherResult.insertId, courseId]);
    }
    await connection.commit();
    return { id: teacherResult.insertId, userId: userResult.insertId, temporaryPassword };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

async function updateTeacher(id, data) {
  const teacher = normalizeTeacher(data);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      'SELECT id, user_id FROM teachers WHERE id = ? AND is_deleted = FALSE LIMIT 1', [id]
    );
    if (!existingRows[0]) return { affectedRows: 0 };
    await validateDepartmentAndCourses(teacher.department_id, teacher.courseIds, connection);
    await connection.execute('UPDATE users SET name = ?, email = ? WHERE id = ? AND role = \'teacher\'', [teacher.name, teacher.email, existingRows[0].user_id]);
    const [result] = await connection.execute(
      'UPDATE teachers SET phone = ?, department_id = ? WHERE id = ? AND is_deleted = FALSE',
      [teacher.phone, teacher.department_id, id]
    );
    await connection.execute('DELETE FROM teacher_courses WHERE teacher_id = ?', [id]);
    for (const courseId of teacher.courseIds) {
      await connection.execute('INSERT INTO teacher_courses (teacher_id, course_id) VALUES (?, ?)', [id, courseId]);
    }
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

async function deleteTeacher(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT user_id FROM teachers WHERE id = ? AND is_deleted = FALSE LIMIT 1', [id]);
    if (!rows[0]) return { affectedRows: 0 };
    const [result] = await connection.execute('UPDATE teachers SET is_deleted = TRUE WHERE id = ?', [id]);
    await connection.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [rows[0].user_id]);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

module.exports = { normalizeTeacher, getAllTeachers, getTeacherCourses, createTeacher, updateTeacher, deleteTeacher };
