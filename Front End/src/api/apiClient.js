// ═══ API CLIENT ═══
// Reusable fetch wrapper for GET / POST / PUT / DELETE
// Reads Bearer token from localStorage and injects into every request header.
// Handles JSON parsing, HTTP error throwing, and AbortController timeout.
// On 401: remove token from localStorage and redirect to /login.

import { API_CONFIG } from './config';

class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request(method, path, body = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const url = `${API_CONFIG.BASE_URL}${path}`;
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // Parse JSON (or empty for 204)
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    // 401 → clear auth and redirect
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      window.location.href = '/';
      throw new ApiError(401, 'Unauthorized — please log in again', data);
    }

    // Other errors
    if (!response.ok) {
      const msg = data?.message || data?.title || `HTTP ${response.status}`;
      throw new ApiError(response.status, msg, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError(0, 'Connection timed out — please try again');
    }
    throw err;
  }
}

const api = {
  get:    (path)       => request('GET', path),
  post:   (path, body) => request('POST', path, body),
  put:    (path, body) => request('PUT', path, body),
  delete: (path)       => request('DELETE', path),
  patch:  (path, body) => request('PATCH', path, body),
};

export default api;
