// server/services/tools/calculatorTool.js

/**
 * Calculator Tool: Evaluates basic arithmetic math expressions safely without eval()
 */
const execute = async (context, { expression }) => {
  if (!expression || typeof expression !== "string") {
    throw new Error("Invalid or missing math expression.");
  }

  // Sanitize input to only allow safe arithmetic characters
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
  if (!sanitized.trim()) {
    throw new Error("Expression contains invalid characters.");
  }

  // Safe Function calculation
  try {
    const fn = new Function(`return (${sanitized})`);
    const result = fn();
    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("Calculation resulted in non-finite number.");
    }
    return { expression: sanitized, result };
  } catch (err) {
    throw new Error(`Math calculation error: ${err.message}`);
  }
};

module.exports = {
  name: "calculator",
  description: "Perform basic mathematical calculations (addition, subtraction, multiplication, division).",
  allowedRoles: ["student", "mentor", "admin"],
  parameters: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "The mathematical expression to evaluate, e.g. '15 * 4 + 2'.",
      },
    },
    required: ["expression"],
  },
  execute,
};
