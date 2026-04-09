import api from './api';

export interface ChatSession {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
}

export const getSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get('/chatbot/sessions');
  return response.data.data;
};

export const createSession = async (title?: string): Promise<ChatSession> => {
  const response = await api.post('/chatbot/sessions', { title });
  return response.data.data;
};

export const getSession = async (id: number): Promise<ChatSession & { messages: ChatMessage[] }> => {
  const response = await api.get(`/chatbot/sessions/${id}`);
  return response.data.data;
};

export const sendMessage = async (sessionId: number, content: string): Promise<ChatMessage> => {
  const response = await api.post(`/chatbot/sessions/${sessionId}/messages`, { content });
  return response.data.data;
};

export const deleteSession = async (id: number): Promise<void> => {
  await api.delete(`/chatbot/sessions/${id}`);
};
