import { getRedisClient } from '../config/redis.js';

// In-memory fallback store: jti -> expiryTimestamp(ms)
const memoryBlacklist = new Map();

const setMemoryBlacklist = (jti, ttlSec) => {
  const expiry = Date.now() + ttlSec * 1000;
  memoryBlacklist.set(jti, expiry);
  // schedule cleanup
  setTimeout(() => memoryBlacklist.delete(jti), ttlSec * 1000 + 1000);
};

/**
 * Blacklist a token by storing its JTI with TTL = token expiration time.
 * Prefer Redis when available; fall back to an in-memory map when it's not.
 */
export const blacklistToken = async (jti, exp) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = exp - nowSec;

  if (ttl <= 0) {
    console.warn(`Token ${jti} already expired — skipping blacklist`);
    return;
  }

  // If Redis is available, try storing the blacklist there. If it fails,
  // fall back to memory so the app logic can continue.
  const redisClient = getRedisClient();
  if (redisClient && redisClient.isReady) {
    try {
      await redisClient.set(`auth:blacklist:${jti}`, 'revoked', { EX: ttl });
      console.log(`Token ${jti} blacklisted in Redis for ${ttl}s`);
      return;
    } catch (err) {
      console.error('Failed to write blacklist to Redis, falling back to memory:', err?.message || err);
      setMemoryBlacklist(jti, ttl);
      return;
    }
  }

  // Redis not available — use in-memory blacklist
  console.warn('Redis not available; using in-memory token blacklist');
  setMemoryBlacklist(jti, ttl);
};

/**
 * Check if a token's JTI is blacklisted. Uses Redis when available, otherwise
 * uses the in-memory fallback map.
 */
export const isTokenBlacklisted = async (jti) => {
  const redisClient = getRedisClient();
  if (redisClient && redisClient.isReady) {
    try {
      const exists = await redisClient.exists(`auth:blacklist:${jti}`);
      return exists === 1;
    } catch (err) {
      console.error('Redis blacklist check failed, falling back to memory:', err?.message || err);
      // fall through to memory check
    }
  }

  const expiry = memoryBlacklist.get(jti);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    memoryBlacklist.delete(jti);
    return false;
  }
  return true;
};
