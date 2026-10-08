// server/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const {
  askAI,
  runAgent,
  streamAIResponse,
  ingestRAGDocument,
  getAIUsageAnalytics,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { aiLimiter } = require("../middleware/rateLimiter");

router.post("/ask", protect, aiLimiter, askAI);
router.post("/agent", protect, aiLimiter, runAgent);
router.post("/stream", protect, aiLimiter, streamAIResponse);
router.post("/ingest", protect, authorize("admin", "mentor"), ingestRAGDocument);
router.get("/usage", protect, authorize("admin"), getAIUsageAnalytics);

module.exports = router;