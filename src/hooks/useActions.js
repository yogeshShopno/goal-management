import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { parseISO } from 'date-fns';

export function useActions(goalId) {
  const { state, addAction, editAction, removeAction } = useAppContext();

  const actions = useMemo(() => {
    const list = state.actions.filter((a) => !goalId || a.goalId === goalId);
    return [...list].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
    });
  }, [state.actions, goalId]);

  return {
    actions,
    loading: state.loading.actions,
    addAction,
    editAction,
    removeAction,
  };
}
