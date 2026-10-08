// server/services/tools/flashcardTool.js
const Flashcard = require("../../models/Flashcard");

/**
 * Flashcard Tool: Generate and store study flashcards
 */
const execute = async ({ userId }, { topic, count = 3 }) => {
  if (!topic) {
    throw new Error("Topic is required to generate flashcards.");
  }

  const generatedFlashcards = [
    { question: `What is the core concept of ${topic}?`, answer: `${topic} is a fundamental concept in AI & software development.` },
    { question: `Why is ${topic} important in modern applications?`, answer: `It provides scalability, efficiency, and intelligence.` },
    { question: `What is a common best practice when implementing ${topic}?`, answer: `Always enforce proper modularity, error handling, and security.` },
  ].slice(0, count);

  // Store in database if model is present
  const flashcardDocs = await Promise.all(
    generatedFlashcards.map((fc) =>
      Flashcard.create({
        user: userId,
        topic,
        question: fc.question,
        answer: fc.answer,
      }).catch(() => fc)
    )
  );

  return {
    topic,
    count: flashcardDocs.length,
    flashcards: generatedFlashcards,
  };
};

module.exports = {
  name: "flashcardGenerator",
  description: "Generate educational study flashcards for a specific topic.",
  allowedRoles: ["student", "mentor", "admin"],
  parameters: {
    type: "object",
    properties: {
      topic: { type: "string", description: "The topic or concept to generate flashcards for" },
      count: { type: "integer", description: "Number of flashcards to generate (1-5)" },
    },
    required: ["topic"],
  },
  execute,
};
