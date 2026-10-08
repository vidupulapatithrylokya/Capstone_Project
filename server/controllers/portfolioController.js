const Portfolio = require("../models/Portfolio");

// Create or Update Portfolio
const savePortfolio = async (req, res) => {
    try {

        const portfolio = await Portfolio.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            {
                new: true,
                upsert: true
            }
        );

        res.status(200).json({
            success: true,
            portfolio
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get My Portfolio
const getPortfolio = async (req, res) => {

    try {

        const portfolio = await Portfolio.findOne({
            user: req.user._id
        });

        res.status(200).json({
            success: true,
            portfolio
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    savePortfolio,
    getPortfolio
};