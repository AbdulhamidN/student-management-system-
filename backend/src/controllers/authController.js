const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin } = require('../validators/authValidator');

const stripSensitiveUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
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
    if (!user) {
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
