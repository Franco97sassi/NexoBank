import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
 import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getSessionExpiresAt,
  getStoredUser,
  saveAuthSession,
} from './authStorage';
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
} from './authApi';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from './authTypes';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
useEffect(() => {
    const synchronizeSession = () => {
      setUser(getStoredUser());
      setAccessToken(getAccessToken());
    };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, synchronizeSession);
    window.addEventListener('storage', synchronizeSession);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, synchronizeSession);
      window.removeEventListener('storage', synchronizeSession);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const expiresAt = getSessionExpiresAt();
    if (!expiresAt) return;
    const refreshOrLogout = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthSession();
        return;
      }
      try {
        saveAuthSession(await refreshSession(refreshToken));
      } catch {
        clearAuthSession();
      }
    };
    const timeout = window.setTimeout(
      () => void refreshOrLogout(),
      Math.max(0, expiresAt - Date.now() - 30_000),
    );
    return () => window.clearTimeout(timeout);
  }, [accessToken]);

  const persistSession = useCallback((auth: AuthResponse) => {
    saveAuthSession(auth);
    setUser(auth.user);
    setAccessToken(auth.accessToken);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    persistSession(await loginRequest(request));
  }, [persistSession]);

  const register = useCallback(async (request: RegisterRequest) => {
    persistSession(await registerRequest(request));
  }, [persistSession]);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearAuthSession();
    setUser(null);
    setAccessToken(null);
    if (refreshToken) {
      await logoutRequest(refreshToken);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    login,
    register,
    logout,
  }), [accessToken, login, logout, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
