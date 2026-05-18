const Action = require("../models/Action");
const Task = require("../models/Task");
const Goal = require("../models/Goal");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const {
  buildGoalAccessQuery,
  buildGoalCreatorScopeQuery,
  getAdminStaffIds,
  getAdminStaffIdsAsStrings,
  isActionAccessible,
  toStringId,
} = require("../utils/accessUtils");

const combineQueries = (...queries) => {
  const activeQueries = queries.filter((query) => Object.keys(query).length > 0);
  if (activeQueries.length === 0) return {};
  if (activeQueries.length === 1) return activeQueries[0];
  return { $and: activeQueries };
};

// Fetch all actions with optional filters
const fetchActions = asyncHandler(async (req, res) => {
  const { goalId, status, priority } = req.query;

  const query = {};

  // Only allow filtering by goalId, status, and priority - NOT by ownership
  if (goalId) query.goalId = goalId;
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const adminStaffIds = await getAdminStaffIds(req.user);
  
  console.log(`🔐 fetchActions - User ID: ${req.user._id}, Role: ${req.user.role}`);
  console.log(`📋 Admin Staff IDs: ${adminStaffIds.map(id => id.toString()).join(", ")}`);

  if (req.user.role === "admin") {
    query.$or = [
      { ownerId: req.user._id },
      { ownerStaffId: { $in: adminStaffIds } },
      { assignedUserIds: req.user._id },
      { assignedStaffIds: { $in: adminStaffIds } },
    ];
  } else {
    query.$or = [
      { ownerId: req.user._id },
      { ownerStaffId: req.user._id },
      { assignedUserIds: req.user._id },
      { assignedStaffIds: req.user._id },
    ];
  }

  const allowedGoals = await Goal.find(await buildGoalCreatorScopeQuery(req.user))
    .select("_id")
    .lean();
  const allowedGoalIds = allowedGoals.map((goal) => goal._id);
  const scopedQuery = combineQueries(query, { goalId: { $in: allowedGoalIds } });

  const actions = await Action.find(scopedQuery)
    .populate("goalId", "name")
    .populate("ownerId", "name email role")
    .populate("ownerStaffId", "name email role")
    .populate("assignedUserIds", "name email role")
    .populate("assignedStaffIds", "name email role")
    .sort({ createdAt: -1 })
    .exec();

  console.log(`📊 Found ${actions.length} actions for user ${req.user._id}`);

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

  const scopedGoal = await Goal.exists(
    combineQueries(
      { _id: action.goalId?._id || action.goalId },
      await buildGoalCreatorScopeQuery(req.user)
    )
  );
  if (!scopedGoal) {
    throw new ApiError(403, "You don't have permission to access this action");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isActionAccessible(action, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to access this action");
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

  const scopedGoal = await Goal.exists(
    combineQueries({ _id: goalId }, await buildGoalAccessQuery(req.user))
  );
  if (!scopedGoal) {
    throw new ApiError(403, "You can only create actions inside goals you can access");
  }

  // Authorization check: ensure user can only create actions for themselves or their staff
  const adminStaffIdsAsStrings = await getAdminStaffIdsAsStrings(req.user);
  
  if (req.user.role === "admin") {
    // Admin can only assign action to themselves or their staff
    if (ownerId && ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only create actions for yourself or your staff");
    }
    if (ownerStaffId && !adminStaffIdsAsStrings.includes(ownerStaffId.toString())) {
      throw new ApiError(403, "You can only assign actions to your staff members");
    }
    // Validate assigned users are either themselves or their staff
    if (assignedUserIds && assignedUserIds.length > 0) {
      for (const userId of assignedUserIds) {
        if (userId !== req.user._id.toString()) {
          throw new ApiError(403, "You can only assign actions to yourself or your staff");
        }
      }
    }
    if (assignedStaffIds && assignedStaffIds.length > 0) {
      for (const staffId of assignedStaffIds) {
        if (!adminStaffIdsAsStrings.includes(staffId.toString())) {
          throw new ApiError(403, "You can only assign actions to your staff members");
        }
      }
    }
  } else {
    // Staff can only create actions for themselves
    if (ownerId && ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only create actions for yourself");
    }
    if (ownerStaffId) {
      throw new ApiError(403, "Staff members cannot create actions as other staff");
    }
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

  const currentScopedGoal = await Goal.exists(
    combineQueries({ _id: action.goalId }, await buildGoalCreatorScopeQuery(req.user))
  );
  if (!currentScopedGoal) {
    throw new ApiError(403, "You don't have permission to update this action");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isActionAccessible(action, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to update this action");
  }

  if (goalId !== undefined) {
    const nextScopedGoal = await Goal.exists(
      combineQueries({ _id: goalId }, await buildGoalAccessQuery(req.user))
    );
    if (!nextScopedGoal) {
      throw new ApiError(403, "You can only move actions into goals you can access");
    }
  }

  // Authorization check: ensure user can only update ownership to themselves or their staff
  if (req.user.role === "admin") {
    const adminStaffIdsAsStrings = await getAdminStaffIdsAsStrings(req.user);
    if (ownerId !== undefined && ownerId && ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only assign action ownership to yourself or your staff");
    }
    if (ownerStaffId !== undefined && ownerStaffId && !adminStaffIdsAsStrings.includes(ownerStaffId.toString())) {
      throw new ApiError(403, "You can only assign actions to your staff members");
    }
    // Validate assigned users
    if (assignedUserIds !== undefined && assignedUserIds && assignedUserIds.length > 0) {
      for (const userId of assignedUserIds) {
        if (userId !== req.user._id.toString()) {
          throw new ApiError(403, "You can only assign actions to yourself or your staff");
        }
      }
    }
    if (assignedStaffIds !== undefined && assignedStaffIds && assignedStaffIds.length > 0) {
      for (const staffId of assignedStaffIds) {
        if (!adminStaffIdsAsStrings.includes(staffId.toString())) {
          throw new ApiError(403, "You can only assign actions to your staff members");
        }
      }
    }
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

  const scopedGoal = await Goal.exists(
    combineQueries({ _id: action.goalId }, await buildGoalCreatorScopeQuery(req.user))
  );
  if (!scopedGoal) {
    throw new ApiError(403, "You don't have permission to delete this action");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isActionAccessible(action, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to delete this action");
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
  const { assignedUserId, assignedStaffId, notes, actionText, voiceNoteUrl, createdAt } = req.body;

  const action = await Action.findById(id);
  if (!action) {
    throw new ApiError(404, "Action not found");
  }

  const scopedGoal = await Goal.exists(
    combineQueries({ _id: action.goalId }, await buildGoalCreatorScopeQuery(req.user))
  );
  if (!scopedGoal) {
    throw new ApiError(403, "You don't have permission to update this action");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isActionAccessible(action, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to update this action");
  }

  const updatePayload = {
    assignedUserId,
    assignedStaffId,
    notes,
    actionText,
    voiceNoteUrl,
  };

  if (createdAt) {
    updatePayload.createdAt = new Date(createdAt);
  }

  action.updates.push(updatePayload);

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
