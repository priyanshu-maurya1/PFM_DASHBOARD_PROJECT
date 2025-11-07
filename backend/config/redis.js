import { createClient } from 'redis';

let redisClient = null;

const connectRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      const client = createClient({ url: process.env.REDIS_URL });
      client.on('error', (err) => {
        console.error('Redis Client Error', err);
      });

      await client.connect();
      console.log('Redis Connected');

      redisClient = client;
    } catch (error) {
      // keep redisClient null so callers know it's unavailable
      console.error('Redis connection failed, using in-memory fallback', error?.message || error);
      redisClient = null;
    }
  } else {
    console.warn('No REDIS_URL provided; skipping Redis connection');
  }
};

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.disconnect();
      console.log('Redis Disconnected');
    } catch (err) {
      console.warn('Error during Redis disconnection', err?.message || err);
    }
    redisClient = null;
  }
};

// Export a getter so other modules can always obtain the current client
const getRedisClient = () => redisClient;

export { getRedisClient, connectRedis, disconnectRedis };
