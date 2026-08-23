const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin } = require('../validators/authValidator');

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const PASSWORD_MAX_AGE_DAYS = 90;
const LOCKOUT_DURATION_MINUTES = Math.max(1, Number.parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10));

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

    const token = generateToken({ id: user.id, role: user.role });

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
};
