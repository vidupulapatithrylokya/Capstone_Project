const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const getAnalytics = async (req, res) => {
    try {

        const analytics = {
            users: await User.countDocuments(),
            students: await User.countDocuments({ role: "student" }),
            mentors: await User.countDocuments({ role: "mentor" }),
            courses: await Course.countDocuments(),
            enrollments: await Enrollment.countDocuments()
        };

        res.status(200).json({
            success: true,
            analytics
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getAnalytics
};