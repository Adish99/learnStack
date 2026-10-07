const express = require("express");

const { createLesson } = require("../controllers/lessonController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/courses/:courseId/lessons",authMiddleware,roleMiddleware("instructor"),createLesson);

module.exports = router;