const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      });
    }

    const decoded = verifyToken(token);
    const user = await userModel.findUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User session is no longer valid.',
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired.',
      });
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'MissingTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient privileges.',
      });
    }

    return next();
  };
}

const requireAdmin = requireRole('admin');
const requireTeacher = requireRole('teacher');
const requireStudent = requireRole('student');

module.exports = {
  authenticateToken,
  requireAdmin,
  requireTeacher,
  requireStudent,
};
