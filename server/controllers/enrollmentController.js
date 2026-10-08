const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// ==========================================
// Enroll in Course
// ==========================================
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
    });

    return res.status(201).json({
      success: true,
      message: "Course enrolled successfully.",
      enrollment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Courses
// ==========================================
const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    })
      .populate("course")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Students Enrolled in a Course
// ==========================================
const getCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId,
    })
      .populate("student", "name email")
      .populate("course", "title");

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Unenroll from Course
// ==========================================
const unenrollCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    await enrollment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Successfully unenrolled from course.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  enrollCourse,
  getMyCourses,
  getCourseEnrollments,
  unenrollCourse,
};