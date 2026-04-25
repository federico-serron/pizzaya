import api from './api';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../types';

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<{ success: boolean; data: LoginResponse }>('/api/v1/auth/login', data);
  return res.data.data;
}

export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
  const res = await api.post<{ success: boolean; data: UserResponse }>('/api/v1/auth/register', data);
  return res.data.data;
}

export async function logoutUser(): Promise<void> {
  await api.post('/api/v1/auth/logout');
}

export async function fetchMe(): Promise<UserResponse> {
  const res = await api.get<{ success: boolean; data: UserResponse }>('/api/v1/auth/me');
  return res.data.data;
}

export async function refreshToken(): Promise<void> {
  await api.post('/api/v1/auth/refresh');
}
