const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  MANAGER: "manager",
  USER: "user",
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "manage_users",
    "view_users",
    "manage_staff",
    "view_staff",
    "view_profile",
    "edit_profile",
    "manage_goals",
    "view_goals",
    "manage_tasks",
    "view_tasks",
    "manage_actions",
    "view_actions",
  ],
  [ROLES.STAFF]: [
    "view_profile",
    "edit_profile",
    "view_goals",
    "manage_goals",
    "view_tasks",
    "manage_tasks",
    "view_actions",
    "manage_actions",
  ],
  [ROLES.MANAGER]: [
    "view_users",
    "view_profile",
    "edit_profile",
    "view_goals",
    "manage_goals",
    "view_tasks",
    "manage_tasks",
    "view_actions",
    "manage_actions",
  ],
  [ROLES.USER]: [
    "view_profile",
    "edit_profile",
    "view_goals",
    "manage_goals",
    "view_tasks",
    "manage_tasks",
    "view_actions",
    "manage_actions",
  ],
};

const getPermissionsByRole = (role) => ROLE_PERMISSIONS[role] || [];

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  getPermissionsByRole,
};
