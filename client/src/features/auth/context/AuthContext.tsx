import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '../../../lib/apiClient';
import { logger } from '../../../lib/logger';
import { loginRequest, logoutRequest, refreshRequest } from '../api/authApi';
import type { User } from '../types/auth';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshPromise.current) {
      refreshPromise.current = refreshRequest()
        .then((response) => {
          setUser(response.user);
          setAccessToken(response.accessToken);
          return response.accessToken;
        })
        .catch((error: unknown) => {
          logger.warn('Silent refresh failed', error);
          clearSession();
          return null;
        })
        .finally(() => {
          refreshPromise.current = null;
        });
    }
    return refreshPromise.current;
  }, [clearSession]);

  useEffect(() => {
    void refreshAccessToken().finally(() => setIsCheckingSession(false));
  }, [refreshAccessToken]);

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => apiClient.interceptors.request.eject(interceptor);
  }, [accessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    setUser(response.user);
    setAccessToken(response.accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, accessToken, isCheckingSession, login, logout }),
    [accessToken, isCheckingSession, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
