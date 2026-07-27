import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '../features/auth/AuthContext';
import { LoginPage } from './LoginPage';

function renderLogin(login = vi.fn().mockResolvedValue(undefined)) {
  const value: AuthContextValue = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    login,
    register: vi.fn(),
    logout: vi.fn(),
  };
  render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return login;
}

describe('LoginPage', () => {
  it('submits the credentials entered by the user', async () => {
    const login = renderLogin();
    await userEvent.type(screen.getByLabelText('Email'), 'ada@nexobank.test');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secret-13');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(login).toHaveBeenCalledWith({
      email: 'ada@nexobank.test',
      password: 'secret-13',
    });
  });

  it('shows a useful message when authentication fails', async () => {
    renderLogin(vi.fn().mockRejectedValue(new Error('unauthorized')));
    await userEvent.type(screen.getByLabelText('Email'), 'ada@nexobank.test');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo iniciar sesión',
    );
  });
});
