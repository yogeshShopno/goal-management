/**
 * task.status === 'completed' counts as done.
 * action progress = completedTasks / totalTasks * 100
 * goal progress = completedActions / totalActions * 100
 * An action is "completed" when its progress === 100.
 */
export function calcTaskProgress(tasks = []) {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((done / tasks.length) * 100);
}

export function calcActionProgress(action, tasks = []) {
  const actionTasks = tasks.filter((t) => t.actionId === action.id);
  return calcTaskProgress(actionTasks);
}

export function calcGoalProgress(goal, actions = [], tasks = []) {
  const goalActions = actions.filter((a) => a.goalId === goal.id);
  if (!goalActions.length) return 0;
  const completedActions = goalActions.filter((a) => calcActionProgress(a, tasks) === 100).length;
  return Math.round((completedActions / goalActions.length) * 100);
}
