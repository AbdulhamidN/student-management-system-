const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
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
    'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );

  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
