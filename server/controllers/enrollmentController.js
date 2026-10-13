
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


const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      paymentStatus: "completed",
    }).populate("course", "title");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Get all currently published lessons
    const publishedLessons = await Lesson.find({
      course: courseId,
      isPublished: true,
    }).select("_id");

    const totalLessons = publishedLessons.length;

    // Store published lesson IDs for efficient lookup
    const publishedLessonIds = new Set(
      publishedLessons.map((lesson) => lesson._id.toString())
    );

    // Count only completed lessons that are still published
    const completedCount = enrollment.completedLessons.filter(
      (lessonId) => publishedLessonIds.has(lessonId.toString())
    ).length;

    // Calculate progress percentage
    const progress =
      totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    const isCompleted =
      totalLessons > 0 && completedCount === totalLessons;

    // Update enrollment progress and completion date
    enrollment.progress = progress;

    if (isCompleted) {
      enrollment.completedAt =
        enrollment.completedAt || new Date();
    } else {
      enrollment.completedAt = null;
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      course: enrollment.course.title,
      totalLessons,
      completedLessons: completedCount,
      progress,
      isCompleted,
    });
  } catch (error) {
    console.error("Get course progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get the student's enrolled courses
    const enrollments = await Enrollment.find({
      student: studentId,
      paymentStatus: "completed",
    })
      .populate({
        path: "course",
        select: "title description thumbnail price category level instructor",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .sort({ enrolledAt: -1 });

    const totalCourses = enrollments.length;

    // Calculate accurate progress for each enrolled course
    const progressData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseId = enrollment.course?._id;

        // Handle courses that may have been deleted
        if (!courseId) {
          return {
            progress: 0,
            completedLessons: 0,
            isCompleted: false,
          };
        }

        // Get currently published lessons
        const publishedLessons = await Lesson.find({
          course: courseId,
          isPublished: true,
        }).select("_id");

        const publishedLessonIds = new Set(
          publishedLessons.map((lesson) => lesson._id.toString())
        );

        // Count only completed lessons that are still published
        const completedLessons = enrollment.completedLessons.filter(
          (lessonId) => publishedLessonIds.has(lessonId.toString())
        ).length;

        const totalLessons = publishedLessons.length;

        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const isCompleted =
          totalLessons > 0 && completedLessons === totalLessons;

        // Keep the enrollment's stored progress up to date
        enrollment.progress = progress;
        enrollment.completedAt = isCompleted
          ? enrollment.completedAt || new Date()
          : null;

        await enrollment.save();

        return {
          progress,
          completedLessons,
          isCompleted,
        };
      })
    );

    // Calculate overall dashboard statistics
    const completedCourses = progressData.filter(
      (item) => item.isCompleted
    ).length;

    const totalCompletedLessons = progressData.reduce(
      (total, item) => total + item.completedLessons,
      0
    );

    const averageProgress =
      totalCourses > 0
        ? Math.round(
            progressData.reduce(
              (total, item) => total + item.progress,
              0
            ) / totalCourses
          )
        : 0;

    
return res.status(200).json({
  success: true,
  statistics: {
    totalCourses,
    completedCourses,
    totalCompletedLessons,
    averageProgress,
  },
  courses: enrollments.map((enrollment, index) => ({
    ...enrollment.toObject(),
    progress: progressData[index].progress,
    completedLessons: progressData[index].completedLessons,
    isCompleted: progressData[index].isCompleted,
  })),
});
  } catch (error) {
    console.error("Get student dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getEnrolledCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Verify the student is enrolled
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      paymentStatus: "completed",
    }).populate({
      path: "course",
      select: "title description thumbnail price category level instructor",
      populate: {
        path: "instructor",
        select: "name",
      },
    });

    if (!enrollment || !enrollment.course) {
      return res.status(404).json({
        success: false,
        message: "Enrolled course not found",
      });
    }

    // Get published lessons
    const lessons = await Lesson.find({
      course: courseId,
      isPublished: true,
    })
      .select("title description videoUrl duration order")
      .sort({ order: 1 });

    const completedLessonIds = new Set(
      enrollment.completedLessons.map((id) => id.toString())
    );

    const completedLessons = lessons.filter((lesson) =>
      completedLessonIds.has(lesson._id.toString())
    ).length;

    const totalLessons = lessons.length;

    const progress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      course: enrollment.course,
      lessons,
      progress: {
        totalLessons,
        completedLessons,
        percentage: progress,
        isCompleted: totalLessons > 0 && completedLessons === totalLessons,
      },
    });
  } catch (error) {
    console.error("Get enrolled course details error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  completeLesson,
  getCourseProgress,
  getStudentDashboard,
  getEnrolledCourseDetails
};