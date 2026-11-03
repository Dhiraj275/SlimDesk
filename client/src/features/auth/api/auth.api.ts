import { api } from '@/shared/utils/api-client';
import { AuthResponse, SigninPayload, SignupPayload } from '../types/api.types';

export const loginUser = async ({ email, password }: SigninPayload): Promise<AuthResponse> => {
  return await api.post<AuthResponse>('/auth/login', {
    email,
    password
  });
};

export const registerUser = async ({
  displayName,
  email,
  password
}: SignupPayload): Promise<AuthResponse> => {
  return await api.post<AuthResponse>('/auth/register', {
    displayName,
    email,
    password
  });
};

export const refreshTokensApi = async (refreshToken: string): Promise<AuthResponse> => {
  return await api.post<AuthResponse>(
    '/auth/refresh',
    { refreshToken },
    { skipAuth: true }
  );
};

export const getCurrentUser = async () => {
  return await api.get<{
    userId: string;
    displayName: string;
    email: string;
    createdAt: string;
  }>('/auth/me');
};

export const getProfile = async () => {
  return await api.get<{
    userId: string;
    displayName: string;
    email: string;
    createdAt: string;
    data?: {
      user: {
        userId: string;
        displayName: string;
        email: string;
        createdAt: string;
      };
    };
  }>('/auth/profile');
};
