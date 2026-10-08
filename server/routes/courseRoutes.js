const express = require("express");

const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
} = require("../controllers/courseController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Mentor Only
router.post(
  "/",
  protect,
  authorizeRoles("mentor"),
  createCourse
);

module.exports = router;