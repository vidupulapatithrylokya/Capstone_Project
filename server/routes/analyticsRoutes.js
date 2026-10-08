const express = require("express");

const router = express.Router();

const { getAnalytics } = require("../controllers/analyticsController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAnalytics
);

module.exports = router;