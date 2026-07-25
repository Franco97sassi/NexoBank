import type { AuthUser } from '../auth/authTypes';

export type UserRole = AuthUser['role'];

export type UserPage = {
  content: AuthUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type UserFormData = {
  email: string;
  password?: string;
  role: UserRole;
  enabled: boolean;
};

export type UserQuery = {
  search: string;
  page: number;
  size: number;
  sortBy: 'email' | 'role' | 'enabled';
  direction: 'ASC' | 'DESC';
};
