const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

const createLesson = async (req, res) => {
  try {
    const { title, description, duration, order } = req.body;
    const { courseId } = req.params;

    if (!title || !order) {
      return res.status(400).json({
        success: false,
        message: "Title and order are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only the course instructor can add lessons
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only add lessons to your own courses",
      });
    }

    const lesson = await Lesson.create({
      title,
      description,
      duration,
      order,
      course: courseId,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createLesson,
};