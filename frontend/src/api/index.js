import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// Issues
export const issuesAPI = {
  create:         (data) => api.post('/issues', data),
  getAll:         (params) => api.get('/issues', { params }),
  getMine:        () => api.get('/issues/mine'),
  getById:        (id) => api.get(`/issues/${id}`),
  updateStatus:   (id, status) => api.patch(`/issues/${id}/status`, { status }),
  getAnalytics:   () => api.get('/issues/analytics'),
};

export default api;
