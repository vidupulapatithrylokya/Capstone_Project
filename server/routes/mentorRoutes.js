const express = require("express");

const router = express.Router();

const {
  createMentorProfile,
  getMentorProfile,
  getMentorCourses,
} = require("../controllers/mentorController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post(
  "/profile",
  protect,
  authorizeRoles("mentor"),
  createMentorProfile
);

router.get(
  "/profile",
  protect,
  authorizeRoles("mentor"),
  getMentorProfile
);

router.get(
  "/courses",
  protect,
  authorizeRoles("mentor"),
  getMentorCourses
);

module.exports = router;