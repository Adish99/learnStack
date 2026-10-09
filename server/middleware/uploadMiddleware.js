
const multer = require("multer");

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

// Allow video files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
    files: 1,
  },
});

module.exports = upload;