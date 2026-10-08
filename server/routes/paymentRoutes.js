// server/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { createCheckoutSession, confirmPayment, stripeWebhook } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/confirm", protect, confirmPayment);
router.post("/webhook", stripeWebhook);

module.exports = router;
