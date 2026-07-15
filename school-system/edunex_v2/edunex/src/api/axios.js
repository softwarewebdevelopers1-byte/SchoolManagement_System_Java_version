import axios from 'axios';

// ----------------------------------------------------------------------------
// Environment configuration — the only place a base URL is set.
// Vite exposes import.meta.env.MODE as 'development' | 'production' (or
// whatever mode you build with --mode staging).
// ----------------------------------------------------------------------------
const BASE_URLS = {
  development: 'http://localhost:4000/api/v1',
  staging: 'https://staging-api.edunex.io/api/v1',
  production: 'https://api.edunex.io/api/v1',
};

export const API_BASE_URL = BASE_URLS[import.meta.env.MODE] || BASE_URLS.development;

// The app currently ships with dummy data only. Flip this to `false` once a
// real backend is available — every api/*.api.js file already calls through
// this client, so no component code needs to change.
export const USE_MOCK_DATA = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request interceptor: attach auth token ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edunex-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response interceptor: centralized error handling ----
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

    if (status === 401) {
      localStorage.removeItem('edunex-token');
      localStorage.removeItem('edunex-user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ status, message, raw: error });
  },
);

export default api;
