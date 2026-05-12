/**
 * All functions call axiosInstance.
 * While backend is not ready, they return mock data after a simulated delay.
 * When your API is ready: remove the mock import + delay block, uncomment the axios call.
 */
import axiosInstance from './axiosInstance';
import { MOCK_USERS } from '../mock/users.mock';

const USE_MOCK = true;
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function fetchUsers() {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get('/users');
    return MOCK_USERS.map((u) => ({ ...u }));
  }
  const { data } = await axiosInstance.get('/users');
  return data;
}

export async function fetchUserById(id) {
  if (USE_MOCK) {
    await delay();
    // const { data } = await axiosInstance.get(`/users/${id}`);
    return MOCK_USERS.find((u) => u.id === id) || null;
  }
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data;
}
