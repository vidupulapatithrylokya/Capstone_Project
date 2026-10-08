// server/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

/**
 * Strict limiter for authentication endpoints (Login / Register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many login/registration attempts from this IP, please try again after 15 minutes.",
  },
  statusCode: 429,
});

/**
 * Rate limiter for AI interaction endpoints
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "AI query rate limit exceeded, please wait a few minutes before asking more questions.",
  },
  statusCode: 429,
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests to ExplainAI API, please slow down.",
  },
  statusCode: 429,
});

module.exports = {
  authLimiter,
  aiLimiter,
  apiLimiter,
};
