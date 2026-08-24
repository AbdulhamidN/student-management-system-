const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function verifyToken(token) {
  if (!token) {
    const error = new Error('Authentication token is missing');
    error.name = 'MissingTokenError';
    throw error;
  }

  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  generateToken: generateAccessToken,
  verifyToken,
};
