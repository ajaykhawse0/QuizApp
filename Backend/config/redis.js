const redis = require("redis");

let redisClient = null;

/**
 * Connect Redis
 */
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Redis max retries reached");
          }
          return Math.min(retries * 200, 3000);
        },
      },
    });

    redisClient.on("connect", () => {
      console.log("Redis connecting...");
    });

    redisClient.on("ready", () => {
      console.log("Redis connected and ready");
    });

    redisClient.on("reconnecting", () => {
      console.log("Redis reconnecting...");
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err.message);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    redisClient = null;
    return null;
  }
};

/**
 * Helpers
 */
const getRedisClient = () => redisClient;

const isRedisConnected = () => {
  return redisClient && redisClient.isOpen;
};

/**
 * PUBLIC CACHE MIDDLEWARE
 * Use for global, shared, non-user-specific routes
 *
 * Example keys:
 * cache:public:/api/contests
 * cache:public:/api/quiz/123
 */
const publicCache = (duration = 300) => {
  return async (req, res, next) => {
    if (!isRedisConnected()) return next();

    try {
      const key = `cache:public:${req.originalUrl}`;
      const cached = await redisClient.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        redisClient
          .setEx(key, duration, JSON.stringify(data))
          .catch(() => {});
        return originalJson(data);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

/**
 * PRIVATE CACHE MIDDLEWARE
 * Use only for authenticated, user-specific routes
 *
 * Example keys:
 * cache:user:USER_ID:/api/result/user/statistics
 */
const privateCache = (duration = 300) => {
  return async (req, res, next) => {
    if (!isRedisConnected()) return next();
    if (!req.user || !req.user._id) return next();

    try {
      const key = `cache:user:${req.user._id}:${req.originalUrl}`;
      const cached = await redisClient.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        redisClient
          .setEx(key, duration, JSON.stringify(data))
          .catch(() => {});
        return originalJson(data);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
const invalidateCache = async (pattern) => {
  if (!isRedisConnected()) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) {
      await redisClient.del(keys);
    }
  } catch (err) {}
};

/**
 * Clear entire cache
 */
const clearAllCache = async () => {
  if (!isRedisConnected()) return;

  try {
    await redisClient.flushAll();
  } catch (err) {}
};

/**
 * Disconnect Redis
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  publicCache,
  privateCache,
  invalidateCache,
  clearAllCache,
  disconnectRedis,
};
