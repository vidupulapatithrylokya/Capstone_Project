// server/services/tools/quizTool.js
const Quiz = require("../../models/Quiz");

/**
 * Quiz Tool: Generate topic quizzes
 */
const execute = async ({ userId }, { topic, difficulty = "medium" }) => {
  if (!topic) {
    throw new Error("Topic is required to generate a quiz.");
  }

  const quizQuestions = [
    {
      questionText: `Which of the following best defines ${topic}?`,
      options: [
        `An advanced method in software engineering`,
        `A deprecated legacy library`,
        `A frontend styling engine`,
        `A hardware component`
      ],
      correctAnswerIndex: 0,
      explanation: `${topic} is widely used in modern software engineering.`,
    },
    {
      questionText: `What is the primary advantage of using ${topic}?`,
      options: [
        `High efficiency and reliability`,
        `Requires no code writing`,
        `Replaces all databases`,
        `Eliminates network latency`
      ],
      correctAnswerIndex: 0,
      explanation: `Efficiency and reliability are key benefits of ${topic}.`,
    },
  ];

  const quizDoc = await Quiz.create({
    user: userId,
    title: `${topic} Quiz (${difficulty.toUpperCase()})`,
    topic,
    difficulty,
    questions: quizQuestions,
  }).catch(() => null);

  return {
    quizId: quizDoc ? quizDoc._id : "quiz-gen-101",
    topic,
    difficulty,
    totalQuestions: quizQuestions.length,
    questions: quizQuestions,
  };
};

module.exports = {
  name: "quizGenerator",
  description: "Generate a multiple-choice quiz for a given subject or topic.",
  allowedRoles: ["student", "mentor", "admin"],
  parameters: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Topic of the quiz" },
      difficulty: { type: "string", description: "Difficulty level (easy, medium, hard)" },
    },
    required: ["topic"],
  },
  execute,
};
