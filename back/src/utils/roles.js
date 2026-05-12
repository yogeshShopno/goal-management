const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "manage_users",
    "view_users",
    "view_profile",
    "edit_profile",
  ],
  [ROLES.MANAGER]: ["view_users", "view_profile", "edit_profile"],
  [ROLES.USER]: ["view_profile", "edit_profile"],
};

const getPermissionsByRole = (role) => ROLE_PERMISSIONS[role] || [];

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  getPermissionsByRole,
};
