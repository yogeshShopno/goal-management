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

const getScopedAdminId = (user) => {
  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return user._id;
  }

  return user.adminId || null;
};

const getScopedStaffIds = async (user) => {
  const adminId = getScopedAdminId(user);
  if (!adminId) {
    return [];
  }

  const staffDocs = await Staff.find({ adminId }).select("_id").lean();
  return staffDocs.map((staff) => staff._id);
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

const includesId = (ids = [], id) =>
  ids.some((candidate) => isMatchingId(candidate, id));

const buildUserAssignmentQuery = (user, staffIds = []) => {
  if (user.role === "admin") {
    return {
      $or: [
        { ownerId: user._id },
        { responsibleId: user._id },
        { ownerStaffId: { $in: staffIds } },
        { responsibleStaffId: { $in: staffIds } },
      ],
    };
  }

  return {
    $or: [
      { ownerId: user._id },
      { ownerStaffId: user._id },
      { responsibleId: user._id },
      { responsibleStaffId: user._id },
    ],
  };
};

const buildAdminScopeGoalQuery = (user, staffIds = []) => {
  const adminId = getScopedAdminId(user);
  if (!adminId) {
    return buildUserAssignmentQuery(user, staffIds);
  }

  return {
    $or: [
      { adminId },
      { ownerId: adminId },
      { responsibleId: adminId },
      { ownerStaffId: { $in: staffIds } },
      { responsibleStaffId: { $in: staffIds } },
    ],
  };
};

const buildGoalCreatorScopeQuery = (user) => {
  const adminId = getScopedAdminId(user);
  if (!adminId) {
    return buildUserAssignmentQuery(user);
  }

  return {
    $or: [{ adminId }, { ownerId: adminId }, { responsibleId: adminId }],
  };
};

const buildAdminScopeAccessQuery = async (user) => {
  const staffIds = await getScopedStaffIds(user);
  return buildAdminScopeGoalQuery(user, staffIds);
};

const buildGoalAccessQuery = async (user) => {
  const staffIds = await getScopedStaffIds(user);
  const assignmentQuery = buildUserAssignmentQuery(user, staffIds);

  if (user.role === "admin") {
    return assignmentQuery;
  }

  return {
    $and: [assignmentQuery, buildGoalCreatorScopeQuery(user)],
  };
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
      includesId(adminStaffIds, goal.ownerStaffId)
    ) {
      return true;
    }

    if (
      goal.responsibleStaffId &&
      includesId(adminStaffIds, goal.responsibleStaffId)
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
      includesId(adminStaffIds, action.ownerStaffId)
    ) {
      return true;
    }

    if (
      action.assignedStaffIds?.some((id) =>
        includesId(adminStaffIds, id)
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
      includesId(adminStaffIds, task.assignedStaffId)
    ) {
      return true;
    }
  }

  return false;
};

module.exports = {
  getAdminStaffIds,
  getAdminStaffIdsAsStrings,
  getScopedAdminId,
  getScopedStaffIds,
  buildAdminScopeAccessQuery,
  buildGoalAccessQuery,
  buildGoalCreatorScopeQuery,
  isGoalAccessible,
  isActionAccessible,
  isTaskAccessible,
  includesId,
  toStringId,
  toObjectId,
};
