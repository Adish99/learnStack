const Course = require("../models/Course");

const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      price,
      category,
      level,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
      });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      price,
      category,
      level,
      instructor: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      status: "published",
    })
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      status: "published",
    }).populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById
};