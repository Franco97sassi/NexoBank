import type { AuthResponse } from './authTypes';

const LEGACY_SESSION_KEYS = [
  'nexobank.accessToken',
  'nexobank.user',
  'nexobank.expiresAt',
];

let accessToken: string | null = null;
let user: AuthResponse['user'] | null = null;
let expiresAt: number | null = null;

export const AUTH_SESSION_CHANGED_EVENT = 'nexobank:auth-session-changed';

export function saveAuthSession(auth: AuthResponse) {
  accessToken = auth.accessToken;
  user = auth.user;
  expiresAt = Date.now() + auth.expiresInSeconds * 1000;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAuthSession() {
  accessToken = null;
  user = null;
  expiresAt = null;
  LEGACY_SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function getAccessToken() {
  return accessToken;
}

export function getStoredUser() {
  return user;
}
export function getSessionExpiresAt() {
  return expiresAt;
}

// Remove sessions created by older versions. The refresh cookie is HttpOnly and
// is the only credential intentionally persisted across page reloads.
LEGACY_SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
