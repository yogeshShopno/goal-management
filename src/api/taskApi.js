/**
 * All functions call axiosInstance.
 * While backend is not ready, they return mock data after a simulated delay.
 * When your API is ready: remove the mock import + delay block, uncomment the axios call.
 */
import axiosInstance from './axiosInstance';
import { MOCK_TASKS } from '../mock/tasks.mock';

const USE_MOCK = true;
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let mockTasksStore = MOCK_TASKS.map((t) => ({ ...t }));

export function purgeTasksForActionIds(actionIds) {
  const set = new Set(actionIds);
  mockTasksStore = mockTasksStore.filter((t) => !set.has(t.actionId));
}

export function purgeTasksForActionId(actionId) {
  mockTasksStore = mockTasksStore.filter((t) => t.actionId !== actionId);
}

export async function fetchTasks(filters = {}) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get('/tasks', { params: filters });
    let list = mockTasksStore.map((t) => ({ ...t }));
    if (filters.actionId) list = list.filter((t) => t.actionId === filters.actionId);
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  const { data } = await axiosInstance.get('/tasks', { params: filters });
  return data;
}

export async function fetchTaskById(id) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get(`/tasks/${id}`);
    return mockTasksStore.find((t) => t.id === id) || null;
  }
  const { data } = await axiosInstance.get(`/tasks/${id}`);
  return data;
}

export async function createTask(payload) {
  if (USE_MOCK) {
    await delay();
    const siblings = mockTasksStore.filter((t) => t.actionId === payload.actionId);
    const nextOrder =
      payload.order !== undefined
        ? payload.order
        : siblings.length
          ? Math.max(...siblings.map((t) => t.order ?? 0)) + 1
          : 0;
    const row = {
      id: 't_' + Date.now(),
      ...payload,
      order: nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTasksStore = [...mockTasksStore, row];
    // const { data } = await axiosInstance.post('/tasks', payload);
    return { ...row };
  }
  const { data } = await axiosInstance.post('/tasks', payload);
  return data;
}

export async function updateTask(id, payload) {
  if (USE_MOCK) {
    await delay();
    const idx = mockTasksStore.findIndex((t) => t.id === id);
    const merged = {
      ...mockTasksStore[idx],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      mockTasksStore = mockTasksStore.map((t) => (t.id === id ? merged : t));
    }
    // const { data } = await axiosInstance.put(`/tasks/${id}`, payload);
    return { ...merged };
  }
  const { data } = await axiosInstance.put(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  if (USE_MOCK) {
    await delay();
    mockTasksStore = mockTasksStore.filter((t) => t.id !== id);
    // const { data } = await axiosInstance.delete(`/tasks/${id}`);
    return { success: true };
  }
  const { data } = await axiosInstance.delete(`/tasks/${id}`);
  return data;
}

/** Persist task order for one action in mock or real API. */
export async function reorderTasksForAction(actionId, orderedIds) {
  if (USE_MOCK) {
    await delay();
    orderedIds.forEach((taskId, index) => {
      const t = mockTasksStore.find((x) => x.id === taskId && x.actionId === actionId);
      if (t) t.order = index;
    });
    // await axiosInstance.post(`/actions/${actionId}/tasks/reorder`, { orderedIds });
    return mockTasksStore.map((t) => ({ ...t })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  const { data } = await axiosInstance.post(`/actions/${actionId}/tasks/reorder`, { orderedIds });
  return data;
}
