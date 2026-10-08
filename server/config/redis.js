// server/config/redis.js
const Redis = require("ioredis");

let redisClient = null;
let isRedisConnected = false;

// In-memory fallback cache when Redis server is offline
const memoryCache = new Map();

try {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Do not hang if Redis is un-contactable
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("[Redis] Connected to Redis Cache Server successfully.");
  });

  redisClient.on("error", () => {
    isRedisConnected = false;
  });

  redisClient.connect().catch(() => {
    isRedisConnected = false;
    console.log("[Redis] Redis server offline. Gracefully falling back to in-memory caching.");
  });
} catch (err) {
  isRedisConnected = false;
}

const getCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    // Fallback
  }
  const item = memoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.value;
  }
  return null;
};

const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    }
  } catch (err) {
    // Fallback
  }
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

const deleteCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    }
  } catch (err) {
    // Fallback
  }
  memoryCache.delete(key);
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  isRedisConnected: () => isRedisConnected,
};
