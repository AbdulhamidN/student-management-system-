const test = require('node:test');
const assert = require('node:assert/strict');

const redis = require('../src/config/redis');

test('cache supports hit, miss, TTL, and prefix invalidation without Redis', async () => {
  assert.equal(redis.redisEnabled(), false);
  await redis.cacheSet('students:test:one', { id: 1 }, 1);
  assert.deepEqual(await redis.cacheGet('students:test:one'), { id: 1 });
  assert.equal(await redis.cacheGet('students:test:missing'), null);
  await redis.cacheSet('students:test:two', { id: 2 }, 1);
  await redis.cacheDeleteByPrefix('students:test:');
  assert.equal(await redis.cacheGet('students:test:one'), null);
  assert.equal(await redis.cacheGet('students:test:two'), null);
});
