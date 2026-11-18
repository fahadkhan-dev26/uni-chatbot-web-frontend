import axios from 'axios';
import { clearAuth, getToken } from '../utils/storage';

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/** Event emitted when the API rejects a stored token (expired / revoked). */
export const UNAUTHORIZED_EVENT = 'uac:unauthorized';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

// ── Request: attach the JWT when one is stored ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: normalise errors for UI consumption ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      error.friendlyMessage =
        error.code === 'ECONNABORTED'
          ? 'The server took too long to respond. Please try again.'
          : 'Cannot reach the server. Check your connection and try again.';
      return Promise.reject(error);
    }

    error.friendlyMessage =
      response.data?.message ||
      (response.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : 'Something went wrong. Please try again.');

    if (response.status === 401) {
      clearAuth();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);

export default api;
