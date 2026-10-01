const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes=require("./routes/authRoutes");
const userRoutes=require("./routes/userRoutes");

const app = express();

//Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LearnStack API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LearnStack server running on port ${PORT}`);
});