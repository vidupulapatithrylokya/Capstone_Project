const Video = require("../models/Video");

// Upload Video
const createVideo = async (req, res) => {
    try {

        const video = await Video.create(req.body);

        res.status(201).json({
            success: true,
            video
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Videos
const getVideos = async (req, res) => {
    try {

        const videos = await Video.find().populate("course", "title");

        res.status(200).json({
            success: true,
            count: videos.length,
            videos
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Video By ID
const getVideoById = async (req, res) => {
    try {

        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        res.status(200).json({
            success: true,
            video
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Video
const updateVideo = async (req, res) => {
    try {

        const video = await Video.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        res.status(200).json({
            success: true,
            video
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Video
const deleteVideo = async (req, res) => {
    try {

        const video = await Video.findByIdAndDelete(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Video deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createVideo,
    getVideos,
    getVideoById,
    updateVideo,
    deleteVideo
};