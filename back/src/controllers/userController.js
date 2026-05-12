const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES, getPermissionsByRole } = require("../utils/roles");

const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password -__v").sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: users,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(400, "Invalid role provided.");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.role = role;
  user.permissions = getPermissionsByRole(role);
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
  });
});

module.exports = {
  getAllUsers,
  updateUserRole,
};
