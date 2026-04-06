import api from './api';
import type { FoodItem } from '../types';

export const getFoods = async (page = 1, limit = 20, category?: string, search?: string): Promise<{ data: FoodItem[]; pagination: any }> => {
  let url = `/foods?page=${page}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  if (search) url += `&search=${search}`;
  const response = await api.get(url);
  return response.data;
};

export const getFoodById = async (id: number): Promise<FoodItem> => {
  const response = await api.get(`/foods/${id}`);
  return response.data.data;
};

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  const response = await api.get(`/foods/search?q=${query}`);
  return response.data.data;
};

export const getCategories = async (): Promise<{ category: string; _count: number }[]> => {
  const response = await api.get('/foods/categories');
  return response.data.data;
};