import { createClient } from 'redis';

let redisClient = null;
let redisConnectionAttempted = false;

const connectRedis = async () => {
  // Prevent multiple connection attempts
  if (redisConnectionAttempted) {
    return;
  }
  redisConnectionAttempted = true;

  if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
    try {
      const client = createClient({ url: process.env.REDIS_URL });
      
      client.on('error', (err) => {
        // Only log once to avoid spam
        if (!client._errorLogged) {
          console.warn('Redis unavailable, using in-memory fallback');
          client._errorLogged = true;
        }
      });

      await client.connect();
      console.log('Redis Connected');
      redisClient = client;
    } catch (error) {
      // Silently fail - Redis is optional
      redisClient = null;
    }
  } else {
    // Skip Redis if using localhost (not available)
    redisClient = null;
  }
};

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.disconnect();
    } catch (err) {
      // Silent fail on disconnect
    }
    redisClient = null;
  }
};

// Export a getter so other modules can always obtain the current client
const getRedisClient = () => redisClient;

export { getRedisClient, connectRedis, disconnectRedis };
