const express = require("express");

const router = express.Router();

const { searchCourses } = require("../controllers/searchController");

router.get("/", searchCourses);

module.exports = router;