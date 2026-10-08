// server/services/planner.js
const { getToolSchemas } = require("./tools");

/**
 * Multi-step agent planner: Decides next action (tool execution, RAG lookup, or final response)
 */
const planNextStep = async ({ prompt, context, history = [], stepNumber = 1 }) => {
  const lowerPrompt = prompt.toLowerCase();

  // Step 1: Check if prompt requires a tool call
  if (lowerPrompt.includes("calculate") || lowerPrompt.includes("math") || /^[\d\s+\-*/().]+$/.test(prompt)) {
    const exprMatch = prompt.match(/([0-9+\-*/().\s]{3,})/);
    return {
      action: "TOOL_CALL",
      toolName: "calculator",
      args: { expression: exprMatch ? exprMatch[0].trim() : prompt },
      reasoning: "User requested mathematical calculation.",
    };
  }

  if (lowerPrompt.includes("search course") || lowerPrompt.includes("find course") || lowerPrompt.includes("recommend course")) {
    const topicMatch = prompt.replace(/(search|find|recommend|course|courses|for)/gi, "").trim();
    return {
      action: "TOOL_CALL",
      toolName: "courseSearch",
      args: { query: topicMatch || "AI" },
      reasoning: "User requested course search.",
    };
  }

  if (lowerPrompt.includes("my progress") || lowerPrompt.includes("completed lessons") || lowerPrompt.includes("completion percentage")) {
    return {
      action: "TOOL_CALL",
      toolName: "studentProgressLookup",
      args: {},
      reasoning: "User requested student progress lookup.",
    };
  }

  if (lowerPrompt.includes("flashcard") || lowerPrompt.includes("study card")) {
    const topicMatch = prompt.replace(/(create|generate|flashcard|flashcards|study|card|cards|for|about)/gi, "").trim();
    return {
      action: "TOOL_CALL",
      toolName: "flashcardGenerator",
      args: { topic: topicMatch || "General Science", count: 3 },
      reasoning: "User requested flashcard generation.",
    };
  }

  if (lowerPrompt.includes("quiz") || lowerPrompt.includes("test me")) {
    const topicMatch = prompt.replace(/(create|generate|quiz|test me|for|about)/gi, "").trim();
    return {
      action: "TOOL_CALL",
      toolName: "quizGenerator",
      args: { topic: topicMatch || "AI Basics", difficulty: "medium" },
      reasoning: "User requested quiz generation.",
    };
  }

  if (lowerPrompt.includes("resource") || lowerPrompt.includes("documentation") || lowerPrompt.includes("study guide")) {
    const topicMatch = prompt.replace(/(find|lookup|resource|resources|documentation|study guide|for)/gi, "").trim();
    return {
      action: "TOOL_CALL",
      toolName: "learningResourceLookup",
      args: { topic: topicMatch || "JavaScript" },
      reasoning: "User requested learning resources.",
    };
  }

  // Step 2: Fall back to direct response generation
  return {
    action: "FINAL_RESPONSE",
    reasoning: "Sufficient info available to generate final explanation.",
  };
};

module.exports = {
  planNextStep,
};
