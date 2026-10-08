// server/models/AIUsage.js
const mongoose = require("mongoose");

const aiUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    model: {
      type: String,
      default: "gemini-flash",
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    endpoint: {
      type: String,
      default: "/api/ai/ask",
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["success", "failed", "blocked"],
      default: "success",
    },
    toolsUsed: [String],
  },
  { timestamps: true }
);

aiUsageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AIUsage", aiUsageSchema);
