const { redisClient } = require('../utils/redis.js');
const { winstonLogger } = require('../utils/logger.js');

const cache = (expirationInSeconds) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        winstonLogger.info(`Cache hit for ${key}`);
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      winstonLogger.info(`Cache miss for ${key}`);
      
      // Override res.json to cache the response before sending it
      const originalJson = res.json;
      res.json = function (body) {
        // We restore original json function to avoid double-caching or infinite loops
        res.json = originalJson;
        
        // Cache the response asynchronously
        redisClient.setEx(key, expirationInSeconds, JSON.stringify(body)).catch(err => {
          winstonLogger.error(`Failed to set cache for ${key}`, { error: err.message });
        });
        
        return res.json(body);
      };

      next();
    } catch (err) {
      winstonLogger.error(`Cache middleware error for ${key}`, { error: err.message });
      next(); // fallback to normal execution if redis fails
    }
  };
};

module.exports = { cache };
