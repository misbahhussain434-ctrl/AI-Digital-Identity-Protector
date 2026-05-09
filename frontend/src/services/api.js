import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?unauthorized=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getActivity: () => api.get('/user/activity'),
};

export const adminAPI = {
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  getLoginLogs: (page = 1, action = '') =>
    api.get(`/admin/login-logs?page=${page}${action ? `&action=${action}` : ''}`),
  getAlerts: (page = 1, type = '', severity = '') =>
    api.get(`/admin/alerts?page=${page}${type ? `&type=${type}` : ''}${severity ? `&severity=${severity}` : ''}`),
  markAlertRead: (id) => api.patch(`/admin/alerts/${id}/read`),
  markAllAlertsRead: () => api.patch('/admin/alerts/read-all'),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
