import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.detail || 'Error del servidor';
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error('No se pudo conectar con el servidor'));
    }
    return Promise.reject(error);
  },
);

export default api;
