const express = require("express");

const router = express.Router();

const {
    createVideo,
    getVideos,
    getVideoById,
    updateVideo,
    deleteVideo
} = require("../controllers/videoController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Public
router.get("/", getVideos);
router.get("/:id", getVideoById);

// Mentor/Admin
router.post(
    "/",
    protect,
    authorizeRoles("mentor","admin"),
    createVideo
);

router.put(
    "/:id",
    protect,
    authorizeRoles("mentor","admin"),
    updateVideo
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("mentor","admin"),
    deleteVideo
);

module.exports = router;