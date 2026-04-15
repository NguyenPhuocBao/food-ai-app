import api from './api';
import type { DailyNutrition } from '../types';

export const getDailyStats = async (date?: string): Promise<DailyNutrition & { goal: any; progress: any; remaining: any }> => {
  const url = date ? `/statistics/daily?date=${date}` : '/statistics/daily';
  try {
    const response = await api.get(url);
    return response.data.data;
  } catch {
    return {
      date: date || '',
      totalCalories: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
      totalMeals: 0,
      nutrition: { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 },
      goal: { calories: 2000, protein: 150, fat: 55, carbs: 250 },
      progress: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      remaining: { calories: 2000, protein: 150, fat: 55, carbs: 250 },
    } as any;
  }
};

export const getWeeklyStats = async (): Promise<any> => {
  try {
    const response = await api.get('/statistics/weekly');
    return response.data.data;
  } catch {
    return {
      daily: [],
      summary: {
        total: { calories: 0, protein: 0, fat: 0, carbs: 0, days: 0 },
        average: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      },
    };
  }
};

export const getTrends = async (days = 7): Promise<any> => {
  try {
    const response = await api.get(`/statistics/trends?days=${days}`);
    return response.data.data;
  } catch {
    return {
      period: `${days} ngay`,
      trend: [],
      average: 0,
      target: 2000,
      insight: 'Khong co du lieu',
    };
  }
};
