const express = require("express");

const { createCourse, getCourses } = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/",authMiddleware,roleMiddleware("instructor"),createCourse);
router.get("/",authMiddleware,roleMiddleware("instructor"),getCourses);

module.exports = router;