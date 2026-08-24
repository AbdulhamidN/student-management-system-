const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');

test('health and liveness endpoints are available without authentication', async () => {
  const health = await request(app).get('/health');
  const live = await request(app).get('/live');
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { status: 'ok' });
  assert.equal(live.status, 200);
  assert.deepEqual(live.body, { status: 'alive' });
});

test('gateway adds a request identifier', async () => {
  const response = await request(app).get('/health').set('X-Request-Id', 'test-request');
  assert.equal(response.headers['x-request-id'], 'test-request');
  assert.equal(response.headers['x-gateway'], 'student-management-api');
});