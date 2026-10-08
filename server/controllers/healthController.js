// server/controllers/healthController.js
const mongoose = require("mongoose");

/**
 * System Health Check Endpoint
 */
const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  const statusInfo = {
    status: dbState === 1 ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStateMap[dbState] || "Unknown",
      name: mongoose.connection.name || "explainai",
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsageMB: {
        rss: (process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
        heapTotal: (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2),
        heapUsed: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2),
      },
    },
  };

  return res.status(200).json(statusInfo);
};

module.exports = {
  getHealthStatus,
};
