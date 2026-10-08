const express = require("express");

const router = express.Router();

const {
  completeLesson,
  getProgress,
  resumeCourse,
} = require("../controllers/progressController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// =======================================
// Student Routes
// =======================================

// Mark lesson as completed
router.post(
  "/complete",
  protect,
  authorizeRoles("student"),
  completeLesson
);

// Get progress of a course
router.get(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  getProgress
);

// Resume learning
router.get(
  "/resume/:courseId",
  protect,
  authorizeRoles("student"),
  resumeCourse
);

module.exports = router;