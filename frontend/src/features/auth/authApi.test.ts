import { beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '../../api/httpClient';
import { login, logout, refreshSession, register } from './authApi';

vi.mock('../../api/httpClient', () => ({
  httpClient: { post: vi.fn() },
}));

const response = {
  accessToken: 'access',
  tokenType: 'Bearer' as const,
  expiresInSeconds: 900,
  user: { id: '1', email: 'demo@nexobank.test', role: 'ADMIN' as const, enabled: true },
};

describe('authApi', () => {
  beforeEach(() => vi.mocked(httpClient.post).mockReset());

  it.each([
    ['login', login, '/api/v1/auth/login'],
    ['register', register, '/api/v1/auth/register'],
  ] as const)(
    'posts the %s request and returns its session',
    async (_name, operation, url) => {
      vi.mocked(httpClient.post).mockResolvedValue({ data: response });
      const credentials = { email: 'demo@nexobank.test', password: 'Secret123!' };

      await expect(operation(credentials)).resolves.toEqual(response);
      expect(httpClient.post).toHaveBeenCalledWith(url, credentials);
    },
  );

  it('refreshes through the HttpOnly cookie without sending a token body', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: response });
    await expect(refreshSession()).resolves.toEqual(response);
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/auth/refresh');
  });

  it('logs out through the HttpOnly cookie', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({});
    await logout();
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
  });
});
