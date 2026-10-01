const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword,
  updateUserRole,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password",authMiddleware,changePassword);
router.patch("/:id/role",authMiddleware,roleMiddleware("admin"),updateUserRole);

module.exports = router;