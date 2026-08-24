const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateAccessToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin } = require('../validators/authValidator');

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const PASSWORD_MAX_AGE_DAYS = 90;
const LOCKOUT_DURATION_MINUTES = Math.max(1, Number.parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10));
const REFRESH_TOKEN_EXPIRES_DAYS = Math.max(1, Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10));
const REFRESH_COOKIE_NAME = 'sms_refresh_token';

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  };
}

function getRefreshToken(req) {
  const header = req.headers.cookie || '';
  const cookie = header.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${REFRESH_COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.slice(REFRESH_COOKIE_NAME.length + 1)) : null;
}

async function issueSession(user, req, res) {
  const sessionId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(64).toString('base64url');
  const now = Date.now();
  const sessionExpiresAt = new Date(now + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await userModel.createSessionWithRefreshToken({
    sessionId,
    userId: user.id,
    expiresAt: sessionExpiresAt,
    userAgent: typeof req.get === 'function' ? req.get('user-agent') : req.headers?.['user-agent'],
    ipAddress: req.ip,
    tokenHash: hashRefreshToken(refreshToken),
    tokenExpiresAt: sessionExpiresAt,
  });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return generateAccessToken({ id: user.id, role: user.role, sid: sessionId });
}

const stripSensitiveUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
});

async function registerUser(req, res, next) {
  try {
    const validation = validateRegistration(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
      });
    }

    if (validation.sanitized.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Public registration for admin role is not allowed.',
      });
    }

    const existingUser = await userModel.findUserByEmail(validation.sanitized.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const result = await userModel.createUser(validation.sanitized);
    const user = await userModel.findUserById(result.insertId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: stripSensitiveUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const validation = validateLogin(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
      });
    }

    const user = await userModel.findUserByEmail(validation.sanitized.email);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.locked_until) await userModel.clearExpiredLock(user.id);

    const isPasswordValid = await bcrypt.compare(validation.sanitized.password, user.password_hash);
    if (!isPasswordValid) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      await userModel.recordFailedLoginAttempt(user.id, MAX_FAILED_LOGIN_ATTEMPTS, lockedUntil);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    await userModel.resetFailedLoginAttempts(user.id);

    const passwordChangedAt = new Date(user.password_changed_at || user.created_at);
    const passwordAge = Date.now() - passwordChangedAt.getTime();
    if (Number.isNaN(passwordChangedAt.getTime()) || passwordAge > PASSWORD_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) {
      return res.status(403).json({
        success: false,
        message: 'Password has expired. Please reset your password.',
      });
    }

    const token = await issueSession(user, req, res);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: stripSensitiveUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function refreshAccessToken(req, res) {
  const refreshToken = getRefreshToken(req);
  if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token is missing.' });

  const stored = await userModel.findRefreshToken(hashRefreshToken(refreshToken));
  const expired = !stored || new Date(stored.expires_at).getTime() <= Date.now() || new Date(stored.session_expires_at).getTime() <= Date.now();
  if (expired || stored.revoked_at || stored.session_revoked_at) {
    if (stored?.session_id && stored?.user_id) await userModel.revokeSession(stored.session_id, stored.user_id, 'refresh_token_reuse');
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
    return res.status(401).json({ success: false, message: 'Refresh session is no longer valid.' });
  }

  const nextRefreshToken = crypto.randomBytes(64).toString('base64url');
  const nextExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await userModel.rotateRefreshToken({ oldTokenId: stored.id, sessionId: stored.session_id, tokenHash: hashRefreshToken(nextRefreshToken), expiresAt: nextExpiresAt });
  res.cookie(REFRESH_COOKIE_NAME, nextRefreshToken, refreshCookieOptions());
  return res.json({ success: true, token: generateAccessToken({ id: stored.user_id, role: stored.role, sid: stored.session_id }) });
}

async function logout(req, res, next) {
  try {
    if (req.user?.sessionId) await userModel.revokeSession(req.user.sessionId, req.user.id);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
    return res.status(204).send();
  } catch (error) { return next(error); }
}

async function logoutAll(req, res, next) {
  try {
    await userModel.revokeAllSessions(req.user.id);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
    return res.status(204).send();
  } catch (error) { return next(error); }
}

async function getSessions(req, res, next) {
  try { return res.json({ success: true, data: await userModel.listActiveSessions(req.user.id) }); }
  catch (error) { return next(error); }
}

async function revokeSpecificSession(req, res, next) {
  try {
    const result = await userModel.revokeSession(req.params.sessionId, req.user.id, 'user_revoked');
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  logout,
  logoutAll,
  getSessions,
  revokeSpecificSession,
};
