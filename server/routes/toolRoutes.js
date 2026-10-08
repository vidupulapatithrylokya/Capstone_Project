const express = require("express");

const router = express.Router();

const {
    createTool,
    getTools,
    getToolById,
    updateTool,
    deleteTool
} = require("../controllers/toolController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Public
router.get("/", getTools);
router.get("/:id", getToolById);

// Admin
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createTool
);

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateTool
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteTool
);

module.exports = router;