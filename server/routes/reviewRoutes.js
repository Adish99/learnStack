
const express = require("express");
const { createReview, getCourseReviews } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Submit a review for a course
router.post("/:courseId",authMiddleware,roleMiddleware("student"),createReview);
router.get("/:courseId", getCourseReviews);

module.exports = router;