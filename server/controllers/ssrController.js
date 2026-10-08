// server/controllers/ssrController.js
const Course = require("../models/Course");
const mongoose = require("mongoose");

/**
 * Server-Side Rendered (SSR) Course Catalog HTML view
 */
const renderCoursesSSR = async (req, res) => {
  let courses = [];
  if (mongoose.connection.readyState === 1) {
    try {
      courses = await Course.find({}).limit(10).lean();
    } catch (err) {}
  }

  if (courses.length === 0) {
    courses = [
      { title: "Mastering AI Application Engineering", description: "Learn RAG, Function Calling, Multi-Step Agents, and Security.", category: "AI", level: "Advanced", price: 99.99 },
      { title: "Full-Stack Web Development with React 19", description: "Build modern web apps with Vite, Tailwind CSS v4, and Express.", category: "Web Dev", level: "Intermediate", price: 59.99 },
    ];
  }

  const courseItemsHtml = courses
    .map(
      (c) => `
        <div style="background:#15192d; border:1px solid #282f4d; border-radius:12px; padding:20px; margin-bottom:16px;">
          <h3 style="color:#60a5fa; font-size:1.25rem; margin-top:0;">${c.title}</h3>
          <p style="color:#94a3b8; font-size:0.95rem;">${c.description}</p>
          <div style="display:flex; gap:12px; font-size:0.85rem; color:#cbd5e1;">
            <span>Category: <strong>${c.category || "AI"}</strong></span>
            <span>Level: <strong>${c.level || "Beginner"}</strong></span>
            <span>Price: <strong>$${c.price || 0}</strong></span>
          </div>
        </div>
      `
    )
    .join("");

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ExplainAI - Course Catalog (SSR)</title>
  <meta name="description" content="Server-Side Rendered Course Catalog for ExplainAI Learning Platform">
  <style>
    body { background-color: #090b17; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; margin:0; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 2.25rem; color: #ffffff; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; }
    .badge { background: #1e3a8a; color: #93c5fd; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>ExplainAI Server-Side Rendered Catalog <span class="badge">SSR Mode</span></h1>
    <p style="color:#cbd5e1;">This page was dynamically rendered on the Express backend server.</p>
    <div style="margin-top:24px;">
      ${courseItemsHtml}
    </div>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(fullHtml);
};

module.exports = {
  renderCoursesSSR,
};
