const { getRedisClient, redisEnabled } = require('../config/redis');

const ROLE_LIMITS = { admin: 1000, teacher: 500, student: 100 };
const memoryCounters = new Map();

function distributedRateLimit() {
  return async (req, res, next) => {
    const role = req.user?.role;
    const limit = ROLE_LIMITS[role];
    if (!limit) return res.status(403).json({ success: false, message: 'Access denied.' });

    const windowSeconds = 60;
    const key = `sms:rate:${role}:${req.user.id}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
    try {
      if (redisEnabled()) {
        const redis = getRedisClient();
        if (redis.status === 'wait') await redis.connect();
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSeconds);
        if (count > limit) return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
      } else {
        const entry = memoryCounters.get(key) || { count: 0, expiresAt: Date.now() + windowSeconds * 1000 };
        entry.count += 1;
        memoryCounters.set(key, entry);
        if (entry.count > limit) return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
      }
      return next();
    } catch (error) {
      if (process.env.NODE_ENV === 'production') return res.status(503).json({ success: false, message: 'Rate limiting service unavailable.' });
      return next();
    }
  };
}

module.exports = { distributedRateLimit, ROLE_LIMITS };
