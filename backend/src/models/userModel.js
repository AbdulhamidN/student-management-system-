const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser({ name, email, password, role }, connection = pool) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await connection.execute(
    'INSERT INTO users (name, email, password_hash, role, is_active, must_change_password) VALUES (?, ?, ?, ?, TRUE, ?)',
    [name, email, passwordHash, role, role === 'student']
  );
  return result;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, is_active, must_change_password, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function changeInitialPassword(userId, passwordHash) {
  const [result] = await pool.execute(
    `UPDATE users
     SET password_hash = ?, must_change_password = FALSE
     WHERE id = ? AND role = 'student' AND is_active = TRUE AND must_change_password = TRUE`,
    [passwordHash, userId]
  );
  return result;
}

module.exports = { createUser, findUserByEmail, findUserById, changeInitialPassword };
