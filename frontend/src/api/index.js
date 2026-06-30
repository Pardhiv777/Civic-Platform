import axios from 'axios';

// 🔥 IMPORTANT: Use backend URL from Vercel env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ FIXED
  headers: { 'Content-Type': 'application/json' },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */
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

/* =========================
   AUTH APIs
========================= */
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login', data),
  me:       () => api.get('/api/auth/me'),
};

/* =========================
   ISSUES APIs
========================= */
export const issuesAPI = {
  create:       (data) => api.post('/api/issues', data),
  getAll:       (params) => api.get('/api/issues', { params }),
  getMine:      () => api.get('/api/issues/mine'),
  getById:      (id) => api.get(`/api/issues/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/api/issues/${id}/status`, { status }),
  getAnalytics: () => api.get('/api/issues/analytics'),
};

export default api;