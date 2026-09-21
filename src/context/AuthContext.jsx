import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api, { getToken, setToken, clearToken } from '../api/apiClient';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ams_admin_user';

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!getToken());
  const [error, setError] = useState(null);

  useEffect(() => {
    const onUnauthorized = () => {
      setAdmin(null);
      localStorage.removeItem(STORAGE_KEY);
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    };
    window.addEventListener('ams:unauthorized', onUnauthorized);
    return () => window.removeEventListener('ams:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (!getToken() || admin) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setAdmin(res.admin);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.admin));
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setLoading(false));
  }, [admin]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.admin));
      return res.admin;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  }, []);

  const value = useMemo(
    () => ({ admin, loading, error, login, logout, changePassword, isAuthed: !!admin }),
    [admin, loading, error, login, logout, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;