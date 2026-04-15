import api from './api';
import type { Meal } from '../types';

export const getMealsByDate = async (date?: string): Promise<{ meals: Meal[]; nutrition: any }> => {
  const url = date ? `/meals?date=${date}` : '/meals';
  try {
    const response = await api.get(url);
    return response.data.data;
  } catch {
    return {
      meals: [],
      nutrition: { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 },
    };
  }
};

export const addMeal = async (foodId: number, mealType: string, quantity: number, eatenAt?: string): Promise<Meal> => {
  const response = await api.post('/meals', { foodId, mealType, quantity, eatenAt });
  return response.data.data;
};

export const deleteMeal = async (id: number): Promise<void> => {
  await api.delete(`/meals/${id}`);
};

export const getMealHistory = async (limit = 50): Promise<Meal[]> => {
  try {
    const response = await api.get(`/meals/history?limit=${limit}`);
    return response.data.data;
  } catch {
    return [];
  }
};
