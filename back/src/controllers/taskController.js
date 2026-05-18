const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const { getAdminStaffIds, isTaskAccessible, toStringId } = require("../utils/accessUtils");

function applyNumericCompletion(task, body = {}) {
  if (
    task.taskType !== "numeric" ||
    task.targetValue == null ||
    task.targetValue <= 0
  ) {
    return;
  }
  if (body.status === "todo" || body.status === "in_progress") {
    return;
  }
  const current = task.currentValue ?? 0;
  if (current >= task.targetValue) {
    task.status = "completed";
    if (!task.completedAt) {
      task.completedAt = new Date();
    }
  }
}

// Fetch all tasks with optional filters
const fetchTasks = asyncHandler(async (req, res) => {
  const { actionId, status, priority } = req.query;

  const query = {};

  // Only allow filtering by actionId, status, and priority - NOT by assignment
  if (actionId) query.actionId = actionId;
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const adminStaffIds = await getAdminStaffIds(req.user);
  
  console.log(`🔐 fetchTasks - User ID: ${req.user._id}, Role: ${req.user.role}`);
  console.log(`📋 Admin Staff IDs: ${adminStaffIds.map(id => id.toString()).join(", ")}`);

  if (req.user.role === "admin") {
    query.$or = [
      { assignedUserId: req.user._id },
      { assignedStaffId: { $in: adminStaffIds } },
    ];
  } else {
    query.$or = [
      { assignedUserId: req.user._id },
      { assignedStaffId: req.user._id },
    ];
  }

  const tasks = await Task.find(query)
    .populate("actionId", "name")
    .populate("assignedUserId", "name email role")
    .populate("assignedStaffId", "name email role")
    .sort({ order: 1, createdAt: -1 })
    .exec();

  console.log(`📊 Found ${tasks.length} tasks for user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: tasks.map(t => t.toJSON ? t.toJSON() : t),
  });
});

// Fetch a single task by ID
const fetchTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
    .populate("actionId", "name")
    .populate("assignedUserId", "name email role")
    .populate("assignedStaffId", "name email role")
    .exec();

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isTaskAccessible(task, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to access this task");
  }

  res.status(200).json({
    success: true,
    data: task.toJSON ? task.toJSON() : task,
  });
});

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const {
    actionId,
    name,
    description,
    startDate,
    deadline,
    assignedUserId,
    assignedStaffId,

    status,
    priority,
    notes,
    order,
    taskType,
    targetValue,
    targetType,
    currentValue,
  } = req.body;

  const type = taskType === "numeric" ? "numeric" : "checkbox";

  // Validation
  if (!actionId || !name || !startDate || !deadline) {
    throw new ApiError(
      400,
      "actionId, name, startDate, and deadline are required"
    );
  }

  if (type === "numeric") {
    const tv =
      typeof targetValue === "number" ? targetValue : Number(targetValue);
    if (!Number.isFinite(tv) || tv < 1) {
      throw new ApiError(400, "Numeric tasks require a target value of at least 1");
    }
    const tt = typeof targetType === "string" ? targetType.trim() : "";
    if (!tt) {
      throw new ApiError(
        400,
        "Numeric tasks require a target type (what you are counting, e.g. calls)"
      );
    }
  }

  if (new Date(startDate) >= new Date(deadline)) {
    throw new ApiError(400, "Start date must be before deadline");
  }

  // Authorization check: ensure user can only assign tasks to themselves or their staff
  const adminStaffIds = await getAdminStaffIds(req.user);
  
  if (req.user.role === "admin") {
    // Admin can only assign tasks to themselves or their staff
    if (assignedUserId && assignedUserId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only assign tasks to yourself or your staff");
    }
    if (assignedStaffId && !adminStaffIds.includes(assignedStaffId.toString())) {
      throw new ApiError(403, "You can only assign tasks to your staff members");
    }
  } else {
    // Staff can only create tasks for themselves
    if (assignedUserId && assignedUserId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only create tasks for yourself");
    }
    if (assignedStaffId) {
      throw new ApiError(403, "Staff members cannot assign tasks to other staff");
    }
  }

  // Calculate order if not provided
  let taskOrder = order;
  if (taskOrder === undefined) {
    const lastTask = await Task.findOne({ actionId }).sort({ order: -1 });
    taskOrder = lastTask ? (lastTask.order || 0) + 1 : 0;
  }

  const numericPayload =
    type === "numeric"
      ? {
          taskType: "numeric",
          targetValue:
            typeof targetValue === "number"
              ? targetValue
              : Number(targetValue),
          targetType: String(targetType).trim(),
          currentValue: (() => {
            const c =
              currentValue === undefined || currentValue === null
                ? 0
                : typeof currentValue === "number"
                  ? currentValue
                  : Number(currentValue);
            const cv = Number.isFinite(c) && c >= 0 ? c : 0;
            const tv = typeof targetValue === "number" ? targetValue : Number(targetValue);
            // Ensure currentValue doesn't exceed targetValue
            return cv > tv ? tv : cv;
          })(),
        }
      : {
          taskType: "checkbox",
          targetValue: null,
          targetType: null,
          currentValue: null,
        };

  const task = await Task.create({
    actionId,
    name,
    description,
    startDate,
    deadline,
    assignedUserId,
    assignedStaffId,
 
    status,
    priority,
    notes,
    order: taskOrder,
    ...numericPayload,
  });

  applyNumericCompletion(task, req.body);
  await task.save();

  const populatedTask = await task.populate([
    { path: "actionId", select: "name" },
    { path: "assignedUserId", select: "name email role" },
    { path: "assignedStaffId", select: "name email role" },
  ]);

  res.status(201).json({
    success: true,
    data: populatedTask.toJSON ? populatedTask.toJSON() : populatedTask,
  });
});

// Update a task
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    actionId,
    name,
    description,
    startDate,
    deadline,
    assignedUserId,
    assignedStaffId,

    status,
    priority,
    notes,
    order,
    completedAt,
    taskType,
    targetValue,
    targetType,
    currentValue,
  } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isTaskAccessible(task, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to update this task");
  }

  // Authorization check: ensure user can only assign tasks to themselves or their staff
  if (req.user.role === "admin") {
    if (assignedUserId !== undefined && assignedUserId && assignedUserId !== req.user._id.toString()) {
      throw new ApiError(403, "You can only assign tasks to yourself or your staff");
    }
    if (assignedStaffId !== undefined && assignedStaffId && !adminStaffIds.includes(assignedStaffId.toString())) {
      throw new ApiError(403, "You can only assign tasks to your staff members");
    }
  }

  // Check for date validity
  const newStartDate = startDate ? new Date(startDate) : task.startDate;
  const newDeadline = deadline ? new Date(deadline) : task.deadline;

  if (newStartDate >= newDeadline) {
    throw new ApiError(400, "Start date must be before deadline");
  }

  // Update fields
  if (actionId) task.actionId = actionId;
  if (name) task.name = name;
  if (description !== undefined) task.description = description;
  if (startDate) task.startDate = startDate;
  if (deadline) task.deadline = deadline;
  if (assignedUserId !== undefined) task.assignedUserId = assignedUserId;
  if (assignedStaffId !== undefined) task.assignedStaffId = assignedStaffId;
  if (status) {
    task.status = status;
    // Auto-set completedAt when status becomes "completed"
    if (status === "completed" && !task.completedAt) {
      task.completedAt = new Date();
    }
  }
  if (priority) task.priority = priority;
  if (notes !== undefined) task.notes = notes;
  if (order !== undefined) task.order = order;
  if (completedAt !== undefined) task.completedAt = completedAt;

  if (taskType !== undefined) {
    const nextType = taskType === "numeric" ? "numeric" : "checkbox";
    task.taskType = nextType;
    if (nextType === "checkbox") {
      task.targetValue = null;
      task.targetType = null;
      task.currentValue = null;
    }
  }
  if (task.taskType === "numeric") {
    if (targetValue !== undefined) {
      const tv =
        typeof targetValue === "number" ? targetValue : Number(targetValue);
      if (!Number.isFinite(tv) || tv < 1) {
        throw new ApiError(400, "Target value must be a number of at least 1");
      }
      task.targetValue = tv;
    }
    if (targetType !== undefined) {
      const tt = typeof targetType === "string" ? targetType.trim() : "";
      if (!tt) {
        throw new ApiError(400, "Target type cannot be empty for numeric tasks");
      }
      task.targetType = tt;
    }
    if (currentValue !== undefined) {
      const c =
        typeof currentValue === "number" ? currentValue : Number(currentValue);
      if (!Number.isFinite(c) || c < 0) {
        throw new ApiError(400, "Current value must be a non-negative number");
      }
      const targetVal = task.targetValue ?? (targetValue !== undefined ? targetValue : null);
      if (targetVal != null && c > targetVal) {
        throw new ApiError(400, `Current value cannot exceed target value of ${targetVal}`);
      }
      task.currentValue = c;
    }
  }

  if (
    task.taskType === "numeric" &&
    (task.targetValue == null ||
      !Number.isFinite(task.targetValue) ||
      task.targetValue < 1 ||
      !task.targetType ||
      !String(task.targetType).trim())
  ) {
    throw new ApiError(
      400,
      "Numeric tasks must have a target value (≥ 1) and a non-empty target type"
    );
  }

  applyNumericCompletion(task, req.body);

  const updatedTask = await task.save();
  const populatedTask = await updatedTask.populate([
    { path: "actionId", select: "name" },
    { path: "assignedUserId", select: "name email role" },
    { path: "assignedStaffId", select: "name email role" },
  ]);

  res.status(200).json({
    success: true,
    data: populatedTask.toJSON ? populatedTask.toJSON() : populatedTask,
  });
});

// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isTaskAccessible(task, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to delete this task");
  }

  await Task.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

// Reorder tasks within an action
const reorderTasks = asyncHandler(async (req, res) => {
  const { actionId, taskIds } = req.body;

  if (!actionId || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new ApiError(400, "actionId and taskIds array are required");
  }

  // Update order for each task
  const updatePromises = taskIds.map((taskId, index) =>
    Task.findByIdAndUpdate(
      taskId,
      { order: index },
      { new: true }
    )
  );

  const updatedTasks = await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    data: updatedTasks,
  });
});

// Update numeric task progress
const updateNumericProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentValue, operation } = req.body;

  const task = await Task.findById(id).populate([
    { path: "actionId", select: "name" },
    { path: "assignedUserId", select: "name email" },
    { path: "assignedStaffId", select: "name email" },
  ]);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.taskType !== "numeric") {
    throw new ApiError(400, "This task is not a numeric task");
  }

  // Permission check: only admin, assigned user, or assigned staff can update
  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isTaskAccessible(task, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to update this task");
  }

  let newValue = task.currentValue ?? 0;

  if (operation === "increment") {
    newValue += 1;
  } else if (operation === "decrement") {
    newValue = Math.max(0, newValue - 1);
  } else if (operation === "set" && typeof currentValue === "number") {
    newValue = Math.max(0, Math.floor(currentValue));
  } else {
    throw new ApiError(400, "Invalid operation. Use 'increment', 'decrement', or 'set'");
  }

  // Prevent exceeding target value
  if (task.targetValue != null && newValue > task.targetValue) {
    throw new ApiError(400, `Value cannot exceed target of ${task.targetValue}`);
  }

  // Auto-complete if target reached
  const updatePayload = {
    currentValue: newValue,
  };

  if (task.targetValue && newValue >= task.targetValue && task.status !== "completed") {
    updatePayload.status = "completed";
    updatePayload.completedAt = new Date();
  }

  const updatedTask = await Task.findByIdAndUpdate(id, updatePayload, { new: true }).populate([
    { path: "actionId", select: "name" },
    { path: "assignedUserId", select: "name email" },
    { path: "assignedStaffId", select: "name email" },
  ]);

  res.status(200).json({
    success: true,
    data: updatedTask.toJSON ? updatedTask.toJSON() : updatedTask,
  });
});

// Add an update to a task
const addTaskUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedUserId, assignedStaffId, notes, actionText, voiceNoteUrl, createdAt } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const adminStaffIds = await getAdminStaffIds(req.user);
  if (!isTaskAccessible(task, req.user, adminStaffIds)) {
    throw new ApiError(403, "You don't have permission to update this task");
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

  task.updates.push(updatePayload);

  const updatedTask = await task.save();
  const populatedTask = await updatedTask.populate([
    { path: "actionId", select: "name" },
    { path: "assignedUserId", select: "name email role" },
    { path: "assignedStaffId", select: "name email role" },
    { path: "updates.assignedUserId", select: "name email role" },
    { path: "updates.assignedStaffId", select: "name email role" },
  ]);

  res.status(201).json({
    success: true,
    data: populatedTask.toJSON ? populatedTask.toJSON() : populatedTask,
  });
});

module.exports = {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  updateNumericProgress,
  addTaskUpdate,
};
