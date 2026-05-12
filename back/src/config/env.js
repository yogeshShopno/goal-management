const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  corsOrigin: "*",
};

module.exports = env;
