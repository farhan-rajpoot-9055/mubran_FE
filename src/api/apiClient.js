const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010/api';

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const getToken = () => localStorage.getItem('ams_admin_token') || '';
export const setToken = (t) => localStorage.setItem('ams_admin_token', t);
export const clearToken = () => localStorage.removeItem('ams_admin_token');

const request = async (path, options = {}, { retryAuth = true } = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && token && retryAuth) {
    clearToken();
    if (res.headers && String(res.url || '').includes('/auth/')) {
      return request(path, options, { retryAuth: false });
    }
    window.dispatchEvent(new CustomEvent('ams:unauthorized'));
  }

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      body?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body?.details);
  }

  return body;
};

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, data, options) =>
    request(path, { method: 'POST', body: JSON.stringify(data ?? {}), ...options }),
  put: (path, data, options) =>
    request(path, { method: 'PUT', body: JSON.stringify(data ?? {}), ...options }),
  patch: (path, data, options) =>
    request(path, { method: 'PATCH', body: JSON.stringify(data ?? {}), ...options }),
  del: (path, options) => request(path, { method: 'DELETE', ...options }),
  upload: (path, file) => {
    const token = getToken();
    const form = new FormData();
    form.append('image', file);
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      const body = await res.json();
      if (!res.ok) throw new ApiError(body?.message || 'Upload failed', res.status);
      return body;
    });
  },
};

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_URL.replace(/\/api$/, '')}${url}`;
};

export default api;