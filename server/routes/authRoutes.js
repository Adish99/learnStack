const express = require("express");

const { registerUser, loginUser, getCurrentUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",loginUser);

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

router.get(
  "/student-only",
  authMiddleware,
  roleMiddleware("student"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Student access granted",
    });
  }
);

router.get(
  "/instructor-only",
  authMiddleware,
  roleMiddleware("instructor"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Instructor access granted",
    });
  }
);

router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  }
);

module.exports = router;