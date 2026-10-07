const express = require("express");

const { createLesson, getCourseLessons, updateLesson, publishLesson, deleteLesson } = require("../controllers/lessonController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/courses/:courseId/lessons",authMiddleware,roleMiddleware("instructor"),createLesson);
router.get("/courses/:courseId/lessons",getCourseLessons);
router.put("/lessons/:id",authMiddleware,roleMiddleware("instructor"),updateLesson);
router.patch("/lessons/:id/publish",authMiddleware,roleMiddleware("instructor"),publishLesson);
router.delete("/lessons/:id",authMiddleware,roleMiddleware("instructor"),deleteLesson);

module.exports = router;