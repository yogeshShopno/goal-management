const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const { ROLES, getPermissionsByRole } = require("../utils/roles");

const register = (env) =>
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email and password are required.");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, "Email already registered.");
    }

    const normalizedRole = Object.values(ROLES).includes(role)
      ? role
      : ROLES.USER;

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      permissions: getPermissionsByRole(normalizedRole),
    });

    const token = generateToken(user._id, env.jwtSecret, env.jwtExpiresIn);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  });

const login = (env) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is inactive.");
    }

    const token = generateToken(user._id, env.jwtSecret, env.jwtExpiresIn);
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  });

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

module.exports = {
  register,
  login,
  getMe,
};
