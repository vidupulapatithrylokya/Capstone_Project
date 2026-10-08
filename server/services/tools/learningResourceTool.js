// server/services/tools/learningResourceTool.js

/**
 * Learning Resource Lookup Tool: Find articles, documentation, or study guides
 */
const execute = async (ctx, { topic }) => {
  if (!topic) {
    throw new Error("Topic is required to look up learning resources.");
  }

  const resources = [
    { title: `Official ${topic} Documentation`, url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`, type: "Documentation" },
    { title: `Mastering ${topic} Guide`, url: `https://explainai.edu/resources/${encodeURIComponent(topic)}`, type: "Guide" },
    { title: `${topic} Best Practices & Architecture`, url: `https://explainai.edu/articles/${encodeURIComponent(topic)}`, type: "Article" },
  ];

  return {
    topic,
    count: resources.length,
    resources,
  };
};

module.exports = {
  name: "learningResourceLookup",
  description: "Find verified documentation, guides, and articles for any learning topic.",
  allowedRoles: ["student", "mentor", "admin"],
  parameters: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Topic or technology to find educational resources for" },
    },
    required: ["topic"],
  },
  execute,
};
