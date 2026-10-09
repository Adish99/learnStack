
const express = require("express");

const {
  enrollInCourse,
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Enroll the logged-in student in a course
router.post(
  "/:courseId",
  authMiddleware,
  roleMiddleware("student"),
  enrollInCourse
);

module.exports = router;