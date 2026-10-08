const Tool = require("../models/Tool");

// Create Tool
const createTool = async (req, res) => {
    try {

        const tool = await Tool.create(req.body);

        res.status(201).json({
            success: true,
            tool
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Tools
const getTools = async (req, res) => {
    try {

        const tools = await Tool.find();

        res.status(200).json({
            success: true,
            count: tools.length,
            tools
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Tool By ID
const getToolById = async (req, res) => {
    try {

        const tool = await Tool.findById(req.params.id);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: "Tool not found"
            });
        }

        res.status(200).json({
            success: true,
            tool
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Tool
const updateTool = async (req, res) => {
    try {

        const tool = await Tool.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: "Tool not found"
            });
        }

        res.status(200).json({
            success: true,
            tool
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Tool
const deleteTool = async (req, res) => {
    try {

        const tool = await Tool.findByIdAndDelete(req.params.id);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: "Tool not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Tool deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createTool,
    getTools,
    getToolById,
    updateTool,
    deleteTool
};