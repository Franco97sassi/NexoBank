export type AuthUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
  enabled: boolean;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};
