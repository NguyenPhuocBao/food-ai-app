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

export type MealPlanRecommendationItem = {
  dayOfWeek: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  action: 'FILL_EMPTY' | 'ADD_VARIETY';
  suggestedFoodId: number;
  suggestedFood: {
    id: number;
    name: string;
    category?: string | null;
    imageUrl?: string | null;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  suggestedQuantity: number;
  estimatedCalories: number;
  reason: string;
};

export type MealPlanRecommendationResult = {
  mealPlanId: number;
  targetCalories: number;
  hardDailyCap: number;
  goalType: string;
  bmiCategory: string;
  recommendations: MealPlanRecommendationItem[];
  skipped: Array<{ dayOfWeek: number; mealType: string; reason: string; skipped: true }>;
};

export type ApplyToMealPlanDaysResult = {
  mealPlanId: number;
  foodId: number;
  mealType: string;
  quantity: number;
  targetCalories: number;
  hardDailyCap: number;
  results: Array<{ dayOfWeek: number; status: 'APPLIED' | 'SKIPPED'; reason?: string; detailId?: number }>;
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

export const generateRecommendationsByMealPlan = async (payload: {
  mealPlanId: number;
  dayOfWeeks?: number[];
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}) => {
  const response = await api.post('/recommendations/generate-by-meal-plan', payload);
  return response.data.data as MealPlanRecommendationResult;
};

export const applyRecommendationToMealPlanDays = async (payload: {
  mealPlanId: number;
  foodId: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  quantity?: number;
  applyMode: 'SELECTED_DAYS' | 'FILL_EMPTY' | 'ALL_DAYS';
  dayOfWeeks?: number[];
}) => {
  const response = await api.post('/recommendations/apply-to-meal-plan-days', payload);
  return response.data.data as ApplyToMealPlanDaysResult;
};
