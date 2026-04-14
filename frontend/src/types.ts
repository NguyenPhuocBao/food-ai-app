// src/types.ts
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  token?: string;
  profile?: UserProfile;
  goals?: UserGoal[];
  healthMetrics?: UserHealthMetric[];
}

export interface UserProfile {
  id: number;
  userId: number;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  allergies: string[];
  activityLevel?: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  dietaryPref?: string[];
  avatar?: string;
}

export interface UserGoal {
  id: number;
  goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
  targetWeight?: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  isActive: boolean;
}

export interface UserHealthMetric {
  id: number;
  weight?: number;
  height?: number;
  recordedAt: string;
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
  fiber?: number;
  sugar?: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree?: boolean;
  popularity: number;
  recipe?: Recipe;
  savedAt?: string;
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
  imageUrl?: string;
  result: any;
  confidence: number;
  isConfirmed: boolean;
  createdAt: string;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  alternative?: string;
  isOptional?: boolean;
  order?: number;
}

export interface RecipeStep {
  id: number;
  stepNumber: number;
  description: string;
  timer?: number;
  imageUrl?: string;
  tips?: string;
  order?: number;
}

export interface RecipeTool {
  id: number;
  name: string;
  isRequired: boolean;
}

export interface Recipe {
  id: number;
  foodId: number;
  title: string;
  summary?: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tips?: string;
  nutritionNotes?: string;
  videoUrl?: string;
  viewCount?: number;
  cookCount?: number;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  tools?: RecipeTool[];
  food?: FoodItem;
}

export interface FoodReview {
  id: number;
  rating: number;
  comment?: string;
  images?: string[];
  helpfulCount?: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profile?: {
      avatar?: string;
    };
  };
}

export interface FoodDetail extends FoodItem {
  description?: string;
  imageUrl?: string;
  favorites?: Array<{ id: number; userId: number; foodId: number }>;
  reviews?: FoodReview[];
}

export interface Recommendation {
  id: number;
  userId: number;
  foodId: number;
  reason: string;
  score: number;
  isViewed: boolean;
  isAccepted?: boolean | null;
  createdAt: string;
  food: FoodItem;
}

export interface WeeklyReport {
  id: number;
  userId: number;
  weekStart: string;
  weekEnd: string;
  avgCalories: number;
  avgProtein: number;
  avgFat: number;
  avgCarbs: number;
  reportData: {
    totals: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      meals: number;
      activeDays: number;
    };
    average: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    daily: Array<{
      date: string;
      day: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      meals: number;
    }>;
    bestDay: {
      date: string;
      day: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      meals: number;
    };
    worstDay: {
      date: string;
      day: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      meals: number;
    };
    generatedAt: string;
  };
  createdAt: string;
}
