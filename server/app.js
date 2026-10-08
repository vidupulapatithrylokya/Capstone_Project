// server/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const { apiLimiter } = require("./middleware/rateLimiter");
const { sanitizeInputMiddleware } = require("./middleware/sanitizeInput");
const { cacheResponse } = require("./middleware/cacheMiddleware");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const aiRoutes = require("./routes/aiRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const searchRoutes = require("./routes/searchRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const toolRoutes = require("./routes/toolRoutes");
const videoRoutes = require("./routes/videoRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const sqlRoutes = require("./routes/sqlRoutes");
const ssrRoutes = require("./routes/ssrRoutes");

const app = express();

// Enable CORS
app.use(cors());

// Body Parsing & Input Sanitization
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(sanitizeInputMiddleware);

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global API Rate Limiter
app.use("/api", apiLimiter);

// Mount API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", cacheResponse(180), courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", cacheResponse(60), searchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sql", sqlRoutes);

// Server-Side Rendered (SSR) Routes
app.use("/ssr", ssrRoutes);

app.get("/", (req, res) => {
  res.send("ExplainAI Backend API Running");
});

// Centralized 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("[Unhandled Server Error]:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;