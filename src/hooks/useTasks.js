import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export function useTasks(actionId) {
  const { state, addTask, editTask, removeTask, completeTask, reorderTasks } = useAppContext();

  const tasks = useMemo(() => {
    const list = state.tasks.filter((t) => !actionId || t.actionId === actionId);
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [state.tasks, actionId]);

  return {
    tasks,
    loading: state.loading.tasks,
    addTask,
    editTask,
    removeTask,
    completeTask,
    reorderTasks,
  };
}
