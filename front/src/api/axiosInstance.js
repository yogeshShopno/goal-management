import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const trimmed = rawBase.replace(/\/+$/, '');
const baseURL = /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    const wrapped = new Error(message);
    wrapped.response = error.response;
    wrapped.status = error.response?.status;
    wrapped.data = error.response?.data;
    return Promise.reject(wrapped);
  }
);

export default axiosInstance;
