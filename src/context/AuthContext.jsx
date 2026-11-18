import { useCallback, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT } from '../services/api';
import { authService } from '../services/authService';
import { clearAuth, getToken, getUser, setAuth } from '../utils/storage';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser);
  const [token, setToken] = useState(getToken);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The Axios interceptor emits this event when the API rejects the token.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    setIsSubmitting(true);
    try {
      const { data } = await authService.login(email, password);
      setAuth({ token: data.token, user: data.user });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // JWTs are stateless — a failed logout call still clears local state.
    }
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await authService.me();
    setAuth({ user: data.user });
    setUser(data.user);
    return data.user;
  }, []);

  // Validate a stored token once on load. A 401 is cleared by the Axios
  // interceptor; network errors keep the session so offline use still works.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;

    authService
      .me()
      .then(({ data }) => {
        if (cancelled) return;
        setAuth({ user: data.user });
        setUser(data.user);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isSubmitting,
      login,
      logout,
      refreshUser,
    }),
    [user, token, isSubmitting, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
