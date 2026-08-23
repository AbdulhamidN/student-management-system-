const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const request = require('supertest');
const express = require('express');

const userModel = require('../src/models/userModel');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const { validatePassword, validateRegistration, validateLogin } = require('../src/validators/authValidator');
const { loginUser } = require('../src/controllers/authController');
const authRoutes = require('../src/routes/authRoutes');
const errorHandler = require('../src/middleware/errorMiddleware');
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

test('password validation enforces all required rules', () => {
  assert.equal(validatePassword('Short1!').isValid, false);
  assert.equal(validatePassword('lowercaseonly1!').isValid, false);
  assert.equal(validatePassword('UPPERCASEONLY1!').isValid, false);
  assert.equal(validatePassword('NoNumberPassword!').isValid, false);
  assert.equal(validatePassword('NoSpecialPassword1').isValid, false);
  assert.equal(validatePassword('ValidPassword1!').isValid, true);
});

test('login validation rejects empty email or password', () => {
  const result = validateLogin({ email: '', password: '' });

  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /email|password/i);
});

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('five consecutive failed logins lock the account', async () => {
  const originalFind = userModel.findUserByEmail;
  const originalRecord = userModel.recordFailedLoginAttempt;
  const passwordHash = await bcrypt.hash('CorrectPassword1!', 4);
  const user = { id: 20, email: 'locked@example.com', password_hash: passwordHash, role: 'student', is_active: true, failed_login_attempts: 0 };
  userModel.findUserByEmail = async () => user;
  userModel.recordFailedLoginAttempt = async () => {
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= 5) user.locked_until = new Date(Date.now() + 900000);
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = mockResponse();
    await loginUser({ body: { email: user.email, password: 'WrongPassword1!' } }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 401);
  }

  const response = mockResponse();
  await loginUser({ body: { email: user.email, password: 'CorrectPassword1!' } }, response, (error) => { throw error; });
  assert.equal(response.statusCode, 401);
  assert.equal(user.failed_login_attempts, 5);
  userModel.findUserByEmail = originalFind;
  userModel.recordFailedLoginAttempt = originalRecord;
});

test('successful login resets failed attempts', async () => {
  const originalFind = userModel.findUserByEmail;
  const originalReset = userModel.resetFailedLoginAttempts;
  const passwordHash = await bcrypt.hash('CorrectPassword1!', 4);
  const user = { id: 21, email: 'reset@example.com', password_hash: passwordHash, role: 'student', is_active: true, failed_login_attempts: 4, password_changed_at: new Date() };
  userModel.findUserByEmail = async () => user;
  userModel.resetFailedLoginAttempts = async () => { user.failed_login_attempts = 0; };
  const response = mockResponse();
  await loginUser({ body: { email: user.email, password: 'CorrectPassword1!' } }, response, (error) => { throw error; });
  assert.equal(response.statusCode, 200);
  assert.equal(user.failed_login_attempts, 0);
  userModel.findUserByEmail = originalFind;
  userModel.resetFailedLoginAttempts = originalReset;
});

test('expired password is rejected after valid credentials', async () => {
  const originalFind = userModel.findUserByEmail;
  const originalReset = userModel.resetFailedLoginAttempts;
  const passwordHash = await bcrypt.hash('CorrectPassword1!', 4);
  userModel.findUserByEmail = async () => ({ id: 22, email: 'expired@example.com', password_hash: passwordHash, role: 'student', is_active: true, password_changed_at: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000) });
  userModel.resetFailedLoginAttempts = async () => {};
  const response = mockResponse();
  await loginUser({ body: { email: 'expired@example.com', password: 'CorrectPassword1!' } }, response, (error) => { throw error; });
  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /expired/i);
  userModel.findUserByEmail = originalFind;
  userModel.resetFailedLoginAttempts = originalReset;
});

test('global errors do not expose internal database messages', () => {
  const response = mockResponse();
  errorHandler(Object.assign(new Error('ER_ACCESS_DENIED: database password leaked'), { statusCode: 500 }), { method: 'GET', originalUrl: '/test' }, response, () => {});
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, 'Internal server error.');
  assert.doesNotMatch(response.body.message, /database|password/i);
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
  userModel.findUserById = async () => ({ id: 1, email: 'admin@example.com', role: 'admin', name: 'Admin User', is_active: true });

  const token = generateToken({ id: 1, role: 'admin' });
  const response = await request(protectedApp)
    .get('/admin-only')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  userModel.findUserById = original;
});

test('student cannot access admin-only route', async () => {
  const original = userModel.findUserById;
  userModel.findUserById = async () => ({ id: 2, email: 'student@example.com', role: 'student', name: 'Student User', is_active: true });

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
