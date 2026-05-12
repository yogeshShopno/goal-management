const jwt = require("jsonwebtoken");

const generateToken = (userId, secret, expiresIn) =>
  jwt.sign({ userId }, secret, { expiresIn });

module.exports = generateToken;
