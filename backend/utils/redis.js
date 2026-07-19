const { createClient } = require('redis');
const { winstonLogger } = require('./logger.js');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => winstonLogger.error('Redis Client Error', { error: err.message }));
redisClient.on('connect', () => winstonLogger.info('Redis Client Connected'));

// Initialize connection
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    winstonLogger.error('Failed to connect to Redis initially', { error: err.message });
  }
})();

module.exports = { redisClient };
