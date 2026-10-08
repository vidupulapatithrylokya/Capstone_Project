// server/routes/sqlRoutes.js
const express = require("express");
const router = express.Router();
const { getSQLAnalytics, createManualPaymentRecord } = require("../controllers/sqlController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/analytics", protect, authorize("admin"), getSQLAnalytics);
router.post("/record", protect, authorize("admin"), createManualPaymentRecord);

module.exports = router;
