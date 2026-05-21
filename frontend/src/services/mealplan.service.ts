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

export interface MealPlanShoppingItem {
  itemKey: string;
  name: string;
  unit: string;
  amount: number;
  recipeCount: number;
  checked: boolean;
}

export interface MealPlanShoppingList {
  mealPlanId: number;
  mealPlanName: string;
  dayOfWeek: number | null;
  totalItems: number;
  checkedItems: number;
  completionRate: number;
  items: MealPlanShoppingItem[];
}

export interface MealPlanInsights {
  mealPlanId: number;
  dateKey: string;
  plannedMealsToday: number;
  completedMealsToday: number;
  adherenceRateToday: number;
}

export interface ApplyMealPlanTodayResult {
  mealPlanId: number;
  mealPlanName: string;
  appliedDate: string;
  createdCount: number;
  skippedCount: number;
  skippedMeals: Array<{
    foodId: number;
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    reason: string;
  }>;
}

export interface AutoGenerateMealPlanPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  activate?: boolean;
  includeSnack?: boolean;
  goalTemplate?: 'AUTO' | 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
  macroStrategy?: 'AUTO' | 'BALANCED' | 'HIGH_PROTEIN' | 'LOW_CARB';
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
}

export const getMealPlans = async (): Promise<MealPlan[]> => {
  const response = await api.get('/meal-plans');
  return response.data.data;
};

export const getMealPlanById = async (planId: number): Promise<MealPlan> => {
  const response = await api.get(`/meal-plans/${planId}`);
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

export const updateMealPlanDetail = async (
  planId: number,
  detailId: number,
  detail: { foodId?: number; mealType?: string; dayOfWeek?: number; quantity?: number }
): Promise<MealPlanDetail> => {
  const response = await api.patch(`/meal-plans/${planId}/details/${detailId}`, detail);
  return response.data.data;
};

export const deleteDetailFromMealPlan = async (planId: number, detailId: number): Promise<void> => {
  await api.delete(`/meal-plans/${planId}/details/${detailId}`);
};

export const setActiveMealPlan = async (planId: number): Promise<MealPlan> => {
  const response = await api.patch(`/meal-plans/${planId}/activate`);
  return response.data.data;
};

export const deleteMealPlan = async (planId: number): Promise<void> => {
  await api.delete(`/meal-plans/${planId}`);
};

export const getMealPlanShoppingList = async (planId: number, dayOfWeek?: number): Promise<MealPlanShoppingList> => {
  const response = await api.get(`/meal-plans/${planId}/shopping-list`, {
    params: dayOfWeek === undefined ? undefined : { dayOfWeek },
  });
  return response.data.data;
};

export const toggleMealPlanShoppingItem = async (
  planId: number,
  itemKey: string,
  checked: boolean
): Promise<void> => {
  await api.patch(`/meal-plans/${planId}/shopping-list/check`, { itemKey, checked });
};

export const resetMealPlanShoppingListChecks = async (planId: number): Promise<void> => {
  await api.post(`/meal-plans/${planId}/shopping-list/reset`);
};

export const getMealPlanInsights = async (planId: number): Promise<MealPlanInsights> => {
  const response = await api.get(`/meal-plans/${planId}/insights`);
  return response.data.data;
};

export const generateAutoMealPlan = async (payload: AutoGenerateMealPlanPayload): Promise<MealPlan> => {
  const response = await api.post('/meal-plans/auto-generate', payload);
  return response.data.data;
};

export const applyActiveMealPlanToday = async (): Promise<ApplyMealPlanTodayResult> => {
  const response = await api.post('/meal-plans/active/apply-today');
  return response.data.data;
};
