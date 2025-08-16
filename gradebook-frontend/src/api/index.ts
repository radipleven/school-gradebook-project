import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000',
});

api.interceptors.request.use((config) => {
  if (config.url && !config.url.endsWith('/login')) {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      config.headers = config.headers || {};
      config.headers['x-user-id'] = userId;
    }
  }
  return config;
});

export default api; 