const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const authRouter = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

authRouter.post('/register', authLimiter, registerUser);
authRouter.post('/login', loginLimiter, loginUser);
authRouter.get('/me', authenticateToken, getCurrentUser);

module.exports = authRouter;
