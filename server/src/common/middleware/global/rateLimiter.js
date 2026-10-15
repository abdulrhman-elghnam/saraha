import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { cacheClient } from '#/core/database/_INDEX.js';
import geoip from 'geoip-lite';

const fromWhere = (ip) => {
  try {
    return geoip.lookup(ip);
  } catch (error) {
    console.error('GeoIP lookup error:', error);
    return null;
  }
};

const redisStore = {
  windowMs: 0,

  init(options) {
    this.windowMs = options.windowMs;
  },

  async increment(key) {
    const totalHits = await cacheClient.incr(key);

    if (totalHits === 1) {
      await cacheClient.expire(key, Math.ceil(this.windowMs / 1000));
    }

    const ttl = await cacheClient.ttl(key);

    return {
      totalHits,
      resetTime: new Date(Date.now() + Math.max(ttl, 0) * 1000),
    };
  },

  async decrement(key) {
    if (await cacheClient.exists(key)) {
      await cacheClient.decr(key);
    }
  },

  async resetKey(key) {
    await cacheClient.delete(key);
  },
};

export const generateLimiter = ({
  ttl = 15,
  message = 'Too Many Requests',
  status = 429,
  legacyHeaders = false,
  standardHeaders = 'draft-8',
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
  limit = 1000,
} = {}) => {
  return rateLimit({
    windowMs: ttl * 60 * 1000,
    limit,

    skip: (req) => {
      const data = fromWhere(req.ip);

      return data?.country !== 'EG';
    },

    legacyHeaders,
    standardHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,

    handler: (req, res) => {
      return res.status(status).json({
        success: false,
        status,
        message,
      });
    },

    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip);

      return `${ip}::${req.baseUrl}${req.path}`;
    },

    store: redisStore,
  });
};
