const express = require("express");

const router = express.Router();

const {
  enrollCourse,
  getMyCourses,
  getCourseEnrollments,
  unenrollCourse,
} = require("../controllers/enrollmentController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ==============================
// Student Routes
// ==============================

// Enroll in a course
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  enrollCourse
);

// Get all enrolled courses
router.get(
  "/my-courses",
  protect,
  authorizeRoles("student"),
  getMyCourses
);

// Unenroll from course
router.delete(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  unenrollCourse
);

// ==============================
// Mentor Route
// ==============================

// View students enrolled in a course
router.get(
  "/course/:courseId",
  protect,
  authorizeRoles("mentor"),
  getCourseEnrollments
);

module.exports = router;