// server/server.js
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startScheduledJobs } = require("./services/cronService");

// Connect to MongoDB
connectDB();

// Start Cron background jobs
startScheduledJobs();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ExplainAI Server running on port ${PORT}`);
});

// Graceful Shutdown Handlers
const handleShutdown = (signal) => {
  console.log(`[Server] ${signal} signal received. Initiating graceful shutdown...`);
  server.close(() => {
    console.log("[Server] HTTP server closed gracefully.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));