import axiosInstance from './axiosInstance';

export async function fetchActions(filters = {}) {
  const { data } = await axiosInstance.get('/actions', { params: filters });
  return data.data;
}

export async function fetchActionById(id) {
  const { data } = await axiosInstance.get(`/actions/${id}`);
  return data.data;
}

export async function createAction(payload) {
  const { data } = await axiosInstance.post('/actions', payload);
  return data.data;
}

export async function updateAction(id, payload) {
  const { data } = await axiosInstance.put(`/actions/${id}`, payload);
  return data.data;
}

export async function deleteAction(id) {
  const { data } = await axiosInstance.delete(`/actions/${id}`);
  return data;
}

export async function addActionUpdate(id, payload) {
  const { data } = await axiosInstance.post(`/actions/${id}/updates`, payload);
  return data.data;
}
