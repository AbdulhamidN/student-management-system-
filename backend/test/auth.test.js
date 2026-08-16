const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const express = require('express');

const userModel = require('../src/models/userModel');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const { validateRegistration, validateLogin } = require('../src/validators/authValidator');
const authRoutes = require('../src/routes/authRoutes');
const { authenticateToken, requireAdmin, requireTeacher, requireStudent } = require('../src/middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const protectedApp = express();
protectedApp.use(express.json());
protectedApp.get('/admin-only', authenticateToken, requireAdmin, (req, res) => res.status(200).json({ ok: true }));
protectedApp.get('/teacher-only', authenticateToken, requireTeacher, (req, res) => res.status(200).json({ ok: true }));
protectedApp.get('/student-only', authenticateToken, requireStudent, (req, res) => res.status(200).json({ ok: true }));

const originalRegisterUser = userModel.registerUser;
const originalFindUserByEmail = userModel.findUserByEmail;
const originalFindUserById = userModel.findUserById;

test('register validation rejects weak password', () => {
  const result = validateRegistration({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'weak',
    role: 'student'
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /password/i);
});

test('login validation rejects empty email or password', () => {
  const result = validateLogin({ email: '', password: '' });

  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /email|password/i);
});

test('JWT generation and verification succeed', () => {
  const token = generateToken({ id: 12, role: 'admin' });
  const decoded = verifyToken(token);

  assert.equal(decoded.id, 12);
  assert.equal(decoded.role, 'admin');
});

test('Expired JWT is rejected', () => {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const expiredToken = jwt.sign({ id: 2, role: 'student' }, secret, {
    expiresIn: '-1h'
  });

  assert.throws(() => verifyToken(expiredToken), /expired|jwt/i);
});

test('register route rejects duplicate email', async () => {
  userModel.findUserByEmail = async () => ({ id: 5, email: 'duplicate@example.com' });
  userModel.registerUser = async () => null;

  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Jane', email: 'duplicate@example.com', password: 'StrongPass1!', role: 'student' });

  assert.equal(response.status, 409);
  assert.match(response.body.message, /already exists|registered/i);

  userModel.findUserByEmail = originalFindUserByEmail;
  userModel.registerUser = originalRegisterUser;
});

test('admin can access admin-only route', async () => {
  const original = userModel.findUserById;
  userModel.findUserById = async () => ({ id: 1, email: 'admin@example.com', role: 'admin', name: 'Admin User' });

  const token = generateToken({ id: 1, role: 'admin' });
  const response = await request(protectedApp)
    .get('/admin-only')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  userModel.findUserById = original;
});

test('student cannot access admin-only route', async () => {
  const original = userModel.findUserById;
  userModel.findUserById = async () => ({ id: 2, email: 'student@example.com', role: 'student', name: 'Student User' });

  const token = generateToken({ id: 2, role: 'student' });
  const response = await request(protectedApp)
    .get('/admin-only')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 403);
  userModel.findUserById = original;
});

test('unauthenticated requests are rejected', async () => {
  const response = await request(protectedApp).get('/admin-only');
  assert.equal(response.status, 401);
});

// restore original functions after tests if needed
process.on('exit', () => {
  userModel.findUserByEmail = originalFindUserByEmail;
  userModel.registerUser = originalRegisterUser;
  userModel.findUserById = originalFindUserById;
});
