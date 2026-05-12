const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const buildAuthRoutes = (env) => {
  const router = express.Router();

  router.post("/register", register(env));
  router.post("/login", login(env));
  router.get("/me", protect(env.jwtSecret), getMe);

  return router;
};

module.exports = buildAuthRoutes;
