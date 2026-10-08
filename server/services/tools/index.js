// server/services/tools/index.js
const calculator = require("./calculatorTool");
const courseSearch = require("./courseSearchTool");
const studentProgressLookup = require("./progressTool");
const flashcardGenerator = require("./flashcardTool");
const quizGenerator = require("./quizTool");
const learningResourceLookup = require("./learningResourceTool");

const tools = [
  calculator,
  courseSearch,
  studentProgressLookup,
  flashcardGenerator,
  quizGenerator,
  learningResourceLookup,
];

const toolMap = new Map();
tools.forEach((t) => toolMap.set(t.name, t));

/**
 * Get schemas of available tools formatted for LLM declaration
 */
const getToolSchemas = () => {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
};

/**
 * Execute a tool safely with role checking and argument validation
 */
const executeTool = async (toolName, args = {}, context = {}) => {
  try {
    const tool = toolMap.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' does not exist.`);
    }

    // Enforce role-based tool restrictions
    const userRole = context.userRole || "student";
    if (tool.allowedRoles && !tool.allowedRoles.includes(userRole)) {
      throw new Error(`Access Denied: Role '${userRole}' is not allowed to use tool '${toolName}'.`);
    }

    // Validate required arguments
    if (tool.parameters && tool.parameters.required) {
      for (const reqParam of tool.parameters.required) {
        if (args[reqParam] === undefined || args[reqParam] === null) {
          throw new Error(`Missing required parameter '${reqParam}' for tool '${toolName}'.`);
        }
      }
    }

    // Log execution safely
    console.log(`[AI Tool Call] Executing '${toolName}' by User '${context.userId}' (Role: ${userRole})`);

    const result = await tool.execute(context, args);
    return {
      success: true,
      tool: toolName,
      data: result,
    };
  } catch (err) {
    console.error(`[AI Tool Error] Execution failed for '${toolName}':`, err.message);
    return {
      success: false,
      tool: toolName,
      error: err.message,
    };
  }
};

module.exports = {
  getToolSchemas,
  executeTool,
  tools,
};
