const express = require("express");

const router = express.Router();

const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  deleteLesson,
} = require("../controllers/lessonController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public Routes
router.get("/course/:courseId", getLessonsByCourse);
router.get("/:id", getLessonById);

// Mentor Only
router.post(
  "/",
  protect,
  authorizeRoles("mentor"),
  createLesson
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("mentor"),
  deleteLesson
);

module.exports = router;