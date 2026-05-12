import { ROLES } from '../constants';

export function isAdminRole(role) {
  return role === ROLES.ADMIN;
}

export function canManageGoal(role) {
  return isAdminRole(role);
}
