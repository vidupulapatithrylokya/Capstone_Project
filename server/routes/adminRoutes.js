const express = require("express");

const router = express.Router();

const {
    getDashboard,
    getAllUsers,
    getAllCourses
} = require("../controllers/adminController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.use(
    protect,
    authorizeRoles("admin")
);

router.get("/dashboard", getDashboard);

router.get("/users", getAllUsers);

router.get("/courses", getAllCourses);

module.exports = router;