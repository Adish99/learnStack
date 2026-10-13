
const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Create a course review
const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const studentId = req.user.id;

    // Validate rating
    if (
      rating === undefined ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    // Check whether the course exists
    const course = await Course.findOne({
      _id: courseId,
      status: "published",
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found",
      });
    }

    // Check whether the student is enrolled
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      paymentStatus: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to review this course",
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    const review = await Review.create({
      student: studentId,
      course: courseId,
      rating: Number(rating),
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Course review submitted successfully",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      status: "published",
    }).select("_id title");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found",
      });
    }

    const reviews = await Review.find({
      course: courseId,
    })
      .populate("student", "name avatar")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews) *
              10
          ) / 10
        : 0;

    return res.status(200).json({
      success: true,
      course: course.title,
      totalReviews,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get course reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const updateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const { rating, comment } = req.body;

    // Validate rating if provided
    if (
      rating !== undefined &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    // Find the student's review for this course
    const review = await Review.findOne({
      student: studentId,
      course: courseId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update only the fields provided
    if (rating !== undefined) {
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (typeof comment !== "string" || comment.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment must be a string of at most 1000 characters",
        });
      }

      review.comment = comment.trim();
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const deleteReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Find the review belonging to this student and course
    const review = await Review.findOne({
      student: studentId,
      course: courseId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview
};