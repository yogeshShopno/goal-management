import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { apiHandler } from '../utils/apiHandler';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../api/goalApi';
import { fetchActions, createAction, updateAction, deleteAction, addActionUpdate as addActionUpdateApi } from '../api/actionApi';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasksForAction,
  addTaskUpdate as addTaskUpdateApi,
} from '../api/taskApi';
import { GOAL_STATUS, ACTION_STATUS, TASK_STATUS, PRIORITY } from '../constants';

const AppContext = createContext(null);

const initialState = {
  goals: [],
  actions: [],
  tasks: [],
  users: [],
  selectedGoalId: null,
  loading: { goals: false, actions: false, tasks: false, users: false },
  filter: 'all',
  sort: 'deadline',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'SET_ACTIONS':
      return { ...state, actions: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SELECT_GOAL':
      return { ...state, selectedGoalId: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
        selectedGoalId: state.selectedGoalId === action.payload ? null : state.selectedGoalId,
      };
    case 'ADD_ACTION':
      return { ...state, actions: [...state.actions, action.payload] };
    case 'UPDATE_ACTION':
      return {
        ...state,
        actions: state.actions.map((a) => (a.id === action.payload.id ? action.payload : a)),
      };
    case 'DELETE_ACTION':
      return { ...state, actions: state.actions.filter((a) => a.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'UPDATE_MANY_TASKS': {
      const updated = action.payload;
      const map = new Map(updated.map((t) => [t.id, t]));
      return {
        ...state,
        tasks: state.tasks.map((t) => (map.has(t.id) ? map.get(t.id) : t)),
      };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadGoals = useCallback(async () => {
    await apiHandler(() => fetchGoals(), {
      setLoading: (v) => dispatch({ type: 'SET_LOADING', payload: { goals: v } }),
      onSuccess: (data) => dispatch({ type: 'SET_GOALS', payload: data }),
      errorMsg: 'Failed to load goals',
    });
  }, []);

  const loadActions = useCallback(async () => {
    await apiHandler(() => fetchActions(), {
      setLoading: (v) => dispatch({ type: 'SET_LOADING', payload: { actions: v } }),
      onSuccess: (data) => dispatch({ type: 'SET_ACTIONS', payload: data }),
      errorMsg: 'Failed to load actions',
    });
  }, []);

  const loadTasks = useCallback(async () => {
    await apiHandler(() => fetchTasks(), {
      setLoading: (v) => dispatch({ type: 'SET_LOADING', payload: { tasks: v } }),
      onSuccess: (data) => dispatch({ type: 'SET_TASKS', payload: data }),
      errorMsg: 'Failed to load tasks',
    });
  }, []);

  useEffect(() => {
    loadGoals();
    loadActions();
    loadTasks();
  }, [loadGoals, loadActions, loadTasks]);

  const addGoal = useCallback(async (payload) => {
    await apiHandler(() => createGoal(payload), {
      successMsg: 'Goal created successfully',
      errorMsg: 'Failed to create goal',
      onSuccess: (data) => dispatch({ type: 'ADD_GOAL', payload: data }),
    });
  }, []);

  const editGoal = useCallback(async (id, payload) => {
    await apiHandler(() => updateGoal(id, payload), {
      successMsg: 'Goal updated',
      errorMsg: 'Failed to update goal',
      onSuccess: (data) => dispatch({ type: 'UPDATE_GOAL', payload: data }),
    });
  }, []);

  const removeGoal = useCallback(async (id) => {
    await apiHandler(() => deleteGoal(id), {
      successMsg: 'Goal deleted',
      errorMsg: 'Failed to delete goal',
      onSuccess: async () => {
        dispatch({ type: 'DELETE_GOAL', payload: id });
        await Promise.all([loadActions(), loadTasks()]);
      },
    });
  }, [loadActions, loadTasks]);

  const addAction = useCallback(async (payload) => {
    await apiHandler(() => createAction(payload), {
      successMsg: 'Action created',
      errorMsg: 'Failed to create action',
      onSuccess: (data) => dispatch({ type: 'ADD_ACTION', payload: data }),
    });
  }, []);

  const editAction = useCallback(async (id, payload) => {
    await apiHandler(() => updateAction(id, payload), {
      successMsg: 'Action updated',
      errorMsg: 'Failed to update action',
      onSuccess: (data) => dispatch({ type: 'UPDATE_ACTION', payload: data }),
    });
  }, []);

  const addActionUpdate = useCallback(async (id, payload) => {
    await apiHandler(() => addActionUpdateApi(id, payload), {
      successMsg: 'Update added',
      errorMsg: 'Failed to add update',
      onSuccess: (data) => dispatch({ type: 'UPDATE_ACTION', payload: data }),
    });
  }, []);

  const removeAction = useCallback(async (id) => {
    await apiHandler(() => deleteAction(id), {
      successMsg: 'Action deleted',
      errorMsg: 'Failed to delete action',
      onSuccess: async () => {
        dispatch({ type: 'DELETE_ACTION', payload: id });
        await loadTasks();
      },
    });
  }, [loadTasks]);

  const addTask = useCallback(async (payload) => {
    await apiHandler(() => createTask(payload), {
      successMsg: 'Task created',
      errorMsg: 'Failed to create task',
      onSuccess: (data) => dispatch({ type: 'ADD_TASK', payload: data }),
    });
  }, []);

  const editTask = useCallback(async (id, payload) => {
    await apiHandler(() => updateTask(id, payload), {
      successMsg: 'Task updated',
      errorMsg: 'Failed to update task',
      onSuccess: (data) => dispatch({ type: 'UPDATE_TASK', payload: data }),
    });
  }, []);

  const addTaskUpdate = useCallback(async (id, payload) => {
    await apiHandler(() => addTaskUpdateApi(id, payload), {
      successMsg: 'Update added',
      errorMsg: 'Failed to add update',
      onSuccess: (data) => dispatch({ type: 'UPDATE_TASK', payload: data }),
    });
  }, []);

  const updateTaskState = useCallback((task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  }, []);

  const removeTask = useCallback(async (id) => {
    await apiHandler(() => deleteTask(id), {
      successMsg: 'Task deleted',
      errorMsg: 'Failed to delete task',
      onSuccess: (data) => {
        void data;
        dispatch({ type: 'DELETE_TASK', payload: id });
      },
    });
  }, []);

  const completeTask = useCallback(
    async (taskId, completed) => {
      const originalTask = state.tasks.find((t) => t.id === taskId);
      if (!originalTask) return;
      const updatedTask = {
        status: completed ? TASK_STATUS.COMPLETED : TASK_STATUS.TODO,
        completedAt: completed ? new Date().toISOString() : null,
      };

      // Optimistic update
      dispatch({ type: 'UPDATE_TASK', payload: { ...originalTask, ...updatedTask, id: taskId } });

      const { error } = await apiHandler(() => updateTask(taskId, updatedTask), {
        successMsg: completed ? 'Task completed!' : 'Task reopened',
        errorMsg: 'Failed to update task',
        onSuccess: (data) => dispatch({ type: 'UPDATE_TASK', payload: data }),
      });

      // Rollback on error
      if (error && originalTask) {
        dispatch({ type: 'UPDATE_TASK', payload: originalTask });
      }
    },
    [state.tasks]
  );

  const reorderTasks = useCallback(async (actionId, orderedIds) => {
    await apiHandler(() => reorderTasksForAction(actionId, orderedIds), {
      successMsg: 'Task order saved',
      errorMsg: 'Failed to reorder tasks',
      onSuccess: (data) => dispatch({ type: 'UPDATE_MANY_TASKS', payload: data }),
    });
  }, []);

  const selectGoal = useCallback((id) => {
    dispatch({ type: 'SELECT_GOAL', payload: id });
  }, []);

  const setFilter = useCallback((f) => {
    dispatch({ type: 'SET_FILTER', payload: f });
  }, []);

  const setSort = useCallback((s) => {
    dispatch({ type: 'SET_SORT', payload: s });
  }, []);

  const value = {
    state,
    dispatch,
    loadGoals,
    loadActions,
    loadTasks,
    addGoal,
    editGoal,
    removeGoal,
    addAction,
    editAction,
    removeAction,
    addActionUpdate,
    addTask,
    editTask,
    addTaskUpdate,
    updateTaskState,
    removeTask,
    completeTask,
    reorderTasks,
    selectGoal,
    setFilter,
    setSort,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
