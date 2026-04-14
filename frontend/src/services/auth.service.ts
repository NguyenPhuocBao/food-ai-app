import api from './api';
import type { User, UserProfile } from '../types';

export interface UpdateProfilePayload extends Partial<UserProfile> {
  goalType?: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
  targetWeight?: number;
}

export const register = async (email: string, password: string, name: string): Promise<User> => {
  const response = await api.post('/auth/register', { email, password, name });
  return response.data.data;
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const updateProfile = async (data: UpdateProfilePayload): Promise<UserProfile> => {
  const response = await api.put('/auth/profile', data);
  return response.data.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.put('/auth/change-password', { currentPassword, newPassword });
};
