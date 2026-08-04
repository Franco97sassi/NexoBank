import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, AuthProvider } from './AuthContext';
import * as authApi from './authApi';
import { clearAuthSession } from './authStorage';

vi.mock('./authApi');

const session = {
  accessToken: 'access-token',
  tokenType: 'Bearer' as const,
  expiresInSeconds: 900,
  user: {
    id: 'user-1',
    email: 'admin@nexobank.test',
    role: 'ADMIN' as const,
    enabled: true,
  },
};

function SessionProbe() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('Missing AuthProvider');
  return (
    <output>
      {auth.isInitializing
        ? 'initializing'
        : auth.isAuthenticated
          ? auth.user?.email
          : 'anonymous'}
    </output>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    clearAuthSession();
    vi.resetAllMocks();
  });

  it('restores a session from the HttpOnly refresh cookie without persistent browser storage', async () => {
    vi.mocked(authApi.refreshSession).mockResolvedValue(session);

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('initializing')).toBeInTheDocument();
    await screen.findByText(session.user.email);
    expect(authApi.refreshSession).toHaveBeenCalledOnce();
    expect(localStorage.getItem('nexobank.accessToken')).toBeNull();
  });

  it('finishes initialization as anonymous when no refresh cookie is available', async () => {
    vi.mocked(authApi.refreshSession).mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    await screen.findByText('anonymous');
  });

  it('clears the in-memory session before requesting logout', async () => {
    vi.mocked(authApi.refreshSession).mockResolvedValue(session);
    vi.mocked(authApi.logout).mockResolvedValue();

    function LogoutProbe() {
      const auth = useContext(AuthContext)!;
      return (
        <button onClick={() => void auth.logout()}>
          {auth.isAuthenticated ? 'logout' : 'anonymous'}
        </button>
      );
    }

    render(
      <AuthProvider>
        <LogoutProbe />
      </AuthProvider>,
    );
    const button = await screen.findByRole('button', { name: 'logout' });

    await act(async () => button.click());

    await waitFor(() => expect(button).toHaveTextContent('anonymous'));
    expect(authApi.logout).toHaveBeenCalledOnce();
  });
});
