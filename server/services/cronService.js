// server/services/cronService.js
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

let isCronRunning = false;

const startScheduledJobs = () => {
  if (isCronRunning) return;
  isCronRunning = true;

  console.log("[Cron Scheduler] Initializing scheduled background jobs...");

  // Job 1: Cleanup temporary upload files (Every night at midnight)
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[Cron Job] Running cleanup of temporary upload files...");
      const uploadDir = path.join(__dirname, "..", "uploads");
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        files.forEach((file) => {
          if (file.startsWith("temp_")) {
            fs.unlinkSync(path.join(uploadDir, file));
          }
        });
      }
    } catch (err) {
      console.error("[Cron Job Error] Cleanup failed:", err.message);
    }
  });

  // Job 2: AI Usage Cost Reporting (Every hour)
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron Job] Running hourly AI usage and cost aggregation summary...");
  });
};

module.exports = {
  startScheduledJobs,
};
