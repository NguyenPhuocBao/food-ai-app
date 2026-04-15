import api from './api';
import type { FoodDetail, FoodItem } from '../types';

export interface FoodListResult {
  items: FoodItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getFoods = async (page = 1, limit = 20, category?: string, search?: string): Promise<FoodListResult> => {
  let url = `/foods?page=${page}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  if (search) url += `&search=${search}`;
  const response = await api.get(url);
  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
};

export const getFoodById = async (id: number): Promise<FoodDetail> => {
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

export const getPopularFoods = async (limit = 8): Promise<FoodItem[]> => {
  const response = await api.get(`/foods/popular?limit=${limit}`);
  return response.data.data;
};

export const getMyCustomFoods = async (): Promise<FoodItem[]> => {
  try {
    const response = await api.get('/foods/custom/mine');
    return response.data.data;
  } catch {
    return [];
  }
};

export type CreateCustomFoodPayload = {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
};

export const createCustomFood = async (payload: CreateCustomFoodPayload): Promise<FoodItem> => {
  const response = await api.post('/foods/custom', payload);
  return response.data.data;
};

export const bootstrapPopularFoods = async (limit = 240) => {
  const response = await api.post('/foods/bootstrap-popular', { limit });
  return response.data.data as { inserted: number; skipped: number; totalFoods: number };
};
