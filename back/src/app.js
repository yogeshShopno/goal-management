const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const buildAuthRoutes = require("./routes/authRoutes");
const buildUserRoutes = require("./routes/userRoutes");
const buildGoalRoutes = require("./routes/goalRoutes");
const buildActionRoutes = require("./routes/actionRoutes");
const buildTaskRoutes = require("./routes/taskRoutes");
const buildStaffRoutes = require("./routes/staffRoutes");
const buildUploadRoutes = require("./routes/uploadRoutes");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");
const path = require("path");

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

const v1Router = express.Router();
v1Router.use("/auth", buildAuthRoutes(env));
v1Router.use("/users", buildUserRoutes(env));
v1Router.use("/goals", buildGoalRoutes(env));
v1Router.use("/actions", buildActionRoutes(env));
v1Router.use("/tasks", buildTaskRoutes(env));
v1Router.use("/staff", buildStaffRoutes(env));
v1Router.use("/upload", buildUploadRoutes(env));

app.use("/api/v1", v1Router);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
