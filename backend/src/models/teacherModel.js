const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

function normalizeTeacher(data = {}) {
  return {
    name: String(data.name || '').trim().replace(/\s+/g, ' '),
    email: String(data.email || '').trim().toLowerCase(),
    department: String(data.department || '').trim(),
    subject: String(data.subject || '').trim(),
    phone: data.phone ? String(data.phone).trim() : null,
    bio: data.bio ? String(data.bio).trim() : null,
  };
}

async function getTeacherByUserId(userId) {
  const [rows] = await pool.execute(`
    SELECT t.id AS id, t.id AS teacher_id, t.user_id,
           COALESCE(t.name, u.name) AS name,
           u.email,
           t.department,
           t.subject,
           t.phone,
           t.bio
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE t.user_id = ?
    LIMIT 1
  `, [userId]);
  return rows[0] || null;
}

async function getTeacherById(id) {
  const [rows] = await pool.execute(`
    SELECT t.id AS id, t.id AS teacher_id, t.user_id,
           COALESCE(t.name, u.name) AS name,
           u.email,
           t.department,
           t.subject,
           t.phone,
           t.bio
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE t.id = ?
    LIMIT 1
  `, [id]);
  return rows[0] || null;
}

async function getAllTeachers() {
  const [rows] = await pool.execute(`
    SELECT t.id, t.id AS teacher_id, t.user_id, t.phone, t.department, t.subject, t.bio,
           COALESCE(t.name, u.name) AS name, u.email
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    ORDER BY u.name ASC
  `);
  return rows;
}

async function updateTeacherProfile(userId, data) {
  const teacher = normalizeTeacher(data);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [userId]);

    if (existing.length === 0) {
      await connection.execute(
        'INSERT INTO teachers (user_id, name, department, subject, phone, bio) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, teacher.name, teacher.department, teacher.subject, teacher.phone, teacher.bio]
      );
    } else {
      await connection.execute(
        'UPDATE teachers SET name = ?, department = ?, subject = ?, phone = ?, bio = ? WHERE user_id = ?',
        [teacher.name, teacher.department, teacher.subject, teacher.phone, teacher.bio, userId]
      );
    }

    if (teacher.name) {
      await connection.execute('UPDATE users SET name = ? WHERE id = ?', [teacher.name, userId]);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createTeacher(data) {
  const teacher = normalizeTeacher(data);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const passwordHash = await bcrypt.hash(data.password || 'Password123!', 10);
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, \'teacher\')',
      [teacher.name, teacher.email, passwordHash]
    );
    const [teacherResult] = await connection.execute(
      'INSERT INTO teachers (user_id, name, department, subject, phone, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, teacher.name, teacher.department, teacher.subject, teacher.phone, teacher.bio]
    );
    await connection.commit();
    return { id: teacherResult.insertId, userId: userResult.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateTeacher(id, data) {
  const teacher = normalizeTeacher(data);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      'SELECT id, user_id FROM teachers WHERE id = ? LIMIT 1', [id]
    );
    if (!existingRows[0]) return { affectedRows: 0 };
    await connection.execute('UPDATE users SET name = ?, email = ? WHERE id = ? AND role = \'teacher\'', [teacher.name, teacher.email, existingRows[0].user_id]);
    const [result] = await connection.execute(
      'UPDATE teachers SET name = ?, department = ?, subject = ?, phone = ?, bio = ? WHERE id = ?',
      [teacher.name, teacher.department, teacher.subject, teacher.phone, teacher.bio, id]
    );
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteTeacher(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT user_id FROM teachers WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) return { affectedRows: 0 };
    const [result] = await connection.execute('DELETE FROM teachers WHERE id = ?', [id]);
    await connection.execute('DELETE FROM users WHERE id = ?', [rows[0].user_id]);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  normalizeTeacher,
  getTeacherByUserId,
  getTeacherById,
  getAllTeachers,
  updateTeacherProfile,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
