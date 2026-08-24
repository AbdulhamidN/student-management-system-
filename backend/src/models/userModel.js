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
    `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
        COALESCE(s.department_id, t.department_id) AS department_id
     FROM users u
     LEFT JOIN students s ON s.user_id = u.id AND s.is_deleted = FALSE
     LEFT JOIN teachers t ON t.user_id = u.id AND t.is_deleted = FALSE
     WHERE u.id = ? LIMIT 1`,
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

async function createSessionWithRefreshToken({ sessionId, userId, expiresAt, userAgent, ipAddress, tokenHash, tokenExpiresAt }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO user_sessions (session_id, user_id, expires_at, user_agent, ip_address)
       VALUES (?, ?, ?, ?, INET6_ATON(?))`,
      [sessionId, userId, expiresAt, userAgent || null, ipAddress || null]
    );
    const [result] = await connection.execute(
      'INSERT INTO refresh_tokens (session_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [sessionId, tokenHash, tokenExpiresAt]
    );
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findSessionById(sessionId, userId) {
  const [rows] = await pool.execute(
    `SELECT session_id, user_id, expires_at, revoked_at
     FROM user_sessions
     WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
  return rows[0] || null;
}

async function findRefreshToken(tokenHash) {
  const [rows] = await pool.execute(
        `SELECT rt.id, rt.session_id, rt.expires_at, rt.revoked_at,
          us.user_id, us.revoked_at AS session_revoked_at, us.expires_at AS session_expires_at,
          u.role
     FROM refresh_tokens rt
     JOIN user_sessions us ON us.session_id = rt.session_id
         JOIN users u ON u.id = us.user_id
     WHERE rt.token_hash = ? LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function rotateRefreshToken({ oldTokenId, sessionId, tokenHash, expiresAt }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [insertResult] = await connection.execute(
      'INSERT INTO refresh_tokens (session_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [sessionId, tokenHash, expiresAt]
    );
    await connection.execute(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP, revocation_reason = 'rotated', replaced_by_token_id = ?
       WHERE id = ? AND revoked_at IS NULL`,
      [insertResult.insertId, oldTokenId]
    );
    await connection.execute('UPDATE user_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE session_id = ?', [sessionId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function revokeSession(sessionId, userId, reason = 'logout') {
  const [result] = await pool.execute(
    `UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP, revocation_reason = ?
     WHERE session_id = ? AND user_id = ? AND revoked_at IS NULL`,
    [reason, sessionId, userId]
  );
  await pool.execute(
    `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, revocation_reason = ?
     WHERE session_id = ? AND revoked_at IS NULL`,
    [reason, sessionId]
  );
  return result;
}

async function revokeAllSessions(userId, reason = 'logout_all') {
  await pool.execute(
    `UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP, revocation_reason = ?
     WHERE user_id = ? AND revoked_at IS NULL`,
    [reason, userId]
  );
  await pool.execute(
    `UPDATE refresh_tokens rt JOIN user_sessions us ON us.session_id = rt.session_id
     SET rt.revoked_at = CURRENT_TIMESTAMP, rt.revocation_reason = ?
     WHERE us.user_id = ? AND rt.revoked_at IS NULL`,
    [reason, userId]
  );
}

async function listActiveSessions(userId) {
  const [rows] = await pool.execute(
    `SELECT session_id, created_at, last_used_at, expires_at, user_agent, INET6_NTOA(ip_address) AS ip_address
     FROM user_sessions
     WHERE user_id = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP
     ORDER BY last_used_at DESC, created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  resetFailedLoginAttempts,
  clearExpiredLock,
  recordFailedLoginAttempt,
  createSessionWithRefreshToken,
  findSessionById,
  findRefreshToken,
  rotateRefreshToken,
  revokeSession,
  revokeAllSessions,
  listActiveSessions,
};
