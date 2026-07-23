import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { clearAuthSession, getAccessToken, getRefreshToken, getStoredUser, saveAuthSession } from './authStorage';
import { login as loginRequest, logout as logoutRequest, register as registerRequest } from './authApi';
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
