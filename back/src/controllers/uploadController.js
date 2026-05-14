const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Add appropriate extension for audio blob if not present
    let ext = path.extname(file.originalname);
    if (!ext) {
      ext = ".webm"; // default for MediaRecorder audio
    }
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

exports.uploadMiddleware = upload.single("audio");

exports.uploadAudio = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Generate the public URL. Assuming the server exposes /uploads statically
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      url: fileUrl,
    },
  });
};
