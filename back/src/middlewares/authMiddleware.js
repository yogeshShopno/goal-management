const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = (jwtSecret) =>
  asyncHandler(async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized. Token missing.");
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, jwtSecret);
    } catch {
      throw new ApiError(401, "Unauthorized. Invalid token.");
    }

    const user = await User.findById(decodedToken.userId).select(
      "-password -__v"
    );
    if (!user || !user.isActive) {
      throw new ApiError(401, "Unauthorized. User not found or inactive.");
    }

    req.user = user;
    next();
  });

const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "Forbidden. Role not allowed.");
  }
  next();
};

const requirePermissions = (...requiredPermissions) => (req, _res, next) => {
  const userPermissions = req.user?.permissions || [];
  const hasPermission = requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasPermission) {
    throw new ApiError(403, "Forbidden. Missing required permissions.");
  }

  next();
};

module.exports = {
  protect,
  authorizeRoles,
  requirePermissions,
};
