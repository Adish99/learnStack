
const express = require("express");

const {
  enrollInCourse,
  getMyEnrollments,
  completeLesson,
  getCourseProgress,
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Enroll the logged-in student in a course
router.post("/:courseId",authMiddleware,roleMiddleware("student"),enrollInCourse);
router.get("/my-courses",authMiddleware,roleMiddleware("student"),getMyEnrollments);
router.patch("/:courseId/lessons/:lessonId/complete",authMiddleware,roleMiddleware("student"),completeLesson);
router.get("/:courseId/progress",authMiddleware,roleMiddleware("student"),getCourseProgress);

module.exports = router;