const Action = require("../models/Action");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Fetch all actions with optional filters
const fetchActions = asyncHandler(async (req, res) => {
  const { goalId, status, priority, ownerId } = req.query;

  const query = {};

  if (goalId) query.goalId = goalId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (ownerId) query.ownerId = ownerId;

  const actions = await Action.find(query)
    .populate("goalId", "name")
    .populate("ownerId", "name email role")
    .populate("ownerStaffId", "name email role")
    .populate("assignedUserIds", "name email role")
    .populate("assignedStaffIds", "name email role")
    .sort({ createdAt: -1 })
    .exec();

  res.status(200).json({
    success: true,
    data: actions.map(a => a.toJSON ? a.toJSON() : a),
  });
});

// Fetch a single action by ID
const fetchActionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const action = await Action.findById(id)
    .populate("goalId", "name")
    .populate("ownerId", "name email role")
    .populate("ownerStaffId", "name email role")
    .populate("assignedUserIds", "name email role")
    .populate("assignedStaffIds", "name email role")
    .exec();

  if (!action) {
    throw new ApiError(404, "Action not found");
  }

  res.status(200).json({
    success: true,
    data: action.toJSON ? action.toJSON() : action,
  });
});

// Create a new action
const createAction = asyncHandler(async (req, res) => {
  const { goalId, name, description, startDate, deadline, ownerId, ownerStaffId, assignedUserIds, assignedStaffIds, status, priority } =
    req.body;

  // Validation
  if (!goalId || !name || !startDate || !deadline || (!ownerId && !ownerStaffId)) {
    throw new ApiError(
      400,
      "goalId, name, startDate, deadline, and ownerId/ownerStaffId are required"
    );
  }

  if (new Date(startDate) >= new Date(deadline)) {
    throw new ApiError(400, "Start date must be before deadline");
  }

  const action = await Action.create({
    goalId,
    name,
    description,
    startDate,
    deadline,
    ownerId,
    ownerStaffId,
    assignedUserIds: assignedUserIds || [],
    assignedStaffIds: assignedStaffIds || [],
    status,
    priority,
  });

  const populatedAction = await action.populate([
    { path: "goalId", select: "name" },
    { path: "ownerId", select: "name email role" },
    { path: "ownerStaffId", select: "name email role" },
    { path: "assignedUserIds", select: "name email role" },
    { path: "assignedStaffIds", select: "name email role" },
  ]);

  res.status(201).json({
    success: true,
    data: populatedAction.toJSON ? populatedAction.toJSON() : populatedAction,
  });
});

// Update an action
const updateAction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { goalId, name, description, startDate, deadline, ownerId, ownerStaffId, assignedUserIds, assignedStaffIds, status, priority } =
    req.body;

  const action = await Action.findById(id);
  if (!action) {
    throw new ApiError(404, "Action not found");
  }

  // Check for date validity
  const newStartDate = startDate ? new Date(startDate) : action.startDate;
  const newDeadline = deadline ? new Date(deadline) : action.deadline;

  if (newStartDate >= newDeadline) {
    throw new ApiError(400, "Start date must be before deadline");
  }

  // Update fields (use !== undefined to allow falsy but defined values)
  if (goalId !== undefined) action.goalId = goalId;
  if (name !== undefined) action.name = name;
  if (description !== undefined) action.description = description;
  if (startDate !== undefined) action.startDate = startDate;
  if (deadline !== undefined) action.deadline = deadline;
  if (ownerId !== undefined) action.ownerId = ownerId;
  if (ownerStaffId !== undefined) action.ownerStaffId = ownerStaffId;
  if (assignedUserIds !== undefined) action.assignedUserIds = assignedUserIds;
  if (assignedStaffIds !== undefined) action.assignedStaffIds = assignedStaffIds;
  if (status !== undefined) action.status = status;
  if (priority !== undefined) action.priority = priority;

  const updatedAction = await action.save();
  const populatedAction = await updatedAction.populate([
    { path: "goalId", select: "name" },
    { path: "ownerId", select: "name email role" },
    { path: "ownerStaffId", select: "name email role" },
    { path: "assignedUserIds", select: "name email role" },
    { path: "assignedStaffIds", select: "name email role" },
  ]);

  res.status(200).json({
    success: true,
    data: populatedAction.toJSON ? populatedAction.toJSON() : populatedAction,
  });
});

// Delete an action and cascade delete associated tasks
const deleteAction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const action = await Action.findById(id);
  if (!action) {
    throw new ApiError(404, "Action not found");
  }

  // Delete all tasks associated with this action
  await Task.deleteMany({ actionId: id });

  // Delete the action
  await Action.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Action and associated tasks deleted successfully",
  });
});

// Add an update to an action
const addActionUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedUserId, assignedStaffId, notes, actionText } = req.body;

  const action = await Action.findById(id);
  if (!action) {
    throw new ApiError(404, "Action not found");
  }

  action.updates.push({
    assignedUserId,
    assignedStaffId,
    notes,
    actionText,
  });

  const updatedAction = await action.save();
  const populatedAction = await updatedAction.populate([
    { path: "goalId", select: "name" },
    { path: "ownerId", select: "name email role" },
    { path: "ownerStaffId", select: "name email role" },
    { path: "assignedUserIds", select: "name email role" },
    { path: "assignedStaffIds", select: "name email role" },
    { path: "updates.assignedUserId", select: "name email role" },
    { path: "updates.assignedStaffId", select: "name email role" },
  ]);

  res.status(201).json({
    success: true,
    data: populatedAction.toJSON ? populatedAction.toJSON() : populatedAction,
  });
});

module.exports = {
  fetchActions,
  fetchActionById,
  createAction,
  updateAction,
  deleteAction,
  addActionUpdate,
};
