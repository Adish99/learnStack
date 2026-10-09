const express = require("express");

const { createLesson, getCourseLessons, updateLesson, publishLesson, deleteLesson, uploadLessonVideo } = require("../controllers/lessonController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

//Lesson Routes 
router.post("/courses/:courseId/lessons",authMiddleware,roleMiddleware("instructor"),createLesson);
router.get("/courses/:courseId/lessons",getCourseLessons);
router.put("/lessons/:id",authMiddleware,roleMiddleware("instructor"),updateLesson);
router.patch("/lessons/:id/publish",authMiddleware,roleMiddleware("instructor"),publishLesson);
router.delete("/lessons/:id",authMiddleware,roleMiddleware("instructor"),deleteLesson);
router.patch("/lessons/:id/video",authMiddleware,roleMiddleware("instructor"),upload.single("video"),uploadLessonVideo);

module.exports = router;