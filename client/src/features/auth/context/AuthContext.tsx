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

const GUEST_SESSION_KEY = 'swapi-field-guide-guest-session';
const guestUser: User = {
  id: 'guest',
  email: 'guest@local.app',
  name: 'Guest Explorer',
  role: 'guest',
};

function hasGuestSession() {
  return window.localStorage.getItem(GUEST_SESSION_KEY) === 'true';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(GUEST_SESSION_KEY);
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshPromise.current) {
      refreshPromise.current = refreshRequest()
        .then((response) => {
          if (hasGuestSession()) {
            setUser(guestUser);
            setAccessToken(null);
            return null;
          }
          setUser(response.user);
          setAccessToken(response.accessToken);
          return response.accessToken;
        })
        .catch((error: unknown) => {
          if (hasGuestSession()) {
            setUser(guestUser);
            setAccessToken(null);
            return null;
          }
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
    if (hasGuestSession()) {
      setUser(guestUser);
      setAccessToken(null);
      setIsCheckingSession(false);
      return;
    }
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
    window.localStorage.removeItem(GUEST_SESSION_KEY);
    const response = await loginRequest(email, password);
    setUser(response.user);
    setAccessToken(response.accessToken);
  }, []);

  const continueAsGuest = useCallback(() => {
    window.localStorage.setItem(GUEST_SESSION_KEY, 'true');
    setUser(guestUser);
    setAccessToken(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await logoutRequest();
      }
    } finally {
      clearSession();
    }
  }, [accessToken, clearSession]);

  const value = useMemo(
    () => ({ user, accessToken, isCheckingSession, login, continueAsGuest, logout }),
    [accessToken, continueAsGuest, isCheckingSession, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
