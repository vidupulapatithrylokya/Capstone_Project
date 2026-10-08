// server/middleware/cacheMiddleware.js
const { getCache, setCache } = require("../config/redis");

/**
 * Middleware for caching HTTP responses (e.g. Course Catalog, Search) with TTL
 */
const cacheResponse = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `express_cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          ...cachedData,
          _cached: true,
        });
      }

      // Intercept res.json to populate cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, body, ttlSeconds).catch(() => null);
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

module.exports = {
  cacheResponse,
};
