const Course = require("../models/Course");

// Search Courses
const searchCourses = async (req, res) => {
    try {

        const keyword = req.query.q || "";

        const courses = await Course.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },
                { level: { $regex: keyword, $options: "i" } },
                { language: { $regex: keyword, $options: "i" } }
            ]
        }).populate("mentor", "name");

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
    searchCourses
};