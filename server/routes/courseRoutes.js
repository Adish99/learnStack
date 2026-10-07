const express = require("express");

const { createCourse, getCourses, getCourseById, publishCourse, updateCourse, deleteCourse } = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/",authMiddleware,roleMiddleware("instructor"),createCourse);
router.get("/",getCourses);
router.get("/:id", getCourseById);
router.patch( "/:id/publish",authMiddleware,roleMiddleware("instructor"),publishCourse);
router.put("/:id",authMiddleware,roleMiddleware("instructor"),updateCourse);
router.delete("/:id", authMiddleware,roleMiddleware("instructor"),deleteCourse);

module.exports = router;