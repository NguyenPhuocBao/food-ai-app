import api from './api';

export interface MealPlanDetail {
  id: number;
  mealPlanId: number;
  foodId: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  quantity: number;
  food: {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    imageUrl?: string;
    category: string;
  };
}

export interface MealPlan {
  id: number;
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  details: MealPlanDetail[];
}

export const getMealPlans = async (): Promise<MealPlan[]> => {
  const response = await api.get('/meal-plans');
  return response.data.data;
};

export const getActiveMealPlan = async (): Promise<MealPlan | null> => {
  const response = await api.get('/meal-plans/active');
  return response.data.data;
};

export const createMealPlan = async (data: {
  name: string;
  startDate: string;
  endDate: string;
}): Promise<MealPlan> => {
  const response = await api.post('/meal-plans', data);
  return response.data.data;
};

export const addDetailToMealPlan = async (
  planId: number,
  detail: { foodId: number; mealType: string; dayOfWeek: number; quantity?: number }
): Promise<MealPlanDetail> => {
  const response = await api.post(`/meal-plans/${planId}/details`, detail);
  return response.data.data;
};

export const setActiveMealPlan = async (planId: number): Promise<MealPlan> => {
  const response = await api.patch(`/meal-plans/${planId}/activate`);
  return response.data.data;
};

export const deleteMealPlan = async (planId: number): Promise<void> => {
  await api.delete(`/meal-plans/${planId}`);
};
