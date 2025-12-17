const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    // Create Redis client
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log('Redis max retries reached');
            return new Error('Redis max retries reached');
          }
          return retries * 100; // Exponential backoff
        }
      }
    });

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Connected and Ready');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis Client Reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('Redis Connection Error:', error.message);
    console.log('Application will continue without Redis caching');
    return null;
  }
};

// Get Redis client
const getRedisClient = () => redisClient;

// Check if Redis is connected
const isRedisConnected = () => {
  return redisClient && redisClient.isOpen;
};

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!isRedisConnected()) {
      return next();
    }

    try {
      const key = `cache:${req.originalUrl || req.url}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {

        return res.json(JSON.parse(cachedData));
      }

     
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json
      res.json = (data) => {
        // Cache the response
        redisClient.setEx(key, duration, JSON.stringify(data))
          .catch(err => console.error('Redis cache set error:', err));
        
        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Invalidate cache by pattern
const invalidateCache = async (pattern) => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️  Invalidated ${keys.length} cache entries matching: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

// Clear all cache
const clearAllCache = async () => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    await redisClient.flushAll();
    console.log('All cache cleared');
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// Get cache stats
const getCacheStats = async () => {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const info = await redisClient.info('stats');
    const keyspace = await redisClient.info('keyspace');
    return { stats: info, keyspace };
  } catch (error) {
    console.error('Get cache stats error:', error);
    return null;
  }
};

// Close Redis connection
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis Client Disconnected');
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
  disconnectRedis
};
