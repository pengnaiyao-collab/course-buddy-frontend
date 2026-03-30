import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

let isRefreshing = false;
let requests: any[] = [];

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    // Usually backend returns { code, data, msg }
    const res = response.data;
    if (res.code === 200 || res.code === 0) {
      return res;
    }
    message.error(res.message || res.msg || 'Request failed');
    return Promise.reject(new Error(res.message || res.msg || 'Error'));
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      const config = error.config;
      
      // Do not retry login or refresh token requests to avoid infinite loops
      if (config.url.includes('/api/v1/auth/login') || config.url.includes('/api/v1/auth/refresh-token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
            const data = res.data;
            if (data.code === 200 || data.code === 0) {
              const newToken = data.data.accessToken;
              const newRefresh = data.data.refreshToken;
              localStorage.setItem('token', newToken);
              localStorage.setItem('refreshToken', newRefresh);
              
              // Retry all pending requests
              requests.forEach((cb) => cb(newToken));
              requests = [];
              
              config.headers.Authorization = `Bearer ${newToken}`;
              return request(config);
            }
          } catch (refreshError) {
            console.error('Token refresh failed', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          } finally {
            isRefreshing = false;
          }
        } else {
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // If refreshing, add request to queue
        return new Promise((resolve) => {
          requests.push((token: string) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(request(config));
          });
        });
      }
    } else {
      message.error(error.message || 'Network Error');
    }
    return Promise.reject(error);
  }
);

export default request;