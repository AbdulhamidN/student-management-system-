const test = require('node:test');
const assert = require('node:assert/strict');

const { getQueues } = require('../src/services/jobQueue');

test('queues remain disabled until Redis is configured', () => {
  assert.equal(getQueues(), null);
});