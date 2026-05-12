export const ROLES = { ADMIN: 'admin', USER: 'user' };
export const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
};
export const ACTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};
export const DEADLINE_STATUS = {
  ON_TRACK: 'on_track',
  NEAR: 'near',
  DUE_TODAY: 'due_today',
  OVERDUE: 'overdue',
};
export const FILTERS = ['all', 'due_today', 'upcoming', 'completed', 'overdue', 'high_priority'];
export const SORT_OPTIONS = ['deadline', 'priority', 'progress', 'recently_updated'];
