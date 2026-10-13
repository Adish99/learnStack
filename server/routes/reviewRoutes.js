const express = require("express");
const { createReview, getCourseReviews, updateReview, deleteReview } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Submit a review for a course
router.post("/:courseId",authMiddleware,roleMiddleware("student"),createReview);
router.get("/:courseId", getCourseReviews);
router.patch("/:courseId",authMiddleware,roleMiddleware("student"),updateReview);
router.delete("/:courseId",authMiddleware,roleMiddleware("student"),deleteReview);

module.exports = router;