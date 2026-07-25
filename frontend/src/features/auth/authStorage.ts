import type { AuthResponse } from './authTypes';

const ACCESS_TOKEN_KEY = 'nexobank.accessToken';
const REFRESH_TOKEN_KEY = 'nexobank.refreshToken';
const USER_KEY = 'nexobank.user';
const EXPIRES_AT_KEY = 'nexobank.expiresAt';

export const AUTH_SESSION_CHANGED_EVENT = 'nexobank:auth-session-changed';

export function saveAuthSession(auth: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
   localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + auth.expiresInSeconds * 1000));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
   localStorage.removeItem(EXPIRES_AT_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}
export function getSessionExpiresAt() {
  const value = localStorage.getItem(EXPIRES_AT_KEY);
  return value ? Number(value) : null;
}