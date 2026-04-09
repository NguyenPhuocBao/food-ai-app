import api from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data.data;
};

export const markAsRead = async (id: number): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
