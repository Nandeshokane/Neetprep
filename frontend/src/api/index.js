import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('neet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('neet_token');
      localStorage.removeItem('neet_user');
      // Don't redirect if already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Questions API
export const questionsAPI = {
  getAll: (params) => API.get('/questions', { params }),
  getOne: (id) => API.get(`/questions/${id}`),
  getFilters: (params) => API.get('/questions/filters', { params }),
  getByIds: (ids) => API.post('/questions/by-ids', { ids }),
};

// User API
export const userAPI = {
  saveProgress: (data) => API.post('/user/progress', data),
  getStats: () => API.get('/user/stats'),
  toggleBookmark: (questionId) => API.post(`/user/bookmark/${questionId}`),
  getBookmarks: () => API.get('/user/bookmarks'),
  getIncorrect: () => API.get('/user/incorrect'),
  clearIncorrect: (questionIds) => API.post('/user/incorrect/clear', { questionIds }),
};

export default API;
