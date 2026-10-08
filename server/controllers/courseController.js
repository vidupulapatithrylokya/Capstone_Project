const Course = require("../models/Course");

// ==========================================
// Create Course (Mentor Only)
// ==========================================
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      language,
      duration,
      price,
      thumbnail,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required.",
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      level,
      language,
      duration,
      price,
      thumbnail,
      mentor: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Courses
// ==========================================
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("mentor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Course By ID
// ==========================================
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("mentor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
};