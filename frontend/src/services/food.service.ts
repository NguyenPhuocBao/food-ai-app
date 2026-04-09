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
