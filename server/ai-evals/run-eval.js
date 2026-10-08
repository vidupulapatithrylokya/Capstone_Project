// server/ai-evals/run-eval.js
const fs = require("fs");
const path = require("path");
const { generateAIResponse, runAgentWorkflow } = require("../services/aiService");

const datasetPath = path.join(__dirname, "eval-dataset.json");
const evalCases = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

async function runEvaluations() {
  console.log("==========================================");
  console.log("       EXPLAINAI - AI EVALUATION SUITE    ");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const testCase of evalCases) {
    const startTime = Date.now();
    let status = "FAIL";
    let detail = "";

    try {
      if (testCase.shouldReject) {
        try {
          await generateAIResponse(testCase.prompt, { userId: "eval-user-101", userRole: "student" });
          detail = "Expected rejection, but request succeeded.";
        } catch (err) {
          status = "PASS";
          detail = `Blocked as expected: ${err.message}`;
        }
      } else {
        const res = await generateAIResponse(testCase.prompt, { userId: "eval-user-101", userRole: "student" });
        if (testCase.expectedTool && (!res.toolsUsed || !res.toolsUsed.includes(testCase.expectedTool))) {
          detail = `Expected tool '${testCase.expectedTool}', but got '${res.toolsUsed.join(", ")}'`;
        } else if (testCase.shouldContain && !testCase.shouldContain.some((str) => res.response.includes(str))) {
          detail = `Response missing required keyword '${testCase.shouldContain.join(", ")}'`;
        } else {
          status = "PASS";
          detail = `Success. Tools: [${res.toolsUsed.join(", ")}], Latency: ${res.latencyMs}ms`;
        }
      }
    } catch (err) {
      detail = `Unexpected failure: ${err.message}`;
    }

    const latencyMs = Date.now() - startTime;
    if (status === "PASS") passed++;
    else failed++;

    results.push({ id: testCase.id, category: testCase.category, status, latencyMs, detail });
    console.log(`[${status}] ${testCase.id} (${testCase.category}): ${detail}`);
  }

  const passRate = ((passed / evalCases.length) * 100).toFixed(1);
  console.log("------------------------------------------");
  console.log(`TOTAL: ${evalCases.length} | PASSED: ${passed} | FAILED: ${failed} | PASS RATE: ${passRate}%`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runEvaluations().catch((err) => {
  console.error("Eval runner fatal error:", err);
  process.exit(1);
});
