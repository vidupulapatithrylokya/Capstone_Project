// server/routes/ssrRoutes.js
const express = require("express");
const router = express.Router();
const { renderCoursesSSR } = require("../controllers/ssrController");

router.get("/courses", renderCoursesSSR);

module.exports = router;
