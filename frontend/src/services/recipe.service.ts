import api from './api';
import type { FoodItem, Recipe } from '../types';

export const getPopularRecipes = async (limit = 8): Promise<Recipe[]> => {
  const response = await api.get(`/recipes/popular?limit=${limit}`);
  return response.data.data;
};

export const getRecentRecipes = async (limit = 8): Promise<Recipe[]> => {
  const response = await api.get(`/recipes/recent?limit=${limit}`);
  return response.data.data;
};

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  const response = await api.get(`/recipes/search?q=${encodeURIComponent(query)}`);
  return response.data.data;
};

export const markRecipeAsCooked = async (recipeId: number, rating?: number, notes?: string) => {
  const response = await api.post(`/recipes/${recipeId}/cook`, { rating, notes });
  return response.data;
};

export const saveRecipe = async (recipeId: number) => {
  const response = await api.post(`/recipes/${recipeId}/save`);
  return response.data.data;
};

export const unsaveRecipe = async (recipeId: number) => {
  const response = await api.delete(`/recipes/${recipeId}/save`);
  return response.data;
};

export const getSavedRecipes = async (): Promise<FoodItem[]> => {
  const response = await api.get('/recipes/saved');
  return response.data.data;
};
