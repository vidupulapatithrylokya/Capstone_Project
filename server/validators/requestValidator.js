// server/validators/requestValidator.js
const { validationResult } = require("express-validator");

/**
 * Express Validator error handler middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed for request parameters.",
      errors: errors.array().map((err) => ({ field: err.path || err.param, message: err.msg })),
    });
  }
  next();
};

module.exports = {
  validateRequest,
};
