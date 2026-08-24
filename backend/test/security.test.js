const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');

test('security headers are present', async () => {
  const response = await request(app).get('/');

  assert.equal(response.headers['x-frame-options'], 'DENY');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.match(response.headers['content-security-policy'], /report-uri \/api\/security\/csp-report/);
  assert.equal(response.headers['permissions-policy'], 'camera=(), microphone=(), geolocation=(), payment=()');
});

test('CSP reports are accepted without exposing report data', async () => {
  const response = await request(app)
    .post('/api/security/csp-report')
    .set('Content-Type', 'application/csp-report')
    .send(JSON.stringify({ 'csp-report': { documentURI: 'https://example.test/', blockedURI: 'https://blocked.test/script.js' } }));

  assert.equal(response.status, 204);
  assert.equal(response.text, '');
});

test('unknown CORS origins are rejected', async () => {
  const response = await request(app)
    .get('/')
    .set('Origin', 'https://untrusted.example');

  assert.equal(response.status, 500);
  assert.equal(response.headers['access-control-allow-origin'], undefined);
});