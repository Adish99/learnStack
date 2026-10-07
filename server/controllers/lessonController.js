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

const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lessons = await Lesson.find({
      course: courseId,
      isPublished: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Get course lessons error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const course = await Course.findById(lesson.course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only the course instructor can update the lesson
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own lessons",
      });
    }

    const {
      title,
      description,
      videoUrl,
      duration,
      order,
      isPublished,
    } = req.body;

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (duration !== undefined) lesson.duration = duration;
    if (order !== undefined) lesson.order = order;
    if (isPublished !== undefined) lesson.isPublished = isPublished;

    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createLesson,
  getCourseLessons,
  updateLesson
};