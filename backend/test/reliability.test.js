const test = require('node:test');
const assert = require('node:assert/strict');
const { retryTransient, createCircuitBreaker } = require('../src/utils/reliability');

test('retryTransient retries transient failures with backoff', async () => {
  let attempts = 0;
  const result = await retryTransient(async () => {
    attempts += 1;
    if (attempts < 3) throw Object.assign(new Error('temporary'), { transient: true });
    return 'ok';
  }, { baseDelayMs: 1 });
  assert.equal(result, 'ok');
  assert.equal(attempts, 3);
});

test('retryTransient does not retry permanent failures', async () => {
  let attempts = 0;
  await assert.rejects(() => retryTransient(async () => {
    attempts += 1;
    throw new Error('permanent');
  }, { baseDelayMs: 1 }), /permanent/);
  assert.equal(attempts, 1);
});

test('circuit breaker opens after repeated failures', async () => {
  const breaker = createCircuitBreaker(async () => { throw new Error('down'); }, { errorThresholdPercentage: 1, volumeThreshold: 1, resetTimeout: 1000 });
  await assert.rejects(() => breaker.fire(), /down/);
  await assert.rejects(() => breaker.fire(), /Breaker is open/);
  await breaker.shutdown();
});
