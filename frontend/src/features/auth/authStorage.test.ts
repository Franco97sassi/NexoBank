import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearAuthSession,
  getAccessToken,
  getSessionExpiresAt,
  getStoredUser,
  saveAuthSession,
} from './authStorage';

describe('authStorage', () => {
  afterEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
  });

  it('keeps the short-lived access session only in memory', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    const user = {
      id: 'user-13',
      email: 'ada@nexobank.test',
      role: 'ADMIN' as const,
      enabled: true,
    };

    saveAuthSession({
      accessToken: 'access',
      tokenType: 'Bearer',
      expiresInSeconds: 60,
      user,
    });

    expect(getAccessToken()).toBe('access');
    expect(getStoredUser()).toEqual(user);
    expect(getSessionExpiresAt()).toBe(61_000);
    expect(localStorage.getItem('nexobank.accessToken')).toBeNull();
    expect(localStorage.getItem('nexobank.user')).toBeNull();
    expect(localStorage.getItem('nexobank.expiresAt')).toBeNull();
    expect(localStorage.getItem('nexobank.refreshToken')).toBeNull();
  });

  it('clears memory and removes values left by older versions', () => {
    localStorage.setItem('nexobank.accessToken', 'access');
    localStorage.setItem('nexobank.user', '{}');
    localStorage.setItem('nexobank.expiresAt', '1000');
    clearAuthSession();
    expect(getAccessToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(getSessionExpiresAt()).toBeNull();
  });
});
