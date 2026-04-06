import api from './api';
import type { DailyNutrition } from '../types';

export const getDailyStats = async (date?: string): Promise<DailyNutrition & { goal: any; progress: any; remaining: any }> => {
  const url = date ? `/statistics/daily?date=${date}` : '/statistics/daily';
  const response = await api.get(url);
  return response.data.data;
};

export const getWeeklyStats = async (): Promise<any> => {
  const response = await api.get('/statistics/weekly');
  return response.data.data;
};

export const getTrends = async (days = 7): Promise<any> => {
  const response = await api.get(`/statistics/trends?days=${days}`);
  return response.data.data;
};