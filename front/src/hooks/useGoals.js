import { useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { calcGoalProgress } from '../utils/progressCalculator';
import { getDeadlineStatus } from '../utils/deadlineUtils';
import { DEADLINE_STATUS, PRIORITY } from '../constants';
import { differenceInDays, isToday, parseISO } from 'date-fns';

const PRIORITY_RANK = { [PRIORITY.HIGH]: 0, [PRIORITY.MEDIUM]: 1, [PRIORITY.LOW]: 2 };

export function filterGoalsByMainFilter(goals, actions, tasks, filter) {
  return goals.filter((g) => {
    const progress = calcGoalProgress(g, actions, tasks);
    if (!g.deadline && filter !== 'all' && filter !== 'high_priority') return false;
    switch (filter) {
      case 'due_today':
        return isToday(parseISO(g.deadline)) && progress < 100;
      case 'upcoming': {
        const d = parseISO(g.deadline);
        return (
          differenceInDays(d, new Date()) > 0 &&
          g.status !== 'completed' &&
          progress < 100
        );
      }
      case 'overdue':
        return getDeadlineStatus(g.deadline) === DEADLINE_STATUS.OVERDUE && progress < 100;
      case 'completed':
        return progress === 100;
      case 'high_priority':
        return g.priority === PRIORITY.HIGH;
      default:
        return true;
    }
  });
}

export function sortGoalsList(goals, actions, tasks, sort) {
  const copy = [...goals];
  copy.sort((a, b) => {
    switch (sort) {
      case 'priority': {
        return (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
      }
      case 'progress': {
        return (
          calcGoalProgress(a, actions, tasks) - calcGoalProgress(b, actions, tasks)
        );
      }
      case 'recently_updated': {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      case 'deadline':
      default: {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
      }
    }
  });
  return copy;
}

export function filterGoalsForUser(goals, currentUser) {
  return goals.filter((g) => {
    const rid = g.responsibleId?.id || g.responsibleId;
    const oid = g.ownerId?.id || g.ownerId;
    const rsid = g.responsibleStaffId?.id || g.responsibleStaffId;
    const osid = g.ownerStaffId?.id || g.ownerStaffId;
    return (
      rid === currentUser.id ||
      oid === currentUser.id ||
      rsid === currentUser.id ||
      osid === currentUser.id
    );
  });
}

export function useGoals(scopeGoals) {
  const { state, loadGoals, addGoal, editGoal, removeGoal, selectGoal, setFilter, setSort } =
    useAppContext();
  const goalsSource = scopeGoals ?? state.goals;

  const sortedFiltered = useMemo(() => {
    const filtered = filterGoalsByMainFilter(
      goalsSource,
      state.actions,
      state.tasks,
      state.filter
    );
    return sortGoalsList(filtered, state.actions, state.tasks, state.sort);
  }, [goalsSource, state.actions, state.tasks, state.filter, state.sort]);

  return {
    goals: sortedFiltered,
    loading: state.loading.goals,
    loadGoals,
    addGoal,
    editGoal,
    removeGoal,
    selectGoal,
    selectedGoalId: state.selectedGoalId,
    filter: state.filter,
    sort: state.sort,
    setFilter,
    setSort,
  };
}

export function useGoalProgress(goal) {
  const { state } = useAppContext();
  return useMemo(
    () => calcGoalProgress(goal, state.actions, state.tasks),
    [goal, state.actions, state.tasks]
  );
}

export function useSelectGoal() {
  const { selectGoal } = useAppContext();
  return useCallback((id) => selectGoal(id), [selectGoal]);
}
