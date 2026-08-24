const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, getCurrentUser, refreshAccessToken, logout, logoutAll, getSessions, revokeSpecificSession } = require('../controllers/authController');
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
authRouter.post('/refresh', refreshAccessToken);
authRouter.get('/me', authenticateToken, getCurrentUser);
authRouter.post('/logout', authenticateToken, logout);
authRouter.post('/logout-all', authenticateToken, logoutAll);
authRouter.get('/sessions', authenticateToken, getSessions);
authRouter.delete('/sessions/:sessionId', authenticateToken, revokeSpecificSession);

module.exports = authRouter;
