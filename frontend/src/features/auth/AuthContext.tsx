import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSession,
  getAccessToken,
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

export type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let sessionRestoreRequest: Promise<AuthResponse> | null = null;

function restoreSession() {
  sessionRestoreRequest ??= refreshSession().finally(() => {
    sessionRestoreRequest = null;
  });
  return sessionRestoreRequest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    const synchronizeSession = () => {
      setUser(getStoredUser());
      setAccessToken(getAccessToken());
    };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, synchronizeSession);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, synchronizeSession);
    };
  }, []);

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((auth) => {
        if (!active) return;
        saveAuthSession(auth);
        setUser(auth.user);
        setAccessToken(auth.accessToken);
      })
      .catch(() => {
        if (active) clearAuthSession();
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const expiresAt = getSessionExpiresAt();
    if (!expiresAt) return;
    const refreshOrLogout = async () => {
      try {
        saveAuthSession(await refreshSession());
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

  const login = useCallback(
    async (request: LoginRequest) => {
      persistSession(await loginRequest(request));
    },
    [persistSession],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      persistSession(await registerRequest(request));
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    clearAuthSession();
    setUser(null);
    setAccessToken(null);
    await logoutRequest();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isInitializing,
      login,
      register,
      logout,
    }),
    [accessToken, isInitializing, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
