import { describe, expect, it, vi } from 'vitest';

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getSessionExpiresAt,
  getStoredUser,
  saveAuthSession,
} from './authStorage';

describe('authStorage', () => {
  it('persists and restores a complete session', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    const user = {
      id: 'user-13',
      email: 'ada@nexobank.test',
      role: 'ADMIN' as const,
      enabled: true,
    };

    saveAuthSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresInSeconds: 60,
      user,
    });

    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
    expect(getStoredUser()).toEqual(user);
    expect(getSessionExpiresAt()).toBe(61_000);
  });

  it('removes every session value on logout', () => {
    localStorage.setItem('nexobank.accessToken', 'access');
    localStorage.setItem('nexobank.refreshToken', 'refresh');
    clearAuthSession();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
