// server/services/aiService.js
const { runAgentWorkflow } = require("./agentService");
const { retrieveRelevantContext } = require("./ragService");
const { sanitizeAndValidatePrompt, filterSensitiveOutput } = require("./promptSanitizer");
const { executeTool } = require("./tools");
const AIUsage = require("../models/AIUsage");

/**
 * Generate AI Response with Tool Calling, Prompt Injection Defense, and Usage Tracking
 */
const generateAIResponse = async (prompt, userContext = {}) => {
  const startTime = Date.now();

  // 1. Prompt Validation & Injection Security Defense
  const validation = sanitizeAndValidatePrompt(prompt);
  if (!validation.isValid) {
    if (userContext.userId) {
      await AIUsage.create({
        user: userContext.userId,
        status: "blocked",
        endpoint: "/api/ai/ask",
        latencyMs: Date.now() - startTime,
      }).catch(() => null);
    }
    throw new Error(validation.reason);
  }

  const cleanPrompt = validation.sanitizedPrompt;

  // 2. Check for tool invocation intent
  const lower = cleanPrompt.toLowerCase();
  let toolResult = null;
  let toolsUsed = [];

  if (lower.includes("calculate") || /^[\d\s+\-*/().]+$/.test(cleanPrompt)) {
    const exprMatch = cleanPrompt.match(/([0-9+\-*/().\s]{3,})/);
    toolResult = await executeTool("calculator", { expression: exprMatch ? exprMatch[0].trim() : cleanPrompt }, userContext);
    toolsUsed.push("calculator");
  } else if (lower.includes("search course") || lower.includes("find course")) {
    toolResult = await executeTool("courseSearch", { query: cleanPrompt }, userContext);
    toolsUsed.push("courseSearch");
  } else if (lower.includes("my progress") || lower.includes("completed lessons")) {
    toolResult = await executeTool("studentProgressLookup", {}, userContext);
    toolsUsed.push("studentProgressLookup");
  }

  // 3. RAG Retrieval
  const ragData = await retrieveRelevantContext(cleanPrompt);

  // 4. Synthesize Answer
  let answerText = `AI Explanation for: "${cleanPrompt}"\n\n`;

  if (toolResult && toolResult.success) {
    answerText += `### Tool Output (${toolResult.tool}):\n${JSON.stringify(toolResult.data, null, 2)}\n\n`;
  }

  if (ragData.contextText) {
    answerText += `### Grounded Context:\n${ragData.contextText}\n\n`;
  }

  answerText += `This topic is a cornerstone in interactive learning. ExplainAI combines personalized instruction, automated tools, and real-time guidance to accelerate user comprehension.`;
  answerText = filterSensitiveOutput(answerText);

  const latencyMs = Date.now() - startTime;

  // 5. Track Token & Cost Metrics
  if (userContext.userId) {
    const promptTokens = Math.ceil(cleanPrompt.length / 4);
    const completionTokens = Math.ceil(answerText.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = Number((promptTokens * 0.0000015 + completionTokens * 0.000002).toFixed(6));

    await AIUsage.create({
      user: userContext.userId,
      model: "explainai-v1",
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
      endpoint: "/api/ai/ask",
      latencyMs,
      status: "success",
      toolsUsed,
    }).catch(() => null);
  }

  return {
    success: true,
    prompt: cleanPrompt,
    response: answerText,
    toolsUsed,
    sources: ragData.sources,
    latencyMs,
  };
};

module.exports = {
  generateAIResponse,
  runAgentWorkflow,
};