import { httpClient } from '../../api/httpClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from './authTypes';

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>('/api/v1/auth/login', request);
  return response.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>('/api/v1/auth/register', request);
  return response.data;
}

export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>('/api/v1/auth/refresh', {
    refreshToken,
  });
  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await httpClient.post('/api/v1/auth/logout', { refreshToken });
}
