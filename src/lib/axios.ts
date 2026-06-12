import axios from 'axios';

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL as string || '/api')}/api`, // URL backend của bạn
  headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm JWT token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.message === "Unauthenticated") {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return Promise.reject(new Error("Phiên đăng nhập đã hết hạn hoặc tài khoản bị khóa"));
    }
    return Promise.reject(error);
  }
);

export default api;
