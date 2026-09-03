const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin } = require('../validators/authValidator');

const stripSensitiveUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
  mustChangePassword: Boolean(user.must_change_password),
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

    const isPasswordValid = await bcrypt.compare(validation.sanitized.password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
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

async function changeInitialStudentPassword(req, res, next) {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can use the initial password change.' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Current password, new password and confirmation are required.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters and contain uppercase, lowercase and a number.' });
    }

    const user = await userModel.findUserByEmail(req.user.email);
    if (!user || !user.must_change_password) {
      return res.status(409).json({ success: false, message: 'The initial password has already been changed.' });
    }

    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validCurrentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the temporary password.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await userModel.changeInitialPassword(user.id, passwordHash);
    if (!result.affectedRows) {
      return res.status(409).json({ success: false, message: 'The initial password has already been changed.' });
    }

    const updatedUser = await userModel.findUserById(user.id);
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. This initial password change cannot be repeated.',
      user: stripSensitiveUser(updatedUser),
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
  changeInitialStudentPassword,
};
