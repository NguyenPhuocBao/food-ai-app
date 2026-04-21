import api from './api';

export interface SupportSession {
  id: number;
  userId: number;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: number;
  sessionId: number;
  role: 'USER' | 'ADMIN' | 'SYSTEM' | string;
  content: string;
  createdAt: string;
}

export const getSupportSessions = async (params?: { userId?: number; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.userId) query.set('userId', String(params.userId));
  if (params?.search) query.set('search', params.search);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await api.get(`/support/sessions${suffix}`);
  return (response.data.data || []) as SupportSession[];
};

export const createSupportSession = async (payload?: { title?: string; userId?: number }) => {
  const response = await api.post('/support/sessions', payload || {});
  return response.data.data as SupportSession;
};

export const getSupportSession = async (id: number) => {
  const response = await api.get(`/support/sessions/${id}`);
  return response.data.data as SupportSession & { messages: SupportMessage[] };
};

export const sendSupportMessage = async (sessionId: number, content: string) => {
  const response = await api.post(`/support/sessions/${sessionId}/messages`, { content });
  return response.data.data as SupportMessage;
};

export const updateSupportSessionStatus = async (sessionId: number, status: string) => {
  const response = await api.put(`/support/sessions/${sessionId}/status`, { status });
  return response.data.data as SupportSession;
};
