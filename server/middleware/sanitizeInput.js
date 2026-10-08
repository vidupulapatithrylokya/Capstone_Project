// server/middleware/sanitizeInput.js

/**
 * Sanitize request body, query, and params against NoSQL operator injection & script injection
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key in obj) {
    if (key.startsWith("$")) {
      delete obj[key]; // Strip MongoDB operator keys like $gt, $where, $ne
      continue;
    }

    if (typeof obj[key] === "string") {
      // Clean script tags
      obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

const sanitizeInputMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = {
  sanitizeInputMiddleware,
};
