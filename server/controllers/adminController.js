const User = require("../models/User");
const Course = require("../models/Course");

// Dashboard
const getDashboard = async (req, res) => {
    try {

        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalMentors = await User.countDocuments({ role: "mentor" });

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers,
                totalStudents,
                totalMentors,
                totalCourses
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Users
const getAllUsers = async (req, res) => {

    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Courses
const getAllCourses = async (req, res) => {

    try {

        const courses = await Course.find().populate("mentor", "name email");

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getDashboard,
    getAllUsers,
    getAllCourses
};