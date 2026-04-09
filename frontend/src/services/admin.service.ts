import api from './api';

export const getSystemStats = async () => {
  const response = await api.get('/admin/statistics');
  return response.data.data;
};

export const getUsers = async (page = 1, limit = 20, search = '') => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const updateUserRole = async (userId: number, role: string) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId: number) => {
  await api.delete(`/admin/users/${userId}`);
};

export const getFoodsAdmin = async (page = 1, limit = 20, search = '') => {
  const response = await api.get(`/admin/foods?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const deleteFood = async (foodId: number) => {
  await api.delete(`/admin/foods/${foodId}`);
};

export const getAuditLogs = async (page = 1, limit = 50, action = '', entity = '') => {
  const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}&action=${action}&entity=${entity}`);
  return response.data;
};

export const toggleUserBan = async (userId: number): Promise<{ isActive: boolean }> => {
  const response = await api.put(`/admin/users/${userId}/ban`);
  return response.data.data;
};

export const resetUserPassword = async (userId: number): Promise<void> => {
  await api.put(`/admin/users/${userId}/reset-password`);
};

export const updateUserProfileByAdmin = async (userId: number, data: any): Promise<any> => {
  const response = await api.put(`/admin/users/${userId}/profile`, data);
  return response.data.data;
};
export const getWeeklyStats = async () => {
  const response = await api.get('/statistics/weekly');
  return response.data.data;
};

export const getTrends = async (days = 7) => {
  const response = await api.get(`/statistics/trends?days=${days}`);
  return response.data.data;
}
export const getTopFoods = async (days = 7, limit = 10) => {
  const response = await api.get(`/statistics/top-foods?days=${days}&limit=${limit}`);
  return response.data.data;
}

export const getTopUsers = async (days = 7, limit = 10) => {
  const response = await api.get(`/statistics/top-users?days=${days}&limit=${limit}`);
  return response.data.data;
}

export const getTopCategories = async (days = 7, limit = 10) => {
  const response = await api.get(`/statistics/top-categories?days=${days}&limit=${limit}`);
  return response.data.data;
}
export const getUserById = async (userId: number) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data.data;
};
export const getFoodById = async (foodId: number) => {
  const response = await api.get(`/admin/foods/${foodId}`);
  return response.data.data;
}

export const sendToUsers = async (title: string, message: string, type: string, userIds: number[]) => {
  const response = await api.post('/admin/notifications/send-to-users', { title, message, type, userIds });
  return response.data;
};