// src/types.ts
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  token?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  userId: number;
  fullName?: string;
  gender?: string;
  height?: number;
  weight?: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  allergies: string[];
}

export interface FoodItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isVegetarian: boolean;
  isVegan: boolean;
  popularity: number;
}

export interface Meal {
  id: number;
  userId: number;
  foodId: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  eatenAt: string;
  quantity: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes?: string;
  food: FoodItem;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalMeals: number;
}

export interface ScanHistory {
  id: number;
  imageUrl: string;
  result: any;
  confidence: number;
  isConfirmed: boolean;
  createdAt: string;
}