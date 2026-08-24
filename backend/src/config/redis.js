const Redis = require('ioredis');

let client;
const memoryCache = new Map();

function redisEnabled() {
  return Boolean(process.env.REDIS_URL);
}

function getRedisClient() {
  if (!redisEnabled()) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    client.on('error', (error) => console.error('Redis connection error', { name: error.name }));
  }
  return client;
}

async function withRedis(operation) {
  const redis = getRedisClient();
  if (!redis) return null;
  if (redis.status === 'wait') await redis.connect();
  return operation(redis);
}

async function cacheGet(key) {
  try {
    const value = await withRedis((redis) => redis.get(key));
    if (value !== null) return JSON.parse(value);
    if (redisEnabled()) return null;

    const entry = memoryCache.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  } catch (error) {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 60) {
  try {
    if (redisEnabled()) {
      await withRedis((redis) => redis.set(key, JSON.stringify(value), 'EX', ttlSeconds));
      return;
    }
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  } catch (error) {
    return;
  }
}

async function cacheDeleteByPrefix(prefix) {
  try {
    if (redisEnabled()) {
      await withRedis(async (redis) => {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length) await redis.del(...keys);
      });
      return;
    }
    for (const key of memoryCache.keys()) if (key.startsWith(prefix)) memoryCache.delete(key);
  } catch (error) {
    return;
  }
}

async function pingRedis() {
  if (!redisEnabled()) return false;
  try {
    return (await withRedis((redis) => redis.ping())) === 'PONG';
  } catch (error) {
    return false;
  }
}

async function closeRedis() {
  if (client && client.status !== 'end') await client.quit();
}

async function redisHealth() {
  if (!redisEnabled()) return { configured: false, healthy: false };
  return { configured: true, healthy: await pingRedis() };
}

module.exports = { redisEnabled, getRedisClient, cacheGet, cacheSet, cacheDeleteByPrefix, pingRedis, redisHealth, closeRedis };
