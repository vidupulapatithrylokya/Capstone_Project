const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");

// ==========================================
// Mark Lesson as Completed
// ==========================================
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and Lesson ID are required.",
      });
    }

    // Find existing progress
    let progress = await Progress.findOne({
      student: req.user._id,
      course: courseId,
    });

    // Create progress if it doesn't exist
    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: courseId,
        completedLessons: [],
      });
    }

    // Prevent duplicate completion
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update last lesson
    progress.lastLesson = lessonId;

    // Count total lessons in the course
    const totalLessons = await Lesson.countDocuments({
  course: courseId,
});

if (totalLessons === 0) {
  return res.status(400).json({
    success: false,
    message: "This course has no lessons."
  });
}

// Calculate percentage
progress.percentage = Math.round(
  (progress.completedLessons.length / totalLessons) * 100
);

    // Check course completion
    if (progress.percentage >= 100) {
      progress.completed = true;
    }

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Lesson completed successfully.",
      progress,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Progress
// ==========================================
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.user._id,
      course: req.params.courseId,
    }).populate("completedLessons", "title");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found.",
      });
    }

    return res.status(200).json({
      success: true,
      progress,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Resume Course
// ==========================================
const resumeCourse = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.user._id,
      course: req.params.courseId,
    }).populate("lastLesson");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found.",
      });
    }

    return res.status(200).json({
      success: true,
      lastLesson: progress.lastLesson,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  completeLesson,
  getProgress,
  resumeCourse,
};