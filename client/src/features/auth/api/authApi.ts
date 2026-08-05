import { apiClient } from '../../../lib/apiClient';
import type { AuthResponse } from '../types/auth';

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
}

export async function refreshRequest(): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function meRequest(accessToken: string): Promise<AuthResponse['user']> {
  const response = await apiClient.get<{ user: AuthResponse['user'] }>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.user;
}
