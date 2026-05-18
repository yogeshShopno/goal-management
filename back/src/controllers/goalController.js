const Goal = require("../models/Goal");
const Action = require("../models/Action");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const { getAdminStaffIds, getAdminStaffIdsAsStrings, isGoalAccessible, toStringId } = require("../utils/accessUtils");

// Fetch all goals with optional filters
const fetchGoals = asyncHandler(async (req, res) => {
  const { status, priority, startDate, deadline } = req.query;

  const query = {};

  // Only allow filtering by status, priority, and dates - NOT by ownership/responsibility
  if (status) query.status = status;
  if (priority) query.priority = priority;

  if (startDate || deadline) {
    query.deadline = {};
    if (startDate) query.deadline.$gte = new Date(startDate);
    if (deadline) query.deadline.$lte = new Date(deadline);
  }

  // Build access control conditions based on user role
  // Get admin staff IDs as ObjectIds for proper MongoDB query matching
  const adminStaffIds = await getAdminStaffIds(req.user);
  
  console.log(`🔐 fetchGoals - User ID: ${req.user._id}, Role: ${req.user.role}`);
  console.log(`📋 Admin Staff IDs: ${adminStaffIds.map(id => id.toString()).join(", ")}`);

  if (req.user.role === "admin") {
    // Admin can only see their own goals and their staff's goals
    query.$or = [
      { ownerId: req.user._id },
      { responsibleId: req.user._id },
      { ownerStaffId: { $in: adminStaffIds } },
      { responsibleStaffId: { $in: adminStaffIds } },
    ];
    console.log(`✅ Admin query built:`, JSON.stringify(query));
  } else {
    // Staff/User can only see their own goals
    query.$or = [
      { ownerId: req.user._id },
      { ownerStaffId: req.user._id },
      { responsibleId: req.user._id },
      { responsibleStaffId: req.user._id },
    ];
    console.log(`✅ Staff query built:`, JSON.stringify(query));
  }

  const goals = await Goal.find(query)
    .populate("ownerId", "name email role")
    .populate("ownerStaffId", "name email role")
    .populate("responsibleId", "name email role")
    .populate("responsibleStaffId", "name email role")
    .sort({ createdAt: -1 })
    .exec();

  console.log(`📊 Found ${goals.length} goals for user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: goals,
  });
});

// Fetch a single goal by ID
const fetchGoalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const goal = await Goal.findById(id)
    .populate("ownerId", "name email role")
    .populate("ownerStaffId", "name email role")
    .populate("responsibleId", "name email role")
    .populate("responsibleStaffId", "name email role")
    .exec();

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isGoalAccessible(goal, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to access this goal");
  }

  res.status(200).json({
    success: true,
    data: goal,
  });
});

// Create a new goal
const createGoal = asyncHandler(async (req, res) => {
  const { name, description, startDate, deadline, ownerId, ownerStaffId, responsibleId, responsibleStaffId, status, priority } = req.body;

  // Validation
  if (!name || !startDate || !deadline || (!ownerId && !ownerStaffId) || (!responsibleId && !responsibleStaffId)) {
    throw new ApiError(
      400,
      "name, startDate, deadline, ownerId/ownerStaffId, and responsibleId/responsibleStaffId are required"
    );
  }

  if (new Date(startDate) >= new Date(deadline)) {
    throw new ApiError(400, "Start date must be before deadline");
  }

  // Authorization check: ensure user can only create goals for themselves or their staff
  const adminStaffIdsAsStrings = await getAdminStaffIdsAsStrings(req.user);
  
  if (req.user.role === "admin") {
    // Admin can only assign goal to themselves or their staff
    if (ownerId && ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only create goals for yourself or your staff");
    }
    if (ownerStaffId && !adminStaffIdsAsStrings.includes(ownerStaffId.toString())) {
      throw new ApiError(403, "You can only assign goals to your staff members");
    }
    if (responsibleId && responsibleId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only assign responsibility to yourself or your staff");
    }
    if (responsibleStaffId && !adminStaffIdsAsStrings.includes(responsibleStaffId.toString())) {
      throw new ApiError(403, "You can only assign responsibility to your staff members");
    }
  } else {
    // Staff can only create goals for themselves
    if (ownerId && ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only create goals for yourself");
    }
    if (ownerStaffId) {
      throw new ApiError(403, "Staff members cannot create goals as other staff");
    }
    if (responsibleId && responsibleId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only be assigned as responsible for yourself");
    }
    if (responsibleStaffId) {
      throw new ApiError(403, "Staff members cannot assign responsibility to other staff");
    }
  }

  const goal = await Goal.create({
    name,
    description,
    startDate,
    deadline,
    ownerId,
    ownerStaffId,
    responsibleId,
    responsibleStaffId,
    status,
    priority,
  });

  const populatedGoal = await goal.populate([
    { path: "ownerId", select: "name email role" },
    { path: "ownerStaffId", select: "name email role" },
    { path: "responsibleId", select: "name email role" },
    { path: "responsibleStaffId", select: "name email role" },
  ]);

  res.status(201).json({
    success: true,
    data: populatedGoal,
  });
});

// Update a goal
const updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, startDate, deadline, ownerId, ownerStaffId, responsibleId, responsibleStaffId, status, priority } =
    req.body;

  const goal = await Goal.findById(id);
  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isGoalAccessible(goal, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to update this goal");
  }

  // Authorization check: ensure user can only update ownership to themselves or their staff
  if (req.user.role === "admin") {
    const adminStaffIdsAsStrings = await getAdminStaffIdsAsStrings(req.user);
    if (ownerId !== undefined && ownerId && ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only assign goal ownership to yourself or your staff");
    }
    if (ownerStaffId !== undefined && ownerStaffId && !adminStaffIdsAsStrings.includes(ownerStaffId.toString())) {
      throw new ApiError(403, "You can only assign goals to your staff members");
    }
    if (responsibleId !== undefined && responsibleId && responsibleId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only assign responsibility to yourself or your staff");
    }
    if (responsibleStaffId !== undefined && responsibleStaffId && !adminStaffIdsAsStrings.includes(responsibleStaffId.toString())) {
      throw new ApiError(403, "You can only assign responsibility to your staff members");
    }
  }

  // Check for date validity
  const newStartDate = startDate ? new Date(startDate) : goal.startDate;
  const newDeadline = deadline ? new Date(deadline) : goal.deadline;

  if (newStartDate >= newDeadline) {
    throw new ApiError(400, "Start date must be before deadline");
  }

  // Update fields
  if (name) goal.name = name;
  if (description !== undefined) goal.description = description;
  if (startDate) goal.startDate = startDate;
  if (deadline) goal.deadline = deadline;
  if (ownerId !== undefined) {
    goal.ownerId = ownerId;
  }
  if (ownerStaffId !== undefined) {
    goal.ownerStaffId = ownerStaffId;
  }
  if (responsibleId !== undefined) {
    goal.responsibleId = responsibleId;
  }
  if (responsibleStaffId !== undefined) {
    goal.responsibleStaffId = responsibleStaffId;
  }
  if (status) goal.status = status;
  if (priority) goal.priority = priority;

  const updatedGoal = await goal.save();
  const populatedGoal = await updatedGoal.populate([
    { path: "ownerId", select: "name email role" },
    { path: "ownerStaffId", select: "name email role" },
    { path: "responsibleId", select: "name email role" },
    { path: "responsibleStaffId", select: "name email role" },
  ]);

  res.status(200).json({
    success: true,
    data: populatedGoal,
  });
});

// Delete a goal and cascade delete actions and tasks
const deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const goal = await Goal.findById(id);
  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isGoalAccessible(goal, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to delete this goal");
  }

  // Find and delete all actions associated with this goal
  const actions = await Action.find({ goalId: id });
  const actionIds = actions.map((a) => a._id);

  // Delete all tasks associated with these actions
  if (actionIds.length > 0) {
    await Task.deleteMany({ actionId: { $in: actionIds } });
  }

  // Delete all actions
  if (actionIds.length > 0) {
    await Action.deleteMany({ goalId: id });
  }

  // Delete the goal
  await Goal.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Goal and associated data deleted successfully",
  });
});

module.exports = {
  fetchGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
};
