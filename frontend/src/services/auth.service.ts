import api from './api';
import type { User, UserProfile } from '../types';

export interface UpdateProfilePayload extends Partial<UserProfile> {
  goalType?: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
  targetWeight?: number;
}

export const resolveAuthErrorMessage = (
  error: any,
  mode: 'login' | 'register' = 'login',
) => {
  const fallback =
    mode === 'register'
      ? 'Không thể đăng ký lúc này. Vui lòng thử lại sau.'
      : 'Không thể đăng nhập lúc này. Vui lòng thử lại sau.';

  const status = error?.response?.status;
  const rawMessage = String(error?.response?.data?.error || error?.message || '').trim();
  const normalized = rawMessage.toLowerCase();

  if (status === 401 || status === 403) {
    return mode === 'login'
      ? 'Email hoặc mật khẩu không đúng.'
      : fallback;
  }

  if (status === 400 || status === 409) {
    if (
      normalized.includes('email') ||
      normalized.includes('mật khẩu') ||
      normalized.includes('mat khau') ||
      normalized.includes('không hợp lệ') ||
      normalized.includes('khong hop le') ||
      normalized.includes('đã tồn tại') ||
      normalized.includes('da ton tai')
    ) {
      return rawMessage;
    }
  }

  if (
    status >= 500 ||
    normalized.includes('prisma') ||
    normalized.includes('database') ||
    normalized.includes('sql') ||
    normalized.includes('econnrefused') ||
    normalized.includes('timeout') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('network error')
  ) {
    return mode === 'register'
      ? 'Hệ thống đang tạm gián đoạn. Vui lòng thử đăng ký lại sau.'
      : 'Hệ thống đang tạm gián đoạn. Vui lòng thử đăng nhập lại sau.';
  }

  return rawMessage || fallback;
};

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

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, newPassword });
};
