/**
 * All functions call axiosInstance.
 * While backend is not ready, they return mock data after a simulated delay.
 * When your API is ready: remove the mock import + delay block, uncomment the axios call.
 */
import axiosInstance from './axiosInstance';
import { MOCK_ACTIONS } from '../mock/actions.mock';
import { purgeTasksForActionId, purgeTasksForActionIds } from './taskApi';

const USE_MOCK = true;
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let mockActionsStore = MOCK_ACTIONS.map((a) => ({ ...a }));

export function purgeActionsForGoal(goalId) {
  const removed = mockActionsStore.filter((a) => a.goalId === goalId);
  const ids = removed.map((a) => a.id);
  purgeTasksForActionIds(ids);
  mockActionsStore = mockActionsStore.filter((a) => a.goalId !== goalId);
}

export async function fetchActions(filters = {}) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get('/actions', { params: filters });
    let list = mockActionsStore.map((a) => ({ ...a }));
    if (filters.goalId) list = list.filter((a) => a.goalId === filters.goalId);
    return list;
  }
  const { data } = await axiosInstance.get('/actions', { params: filters });
  return data;
}

export async function fetchActionById(id) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get(`/actions/${id}`);
    return mockActionsStore.find((a) => a.id === id) || null;
  }
  const { data } = await axiosInstance.get(`/actions/${id}`);
  return data;
}

export async function createAction(payload) {
  if (USE_MOCK) {
    await delay();
    const row = {
      id: 'a_' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockActionsStore = [...mockActionsStore, row];
    // const { data } = await axiosInstance.post('/actions', payload);
    return { ...row };
  }
  const { data } = await axiosInstance.post('/actions', payload);
  return data;
}

export async function updateAction(id, payload) {
  if (USE_MOCK) {
    await delay();
    const idx = mockActionsStore.findIndex((a) => a.id === id);
    const merged = {
      ...mockActionsStore[idx],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      mockActionsStore = mockActionsStore.map((a) => (a.id === id ? merged : a));
    }
    // const { data } = await axiosInstance.put(`/actions/${id}`, payload);
    return { ...merged };
  }
  const { data } = await axiosInstance.put(`/actions/${id}`, payload);
  return data;
}

export async function deleteAction(id) {
  if (USE_MOCK) {
    await delay();
    purgeTasksForActionId(id);
    mockActionsStore = mockActionsStore.filter((a) => a.id !== id);
    // const { data } = await axiosInstance.delete(`/actions/${id}`);
    return { success: true };
  }
  const { data } = await axiosInstance.delete(`/actions/${id}`);
  return data;
}
