import api from './api';

export interface ChatSession {
  id: number;
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
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  entities?: {
    attachments?: Array<{
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
      kind: 'image' | 'file';
    }>;
  } | null;
  createdAt: string;
}

export const getSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get('/chat/sessions');
  return response.data.data;
};

export const createSession = async (title?: string): Promise<ChatSession> => {
  const response = await api.post('/chat/sessions', { title });
  return response.data.data;
};

export const getSession = async (id: number): Promise<ChatSession & { messages: ChatMessage[] }> => {
  const response = await api.get(`/chat/sessions/${id}`);
  return response.data.data;
};

export const sendMessage = async (
  sessionId: number,
  content: string,
  files: File[] = [],
): Promise<ChatMessage> => {
  if (files.length > 0) {
    const formData = new FormData();
    formData.append('content', content);
    files.forEach((file) => formData.append('files', file));
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
  return response.data.data;
};

export const deleteSession = async (id: number): Promise<void> => {
  await api.delete(`/chat/sessions/${id}`);
};
