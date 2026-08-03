import { httpClient } from '../../api/httpClient';
import type { AuthUser } from '../auth/authTypes';
import type { UserFormData, UserPage, UserQuery } from './userTypes';

export async function getUsers(query: UserQuery): Promise<UserPage> {
  const response = await httpClient.get<UserPage>('/api/v1/users', { params: query });
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  return (await httpClient.get<AuthUser>('/api/v1/users/me')).data;
}

export async function getUser(userId: string): Promise<AuthUser> {
  return (await httpClient.get<AuthUser>(`/api/v1/users/${userId}`)).data;
}

export async function createUser(user: UserFormData): Promise<AuthUser> {
  const response = await httpClient.post<AuthUser>('/api/v1/users', user);
  return response.data;
}

export async function updateUser(userId: string, user: UserFormData): Promise<AuthUser> {
  const response = await httpClient.put<AuthUser>(`/api/v1/users/${userId}`, user);
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await httpClient.delete(`/api/v1/users/${userId}`);
}
