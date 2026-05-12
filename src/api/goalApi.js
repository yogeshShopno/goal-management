/**
 * All functions call axiosInstance.
 * While backend is not ready, they return mock data after a simulated delay.
 * When your API is ready: remove the mock import + delay block, uncomment the axios call.
 */
import axiosInstance from './axiosInstance';
import { MOCK_GOALS } from '../mock/goals.mock';
import { purgeActionsForGoal } from './actionApi';

const USE_MOCK = true;
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let mockGoalsStore = MOCK_GOALS.map((g) => ({ ...g }));

export async function fetchGoals(filters = {}) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get('/goals', { params: filters });
    void filters;
    return mockGoalsStore.map((g) => ({ ...g }));
  }
  const { data } = await axiosInstance.get('/goals', { params: filters });
  return data;
}

export async function fetchGoalById(id) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get(`/goals/${id}`);
    return mockGoalsStore.find((g) => g.id === id) || null;
  }
  const { data } = await axiosInstance.get(`/goals/${id}`);
  return data;
}

export async function createGoal(payload) {
  if (USE_MOCK) {
    await delay();
    const row = {
      id: 'g_' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGoalsStore = [...mockGoalsStore, row];
    // const { data } = await axiosInstance.post('/goals', payload);
    return { ...row };
  }
  const { data } = await axiosInstance.post('/goals', payload);
  return data;
}

export async function updateGoal(id, payload) {
  if (USE_MOCK) {
    await delay();
    const idx = mockGoalsStore.findIndex((g) => g.id === id);
    const merged = {
      ...mockGoalsStore[idx],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      mockGoalsStore = mockGoalsStore.map((g) => (g.id === id ? merged : g));
    }
    // const { data } = await axiosInstance.put(`/goals/${id}`, payload);
    return { ...merged };
  }
  const { data } = await axiosInstance.put(`/goals/${id}`, payload);
  return data;
}

export async function deleteGoal(id) {
  if (USE_MOCK) {
    await delay();
    purgeActionsForGoal(id);
    mockGoalsStore = mockGoalsStore.filter((g) => g.id !== id);
    // const { data } = await axiosInstance.delete(`/goals/${id}`);
    return { success: true };
  }
  const { data } = await axiosInstance.delete(`/goals/${id}`);
  return data;
}
