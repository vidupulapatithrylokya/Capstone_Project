// server/services/promptSanitizer.js

/**
 * Suspicious prompt injection detection patterns
 */
const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /ignore (all )?above instructions/i,
  /reveal (your )?system prompt/i,
  /show (your )?initial instructions/i,
  /return (the )?api key/i,
  /expose (the )?environment variables/i,
  /override security rules/i,
  /execute arbitrary code/i,
  /drop database/i,
  /delete all records/i,
  /bypass authorization/i,
  /system prompt override/i,
];

/**
 * Maximum character length allowed for AI prompts
 */
const MAX_PROMPT_LENGTH = 4000;

/**
 * Sanitizes and validates input prompts for injection attempts
 */
const sanitizeAndValidatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== "string") {
    return { isValid: false, reason: "Prompt must be a non-empty string." };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { isValid: false, reason: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.` };
  }

  // Check for suspicious prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      console.warn(`[Security Alert] Prompt injection attempt detected: "${prompt.slice(0, 100)}..."`);
      return {
        isValid: false,
        isInjection: true,
        reason: "Security Alert: Prompt contains potential instruction override or injection patterns.",
      };
    }
  }

  // Basic HTML/Script tag sanitization
  const sanitized = prompt
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "");

  return {
    isValid: true,
    sanitizedPrompt: sanitized.trim(),
  };
};

/**
 * Filters output to ensure private keys, credentials, or tokens are never leaked
 */
const filterSensitiveOutput = (output) => {
  if (typeof output !== "string") return output;
  return output
    .replace(/sk-[a-zA-Z0-9]{32,}/g, "[REDACTED_API_KEY]")
    .replace(/MONGO_URI=[\S]+/gi, "MONGO_URI=[REDACTED]")
    .replace(/JWT_SECRET=[\S]+/gi, "JWT_SECRET=[REDACTED]")
    .replace(/bearer\s+[a-zA-Z0-9.\-_]+/gi, "Bearer [REDACTED_TOKEN]");
};

module.exports = {
  sanitizeAndValidatePrompt,
  filterSensitiveOutput,
  MAX_PROMPT_LENGTH,
};
