const Staff = require("../models/Staff");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES, getPermissionsByRole } = require("../utils/roles");

/**
 * Create a new staff member
 * Only admins can create staff and can only create staff for themselves
 */
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } =
    req.body;

  // Validation
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Allowed roles: ${Object.values(ROLES).join(", ")}`
    );
  }

  // Check if staff email already exists for this admin
  const existingStaff = await Staff.findOne({
    email: email.toLowerCase(),
    adminId: req.user._id,
  });

  if (existingStaff) {
    throw new ApiError(400, "Staff with this email already exists.");
  }

  // Create staff
  const staff = await Staff.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || "",
    role,
  
    adminId: req.user._id,
    permissions: getPermissionsByRole(role),
  });

  res.status(201).json({
    success: true,
    message: "Staff created successfully",
    data: staff,
  });
});

/**
 * Get all staff members for the authenticated admin
 */
const getStaff = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { adminId: req.user._id };

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNum - 1) * pageSize;

  const [staff, total] = await Promise.all([
    Staff.find(query)
      .select("-password")
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    Staff.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      staff,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    },
  });
});

/**
 * Get staff by ID
 */
const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findOne({
    _id: id,
    adminId: req.user._id,
  }).select("-password");

  if (!staff) {
    throw new ApiError(404, "Staff not found.");
  }

  res.status(200).json({
    success: true,
    data: staff,
  });
});

/**
 * Update staff
 */
const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, isActive } = req.body;

  // Check if staff exists and belongs to this admin
  const staff = await Staff.findOne({
    _id: id,
    adminId: req.user._id,
  });

  if (!staff) {
    throw new ApiError(404, "Staff not found.");
  }

  // Update allowed fields
  if (name) staff.name = name;
  if (phone) staff.phone = phone;
  if (role && Object.values(ROLES).includes(role)) {
    staff.role = role;
    staff.permissions = getPermissionsByRole(role);
  } else if (role) {
    throw new ApiError(400, `Invalid role: ${role}`);
  }

  if (isActive !== undefined) staff.isActive = isActive;

  await staff.save();

  res.status(200).json({
    success: true,
    message: "Staff updated successfully",
    data: staff,
  });
});

/**
 * Assign role to staff (only admin can do this)
 */
const assignRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !Object.values(ROLES).includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Allowed roles: ${Object.values(ROLES).join(", ")}`
    );
  }

  const staff = await Staff.findOne({
    _id: id,
    adminId: req.user._id,
  });

  if (!staff) {
    throw new ApiError(404, "Staff not found.");
  }

  staff.role = role;
  staff.permissions = getPermissionsByRole(role);

  await staff.save();

  res.status(200).json({
    success: true,
    message: `Role assigned successfully`,
    data: staff,
  });
});

/**
 * Delete staff
 */
const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findOneAndDelete({
    _id: id,
    adminId: req.user._id,
  });

  if (!staff) {
    throw new ApiError(404, "Staff not found.");
  }

  res.status(200).json({
    success: true,
    message: "Staff deleted successfully",
  });
});

/**
 * Deactivate/Activate staff
 */
const toggleStaffStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findOne({
    _id: id,
    adminId: req.user._id,
  });

  if (!staff) {
    throw new ApiError(404, "Staff not found.");
  }

  staff.isActive = !staff.isActive;
  await staff.save();

  res.status(200).json({
    success: true,
    message: `Staff ${staff.isActive ? "activated" : "deactivated"} successfully`,
    data: staff,
  });
});

module.exports = {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  assignRole,
  deleteStaff,
  toggleStaffStatus,
};
