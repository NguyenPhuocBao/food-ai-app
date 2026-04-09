import api from './api';
import type { FoodItem } from '../types';

export const getFavoriteFoods = async (): Promise<FoodItem[]> => {
  const response = await api.get('/favorites/foods');
  return response.data.data;
};

export const addFavoriteFood = async (foodId: number) => {
  const response = await api.post(`/favorites/foods/${foodId}`);
  return response.data.data;
};

export const removeFavoriteFood = async (foodId: number) => {
  const response = await api.delete(`/favorites/foods/${foodId}`);
  return response.data;
};
