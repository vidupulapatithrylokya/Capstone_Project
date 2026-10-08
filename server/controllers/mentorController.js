const Mentor = require("../models/Mentor");
const Course = require("../models/Course");

// Create or Update Mentor Profile
const createMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      mentor,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Mentor Profile
const getMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({
      user: req.user._id,
    }).populate("user", "-password");

    res.status(200).json({
      success: true,
      mentor,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Mentor Courses
const getMentorCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      mentor: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMentorProfile,
  getMentorProfile,
  getMentorCourses,
};