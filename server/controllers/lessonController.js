const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// ==========================================
// Create Lesson (Mentor Only)
// ==========================================
const createLesson = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      videoUrl,
      pdfUrl,
      duration,
      order,
      isPreview,
      resources,
    } = req.body;

    if (!title || !course || !order) {
      return res.status(400).json({
        success: false,
        message: "Title, Course and Order are required.",
      });
    }

    // Check course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const lesson = await Lesson.create({
      title,
      description,
      course,
      videoUrl,
      pdfUrl,
      duration,
      order,
      isPreview,
      resources,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully.",
      lesson,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Lessons of a Course
// ==========================================
const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      course: req.params.courseId,
    }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Single Lesson
// ==========================================
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("course", "title");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    return res.status(200).json({
      success: true,
      lesson,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Lesson
// ==========================================
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    await lesson.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  deleteLesson,
};