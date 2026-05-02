import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      localStorage.removeItem('wa_user');
      localStorage.removeItem('wa_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ============ Auth API ============
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (username, email, password) =>
  api.post('/auth/register', { username, email, password });

// ============ API ============
export const fetchUsers = () => api.get('/users');

export const fetchUserById = (userId) => api.get(`/users/${userId}`);

// ============ Profile API ============
export const updateProfile = (data) => api.put('/users/profile', data);

export const deleteProfilePicture = () => api.delete('/users/profile/picture');

// ============ Chats API ============
export const fetchChats = () => api.get('/chats');

export const createChat = (userId) => api.post('/chats', { userId });

// ============ Messages API ============
export const fetchMessages = (chatId) => api.get(`/messages/${chatId}`);

export const sendMessage = (chatId, content) =>
  api.post('/messages', { chatId, content });

export default api;
