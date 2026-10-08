// server/controllers/sqlController.js
const { getPaymentAnalytics, createPaymentWithTransaction } = require("../sql/sqlService");

const getSQLAnalytics = async (req, res) => {
  try {
    const analytics = await getPaymentAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createManualPaymentRecord = async (req, res) => {
  try {
    const { email, name, amount, description } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ success: false, message: "Email and amount are required." });
    }

    const record = await createPaymentWithTransaction({
      email,
      name: name || "Manual Customer",
      amount: Number(amount),
      description: description || "Manual payment record",
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSQLAnalytics,
  createManualPaymentRecord,
};
