import axios from 'axios';



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (like ERR_BLOCKED_BY_CLIENT)
    if (!error.response) {
      if (error.code === 'ERR_BLOCKED_BY_CLIENT' || error.message?.includes('blocked')) {
        console.error('Request blocked by browser extension or network. Please disable ad blockers or privacy extensions for this site.');
        alert('Request was blocked. Please disable ad blockers or privacy extensions for localhost:3000 and try again.');
      }
      return Promise.reject(error);
    }
    
 if (error.response?.status === 401) {
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/createaccount', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword : (data)=>api.post('auth/forgot-password',data),
    resetPassword: (token, data) =>
    api.post(`/auth/forgot-password/reset-password/${token}`, data),
};

// Quiz API
export const quizAPI = {
  getAll: (params) => api.get('/quiz/quizzes',{params}),
  getById: (id) => api.get(`/quiz/quizzes/${id}`),
  getbyCategory: (categoryname,params) => api.get(`/quiz/category/${categoryname}`,{params}),
  getUserQuizzes: (params) => api.get('/quiz/admin/quizzes', { params }),
  create: (data) => api.post('/quiz/createquiz', data),
  update: (id, data) => api.put(`/quiz/update/${id}`, data),
  delete: (id) => api.post(`/quiz/delete/${id}`),
};

// Result API
export const resultAPI = {
  submit: (data) => api.post('/result/submit', data),
  getUserResults: () => api.get('/result/user'),
  getUserStatistics: () => api.get('/result/user/statistics'),
  getById: (id) => api.get(`/result/${id}`),
  getByQuiz: (quizId, params) => api.get(`/result/quiz/${quizId}`, { params }),
  getQuizStatistics: (quizId) => api.get(`/result/quiz/${quizId}/statistics`),
  getLeaderboard: (quizId) => api.get(`/result/leaderboard/${quizId}`),
  getAll: (params) => api.get('/result/admin/all', { params }),
  delete: (id) => api.delete(`/result/${id}`),
};
//Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
};

//Super Admin
export const superadminAPI = {
  getAllUser : ()=> api.get('/superadmin/users'),
  handleRole : (id,role)=> api.patch(`/superadmins/roles/${id}`,role)
}

// Contest API
export const contestAPI = {
  getAll: (params) => api.get('/contests', { params }),
  getById: (id) => api.get(`/contests/${id}`),
  create: (data) => api.post('/contests/create', data),
  join: (id) => api.post(`/contests/${id}/join`),
  getLeaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
  getMyContests: () => api.get('/contests/my-contests'),
  update: (id, data) => api.put(`/contests/${id}`, data),
  delete: (id) => api.delete(`/contests/${id}`),
};

export default api;

