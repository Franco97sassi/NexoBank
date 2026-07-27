import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '../features/auth/authTypes';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
} from '../features/auth/authStorage';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
let refreshRequest: Promise<AuthResponse> | null = null;
export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
httpClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const refreshToken = getRefreshToken();
    const isAuthRequest = request?.url?.startsWith('/api/v1/auth/');

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      !refreshToken ||
      isAuthRequest
    ) {
      if (error.response?.status === 401 && !isAuthRequest) {
        clearAuthSession();
      }
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshRequest ??= axios
        .post<AuthResponse>(`${apiBaseUrl}/api/v1/auth/refresh`, { refreshToken })
        .then((response) => response.data)
        .finally(() => {
          refreshRequest = null;
        });
      const auth = await refreshRequest;
      saveAuthSession(auth);
      request.headers.Authorization = `Bearer ${auth.accessToken}`;
      return httpClient(request);
    } catch (refreshError) {
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  },
);
