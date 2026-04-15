import api from './api';

export type MealHealth = {
  mealId: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  alerts: string[];
  positives: string[];
};

export type DailyHealth = {
  date: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  alerts: string[];
  highlights: string[];
  recommendations: string[];
  mealScores: MealHealth[];
  stats: {
    meals: number;
    veggieMeals: number;
    saltyMeals: number;
    lateMeals: number;
  };
  hydration: {
    totalMl: number;
    goalMl: number;
    percent: number;
  };
};

export type Personalization = {
  goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  targetWeight: number | null;
  allergies: string[];
  dietaryPref: string[];
  activityLevel: string;
  routine: {
    wakeUpAt: string;
    sleepAt: string;
    breakfastAt: string;
    lunchAt: string;
    dinnerAt: string;
    waterGoalMl: number;
    remindersEnabled: boolean;
  };
};

export type HydrationData = {
  dateKey: string;
  totalMl: number;
  logs: Array<{ amountMl: number; loggedAt: string }>;
  goalMl: number;
  percent: number;
};

const defaultPersonalization: Personalization = {
  goalType: 'MAINTENANCE',
  targetCalories: 2000,
  targetProtein: 140,
  targetFat: 55,
  targetCarbs: 250,
  targetWeight: null,
  allergies: [],
  dietaryPref: [],
  activityLevel: 'MODERATE',
  routine: {
    wakeUpAt: '06:30',
    sleepAt: '23:00',
    breakfastAt: '07:30',
    lunchAt: '12:30',
    dinnerAt: '19:00',
    waterGoalMl: 2200,
    remindersEnabled: true,
  },
};

export const getDailyHealth = async (date?: string): Promise<DailyHealth> => {
  const url = date ? `/health/daily?date=${date}` : '/health/daily';
  try {
    const response = await api.get(url);
    return response.data.data;
  } catch {
    return {
      date: date || '',
      score: 0,
      grade: 'D',
      alerts: ['Khong the tai phan tich suc khoe hom nay.'],
      highlights: [],
      recommendations: [],
      mealScores: [],
      stats: { meals: 0, veggieMeals: 0, saltyMeals: 0, lateMeals: 0 },
      hydration: { totalMl: 0, goalMl: 2200, percent: 0 },
    };
  }
};

export const getMealHealth = async (mealId: number): Promise<MealHealth | null> => {
  try {
    const response = await api.get(`/health/meal/${mealId}`);
    return response.data.data;
  } catch {
    return null;
  }
};

export const getWeeklyHealth = async (date?: string) => {
  const url = date ? `/health/weekly?date=${date}` : '/health/weekly';
  try {
    const response = await api.get(url);
    return response.data.data;
  } catch {
    return {
      daily: [],
      summary: {
        avgScore: 0,
        alerts: [],
        recommendations: [],
        hydration: { totalMl: 0, days: 7, avgMl: 0, goalMl: 2200 },
      },
    };
  }
};

export const getPersonalization = async (): Promise<Personalization> => {
  try {
    const response = await api.get('/health/personalization');
    return response.data.data;
  } catch {
    return defaultPersonalization;
  }
};

export const updateRoutine = async (payload: Partial<Personalization['routine']>) => {
  const response = await api.put('/health/personalization/routine', payload);
  return response.data.data as Personalization['routine'];
};

export const getHydrationToday = async (date?: string): Promise<HydrationData> => {
  const url = date ? `/health/hydration/today?date=${date}` : '/health/hydration/today';
  try {
    const response = await api.get(url);
    return response.data.data;
  } catch {
    return { dateKey: '', totalMl: 0, logs: [], goalMl: 2200, percent: 0 };
  }
};

export const logHydration = async (amountMl: number): Promise<HydrationData> => {
  const response = await api.post('/health/hydration/log', { amountMl });
  return response.data.data;
};

export const getWeeklyActions = async () => {
  try {
    const response = await api.get('/health/weekly-actions');
    return response.data.data;
  } catch {
    return {
      recommendations: [],
      alerts: [],
      healthScore: 0,
      hydration: null,
    };
  }
};
