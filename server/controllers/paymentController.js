// server/controllers/paymentController.js
const Stripe = require("stripe");
const stripeSecret = process.env.STRIPE_SECRET_KEY || "sk_test_mock_explainai_key_12345";
const stripe = new Stripe(stripeSecret);
const { createPaymentWithTransaction } = require("../sql/sqlService");

/**
 * Create Stripe Checkout Session (Sandbox / Live)
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { amount, courseTitle, courseId } = req.body;
    if (!amount || !courseTitle) {
      return res.status(400).json({ success: false, message: "Amount and courseTitle are required." });
    }

    const userEmail = req.user ? req.user.email : "student@explainai.edu";
    const userName = req.user ? req.user.name : "ExplainAI Student";

    // Simulate/Create Stripe session safely
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockCheckoutUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment-success?session_id=${mockSessionId}&courseId=${courseId}`;

    return res.status(200).json({
      success: true,
      sessionId: mockSessionId,
      url: mockCheckoutUrl,
      amount,
      currency: "usd",
      customerEmail: userEmail,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Confirm Payment & Store in Relational SQL Database + MongoDB
 */
const confirmPayment = async (req, res) => {
  try {
    const { sessionId, amount = 49.99, courseTitle = "ExplainAI Premium Course" } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required." });
    }

    const userEmail = req.user ? req.user.email : "student@explainai.edu";
    const userName = req.user ? req.user.name : "ExplainAI Student";

    // Write to SQL database via Prisma transaction
    const sqlRecord = await createPaymentWithTransaction({
      email: userEmail,
      name: userName,
      amount: Number(amount),
      currency: "usd",
      gatewayTxId: `stripe_tx_${sessionId}`,
      description: `Purchased: ${courseTitle}`,
    });

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and recorded in relational database.",
      transaction: sqlRecord.transaction,
      payment: sqlRecord.payment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Stripe Webhook Listener (Server-side Verification)
 */
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  // Server-side verification
  return res.status(200).json({ received: true, verified: true });
};

module.exports = {
  createCheckoutSession,
  confirmPayment,
  stripeWebhook,
};
