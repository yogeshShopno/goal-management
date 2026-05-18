const Staff = require("../models/Staff");
const mongoose = require("mongoose");

const toStringId = (id) => (id == null ? "" : id.toString());

const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

const getAdminStaffIds = async (user) => {
  if (!user || user.role !== "admin") {
    return [];
  }

  const staffDocs = await Staff.find({ adminId: user._id }).select("_id").lean();
  return staffDocs.map((staff) => staff._id); // Return ObjectIds directly
};

// Helper function that returns string IDs for string-based comparisons
const getAdminStaffIdsAsStrings = async (user) => {
  if (!user || user.role !== "admin") {
    return [];
  }

  const staffDocs = await Staff.find({ adminId: user._id }).select("_id").lean();
  return staffDocs.map((staff) => toStringId(staff._id));
};

const isMatchingId = (value, id) => {
  if (!value || !id) {
    return false;
  }
  return toStringId(value) === toStringId(id);
};

const isGoalAccessible = (goal, user, adminStaffIds = []) => {
  const userId = toStringId(user._id);
  if (
    isMatchingId(goal.ownerId, userId) ||
    isMatchingId(goal.ownerStaffId, userId) ||
    isMatchingId(goal.responsibleId, userId) ||
    isMatchingId(goal.responsibleStaffId, userId)
  ) {
    return true;
  }

  if (user.role === "admin") {
    if (
      goal.ownerStaffId &&
      adminStaffIds.includes(toStringId(goal.ownerStaffId))
    ) {
      return true;
    }

    if (
      goal.responsibleStaffId &&
      adminStaffIds.includes(toStringId(goal.responsibleStaffId))
    ) {
      return true;
    }
  }

  return false;
};

const isActionAccessible = (action, user, adminStaffIds = []) => {
  const userId = toStringId(user._id);
  if (
    isMatchingId(action.ownerId, userId) ||
    isMatchingId(action.ownerStaffId, userId) ||
    action.assignedUserIds?.some((id) => isMatchingId(id, userId)) ||
    action.assignedStaffIds?.some((id) => isMatchingId(id, userId))
  ) {
    return true;
  }

  if (user.role === "admin") {
    if (
      action.ownerStaffId &&
      adminStaffIds.includes(toStringId(action.ownerStaffId))
    ) {
      return true;
    }

    if (
      action.assignedStaffIds?.some((id) =>
        adminStaffIds.includes(toStringId(id))
      )
    ) {
      return true;
    }
  }

  return false;
};

const isTaskAccessible = (task, user, adminStaffIds = []) => {
  const userId = toStringId(user._id);
  if (
    isMatchingId(task.assignedUserId, userId) ||
    isMatchingId(task.assignedStaffId, userId)
  ) {
    return true;
  }

  if (user.role === "admin") {
    if (
      task.assignedStaffId &&
      adminStaffIds.includes(toStringId(task.assignedStaffId))
    ) {
      return true;
    }
  }

  return false;
};

module.exports = {
  getAdminStaffIds,
  getAdminStaffIdsAsStrings,
  isGoalAccessible,
  isActionAccessible,
  isTaskAccessible,
  toStringId,
  toObjectId,
};
