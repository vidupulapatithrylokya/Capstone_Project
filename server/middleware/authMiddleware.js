// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "ExplainAI@123");

      let dbUser = null;
      try {
        dbUser = await User.findById(decoded.id).select("-password");
      } catch (err) {}

      // Populate user from DB or fallback to decoded payload claims
      req.user = dbUser || {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || "student",
        email: decoded.email || "student@explainai.edu",
        name: decoded.name || "ExplainAI User",
      };

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized, no bearer token provided.",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token.",
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Insufficient permissions.",
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};