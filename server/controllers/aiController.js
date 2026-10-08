// server/controllers/aiController.js
const { generateAIResponse, runAgentWorkflow } = require("../services/aiService");
const { ingestDocument } = require("../services/ragService");
const AIUsage = require("../models/AIUsage");

/**
 * Single turn AI request with tool calling and prompt defense
 */
const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }

    const userContext = {
      userId: req.user ? req.user._id : "anonymous",
      userRole: req.user ? req.user.role : "student",
    };

    const result = await generateAIResponse(prompt, userContext);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Controlled multi-step AI agent workflow
 */
const runAgent = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }

    const userContext = {
      userId: req.user ? req.user._id : "anonymous",
      userRole: req.user ? req.user.role : "student",
    };

    const result = await runAgentWorkflow({ prompt, userContext });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Server-Sent Events (SSE) Streaming AI Response
 */
const streamAIResponse = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const userContext = {
      userId: req.user ? req.user._id : "anonymous",
      userRole: req.user ? req.user.role : "student",
    };

    const fullResult = await generateAIResponse(prompt, userContext);
    const words = fullResult.response.split(" ");

    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i === words.length - 1 ? "" : " ");
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    res.write(`data: ${JSON.stringify({ chunk: "", done: true, sources: fullResult.sources })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
};

/**
 * Ingest document for RAG vector retrieval
 */
const ingestRAGDocument = async (req, res) => {
  try {
    const { documentId, title, content, metadata } = req.body;
    if (!documentId || !content) {
      return res.status(400).json({ success: false, message: "documentId and content are required." });
    }

    const result = await ingestDocument({ documentId, title, content, metadata });
    return res.status(201).json({ success: true, message: "Document ingested into vector store.", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get AI Usage analytics (Admin only)
 */
const getAIUsageAnalytics = async (req, res) => {
  try {
    const stats = await AIUsage.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: "$totalTokens" },
          totalCost: { $sum: "$estimatedCost" },
          avgLatency: { $avg: "$latencyMs" },
        },
      },
    ]);

    const usageByUser = await AIUsage.aggregate([
      {
        $group: {
          _id: "$user",
          requestsCount: { $sum: 1 },
          tokensUsed: { $sum: "$totalTokens" },
          cost: { $sum: "$estimatedCost" },
        },
      },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      summary: stats[0] || { totalRequests: 0, totalTokens: 0, totalCost: 0, avgLatency: 0 },
      usageByUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  askAI,
  runAgent,
  streamAIResponse,
  ingestRAGDocument,
  getAIUsageAnalytics,
};