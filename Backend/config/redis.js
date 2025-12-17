const redis = require("redis");

let redisClient = null;

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log("❌ Redis max retries reached");
            return new Error("Redis max retries reached");
          }
          return Math.min(retries * 200, 3000); // exponential backoff
        },
      },
    });

    redisClient.on("connect", () => {
      console.log("🔄 Redis Client Connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis Client Connected and Ready");
    });

    redisClient.on("reconnecting", () => {
      console.log("♻️ Redis Client Reconnecting...");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err.message);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("❌ Redis Connection Error:", error.message);
    console.log("⚠️ Application will continue without Redis caching");
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
 * Cache Middleware
 * - Public routes → cache:public:<url>
 * - User routes → cache:user:<userId>:<url>
 */
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!isRedisConnected()) {
      return next();
    }

    try {
      const cacheKey = req.user?._id
        ? `cache:user:${req.user._id}:${req.originalUrl}`
        : `cache:public:${req.originalUrl}`;

      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        redisClient
          .setEx(cacheKey, duration, JSON.stringify(data))
          .catch((err) =>
            console.error("❌ Redis cache set error:", err.message)
          );
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("❌ Cache middleware error:", error.message);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * Example:
 * invalidateCache('cache:public:/api/result*')
 */
const invalidateCache = async (pattern) => {
  if (!isRedisConnected()) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Invalidated ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error("❌ Cache invalidation error:", error.message);
  }
};

/**
 * Clear all cache (use carefully)
 */
const clearAllCache = async () => {
  if (!isRedisConnected()) return;

  try {
    await redisClient.flushAll();
    console.log("🧹 All Redis cache cleared");
  } catch (error) {
    console.error("❌ Clear cache error:", error.message);
  }
};

/**
 * Get Redis stats
 */
const getCacheStats = async () => {
  if (!isRedisConnected()) return null;

  try {
    const stats = await redisClient.info("stats");
    const keyspace = await redisClient.info("keyspace");
    return { stats, keyspace };
  } catch (error) {
    console.error("❌ Get cache stats error:", error.message);
    return null;
  }
};

/**
 * Disconnect Redis
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("🔌 Redis Client Disconnected");
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  cacheMiddleware,
  invalidateCache,
  clearAllCache,
  getCacheStats,
  disconnectRedis,
};
