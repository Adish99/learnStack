const express = require("express");

const { createCourse } = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("instructor"),
  createCourse
);

module.exports = router;