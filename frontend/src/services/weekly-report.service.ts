import api from './api';
import type { WeeklyReport } from '../types';

export const getWeeklyReports = async (limit = 12) => {
  const response = await api.get(`/weekly-reports?limit=${limit}`);
  return response.data.data as WeeklyReport[];
};

export const getLatestWeeklyReport = async () => {
  const response = await api.get('/weekly-reports/latest');
  return response.data.data as WeeklyReport | null;
};

export const generateWeeklyReport = async (date?: string) => {
  const response = await api.post('/weekly-reports/generate', date ? { date } : {});
  return response.data.data as WeeklyReport;
};

export const deleteWeeklyReport = async (id: number) => {
  await api.delete(`/weekly-reports/${id}`);
};

