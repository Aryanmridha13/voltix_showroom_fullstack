import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('voltix_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Automatic Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints (login, register, refresh itself)
    const isAuthEndpoint = originalRequest.url.includes('/auth/login/') ||
                           originalRequest.url.includes('/auth/register/') ||
                           originalRequest.url.includes('/auth/token/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('voltix_refresh_token');

      if (!refreshToken) {
        // No refresh token available, logout immediately
        localStorage.removeItem('voltix_access_token');
        localStorage.removeItem('voltix_refresh_token');
        localStorage.removeItem('voltix_user');
        window.dispatchEvent(new Event('voltix:auth_logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data?.data?.access || refreshResponse.data?.access;

        if (newAccessToken) {
          localStorage.setItem('voltix_access_token', newAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('voltix_access_token');
        localStorage.removeItem('voltix_refresh_token');
        localStorage.removeItem('voltix_user');
        window.dispatchEvent(new Event('voltix:auth_logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract standardized error message
    const errorPayload = error.response?.data?.error;
    if (errorPayload) {
      error.customMessage = errorPayload.message || 'An error occurred while processing your request.';
      error.customCode = errorPayload.code || 'UNKNOWN_ERROR';
      error.customDetails = errorPayload.details || null;
    } else {
      error.customMessage = error.response?.data?.message || error.message || 'Network error.';
    }

    return Promise.reject(error);
  }
);

export default api;
