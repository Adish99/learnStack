
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // 1. Find the course
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

    // 2. Check for an existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // 3. Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
    });

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (error) {
    // Handle duplicate enrollment attempts
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    console.error("Enroll in course error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({
      student: studentId,
    })
      .populate({
        path: "course",
        select: "title description thumbnail price category level status instructor",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Get my enrollments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    // Check whether the student is enrolled
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      paymentStatus: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course",
      });
    }

    // Check whether the lesson belongs to this course
    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId,
      isPublished: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Published lesson not found in this course",
      });
    }

    // Avoid counting the same lesson twice
    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId);

      const totalLessons = await Lesson.countDocuments({
        course: courseId,
        isPublished: true,
      });

      enrollment.progress =
        totalLessons > 0
          ? Math.round(
              (enrollment.completedLessons.length / totalLessons) * 100
            )
          : 0;

      if (enrollment.progress === 100) {
        enrollment.completedAt = new Date();
      }

      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      message: "Lesson marked as completed",
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    console.error("Complete lesson error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  completeLesson
};