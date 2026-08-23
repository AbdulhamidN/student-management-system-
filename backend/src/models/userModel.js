const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser({ name, email, password, role }, connection = pool) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await connection.execute(
    'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
    [name, email, passwordHash, role]
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
    'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function resetFailedLoginAttempts(userId) {
  await pool.execute(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
    [userId]
  );
}

async function clearExpiredLock(userId) {
  await pool.execute(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ? AND locked_until IS NOT NULL AND locked_until <= CURRENT_TIMESTAMP',
    [userId]
  );
}

async function recordFailedLoginAttempt(userId, lockoutThreshold, lockedUntil) {
  await pool.execute(
    `UPDATE users
     SET failed_login_attempts = failed_login_attempts + 1,
         locked_until = CASE
           WHEN failed_login_attempts + 1 >= ? THEN ?
           ELSE locked_until
         END
     WHERE id = ?`,
    [lockoutThreshold, lockedUntil, userId]
  );
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  resetFailedLoginAttempts,
  clearExpiredLock,
  recordFailedLoginAttempt,
};
