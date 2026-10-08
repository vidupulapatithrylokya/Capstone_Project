// server/services/tools/courseSearchTool.js
const Course = require("../../models/Course");
const mongoose = require("mongoose");

/**
 * Course Search Tool: Searches available ExplainAI courses
 */
const execute = async (ctx, { query, category }) => {
  let courses = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ];
      }
      if (category) {
        filter.category = { $regex: category, $options: "i" };
      }
      courses = await Course.find(filter).limit(5).select("title description category level price rating");
    } catch (err) {
      // Fallback
    }
  }

  // Fallback demo courses if DB is empty or disconnected
  if (courses.length === 0) {
    courses = [
      { _id: "c1", title: "Mastering AI & Machine Learning", description: "Comprehensive guide to modern AI", category: "AI", level: "Beginner", price: 49.99, rating: 4.8 },
      { _id: "c2", title: "Full-Stack Web Development with React 19", description: "Build scalable web applications", category: "Web Development", level: "Intermediate", price: 59.99, rating: 4.9 },
    ];
  }

  return {
    count: courses.length,
    courses: courses.map((c) => ({
      id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      price: c.price,
      rating: c.rating,
    })),
  };
};

module.exports = {
  name: "courseSearch",
  description: "Search for published courses in ExplainAI catalog by keyword or category.",
  allowedRoles: ["student", "mentor", "admin"],
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search keyword for course title or description" },
      category: { type: "string", description: "Filter by category (e.g. AI, Web Development, Data Science)" },
    },
  },
  execute,
};
