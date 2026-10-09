
const express = require("express");

const {
  enrollInCourse,
  getMyEnrollments,
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Enroll the logged-in student in a course
router.post("/:courseId",authMiddleware,roleMiddleware("student"),enrollInCourse);
router.get("/my-courses",authMiddleware,roleMiddleware("student"),getMyEnrollments);

module.exports = router;