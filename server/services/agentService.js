// server/services/agentService.js
const { planNextStep } = require("./planner");
const { executeTool } = require("./tools");
const { retrieveRelevantContext } = require("./ragService");
const { sanitizeAndValidatePrompt, filterSensitiveOutput } = require("./promptSanitizer");
const AIUsage = require("../models/AIUsage");

const MAX_STEPS = 5;
const TIMEOUT_MS = 15000;

/**
 * Controlled Multi-Step Agent Execution Workflow
 */
const runAgentWorkflow = async ({ prompt, userContext = {} }) => {
  const startTime = Date.now();
  const logs = [];

  // Step 0: Prompt Security & Sanitization
  const validation = sanitizeAndValidatePrompt(prompt);
  if (!validation.isValid) {
    if (userContext.userId) {
      await AIUsage.create({
        user: userContext.userId,
        status: "blocked",
        endpoint: "/api/ai/agent",
        latencyMs: Date.now() - startTime,
      }).catch(() => null);
    }
    throw new Error(validation.reason);
  }

  const cleanPrompt = validation.sanitizedPrompt;
  logs.push({ step: 0, action: "SANITY_CHECK", detail: "Prompt validated successfully." });

  // RAG Context Retrieval
  const ragResult = await retrieveRelevantContext(cleanPrompt);
  let accumulatedContext = ragResult.contextText;
  const sources = ragResult.sources;

  if (sources.length > 0) {
    logs.push({ step: 0, action: "RAG_RETRIEVAL", detail: `Retrieved ${sources.length} relevant context chunks.` });
  }

  let stepNumber = 1;
  const toolExecutionResults = [];
  const toolsUsed = [];

  while (stepNumber <= MAX_STEPS) {
    if (Date.now() - startTime > TIMEOUT_MS) {
      logs.push({ step: stepNumber, action: "TIMEOUT", detail: "Execution time limit reached." });
      break;
    }

    const plan = await planNextStep({
      prompt: cleanPrompt,
      context: accumulatedContext,
      history: logs,
      stepNumber,
    });

    logs.push({ step: stepNumber, action: plan.action, reasoning: plan.reasoning });

    if (plan.action === "TOOL_CALL") {
      const toolRes = await executeTool(plan.toolName, plan.args, userContext);
      toolsUsed.push(plan.toolName);
      toolExecutionResults.push(toolRes);

      if (toolRes.success) {
        accumulatedContext += `\n[Tool Output - ${plan.toolName}]: ${JSON.stringify(toolRes.data)}`;
        logs.push({ step: stepNumber, action: "TOOL_SUCCESS", tool: plan.toolName, result: toolRes.data });
      } else {
        logs.push({ step: stepNumber, action: "TOOL_FAILED", tool: plan.toolName, error: toolRes.error });
      }

      stepNumber++;
    } else {
      // Action is FINAL_RESPONSE
      break;
    }
  }

  // Synthesize final response
  let responseText = `Here is the comprehensive explanation for your query: "${cleanPrompt}"\n\n`;

  if (toolExecutionResults.length > 0) {
    responseText += `### Insights & Execution Results:\n`;
    toolExecutionResults.forEach((t) => {
      if (t.success) {
        responseText += `- **${t.tool}**: ${JSON.stringify(t.data, null, 2)}\n`;
      }
    });
    responseText += `\n`;
  }

  if (accumulatedContext && accumulatedContext.trim().length > 0) {
    responseText += `### Relevant Knowledge Context:\n${accumulatedContext.slice(0, 500)}...\n\n`;
  }

  responseText += `ExplainAI agent finished analysis in ${stepNumber} step(s).`;
  responseText = filterSensitiveOutput(responseText);

  const latencyMs = Date.now() - startTime;

  // Track AI Usage
  if (userContext.userId) {
    const promptTokens = Math.ceil(cleanPrompt.length / 4);
    const completionTokens = Math.ceil(responseText.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = (promptTokens * 0.0000015 + completionTokens * 0.000002).toFixed(6);

    await AIUsage.create({
      user: userContext.userId,
      model: "explainai-agent-v1",
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost: Number(estimatedCost),
      endpoint: "/api/ai/agent",
      latencyMs,
      status: "success",
      toolsUsed,
    }).catch(() => null);
  }

  return {
    success: true,
    prompt: cleanPrompt,
    response: responseText,
    stepsCount: stepNumber,
    executionLogs: logs,
    toolsUsed,
    sources,
    latencyMs,
  };
};

module.exports = {
  runAgentWorkflow,
  MAX_STEPS,
  TIMEOUT_MS,
};
