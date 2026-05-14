const express = require("express");
const { uploadMiddleware, uploadAudio } = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");

const buildUploadRoutes = (env) => {
  const router = express.Router();
  const auth = protect(env.jwtSecret);

  router.post("/audio", auth, uploadMiddleware, uploadAudio);

  return router;
};

module.exports = buildUploadRoutes;
