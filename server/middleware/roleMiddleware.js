// server/middleware/roleMiddleware.js

/**
 * Role-Based Access Control (RBAC) middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "Not authorized, user role unavailable." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeRoles: authorize,
};
