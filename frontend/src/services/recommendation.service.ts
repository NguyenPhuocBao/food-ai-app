import api from './api';
import type { Meal, Recommendation } from '../types';
import type { MealPlanDetail } from './mealplan.service';

export type RecommendationResponse = {
  recommendation: Recommendation;
  meal?: Meal | null;
  mealPlanDetail?: MealPlanDetail | null;
  warning?: {
    type: 'OVER_DAILY_TARGET' | 'NEAR_DAILY_TARGET';
    message: string;
    dailyCalorieTarget: number;
    currentCalories: number;
    addedCalories: number;
    projectedCalories: number;
    overBy: number;
  } | null;
  preview?: {
    mealType: string;
    quantity: number;
    addedCalories: number;
    dailyCalorieTarget: number;
    currentCalories: number;
    projectedCalories: number;
  };
};

export const getRecommendations = async (status: 'all' | 'new' | 'accepted' | 'rejected' = 'all') => {
  const response = await api.get(`/recommendations?status=${status}&limit=30`);
  return response.data.data as Recommendation[];
};

export const generateRecommendations = async (limit = 8) => {
  const response = await api.post('/recommendations/generate', { limit });
  return response.data.data as Recommendation[];
};

export const markRecommendationViewed = async (id: number) => {
  const response = await api.put(`/recommendations/${id}/viewed`);
  return response.data.data as Recommendation;
};

export const respondRecommendation = async (
  id: number,
  accepted: boolean,
  options?: { mealType?: string; quantity?: number; dryRun?: boolean },
) => {
  const response = await api.put(`/recommendations/${id}/respond`, { accepted, ...options });
  return response.data.data as RecommendationResponse;
};
