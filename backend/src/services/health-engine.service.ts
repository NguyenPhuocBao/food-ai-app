import { MealType } from '@prisma/client';
import { getAppTimeZone, toAppDateKey } from '../utils/timezone.util';

export type MealInputForHealth = {
  id: number;
  mealType: MealType;
  eatenAt: Date | string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes?: string | null;
  food?: {
    name?: string | null;
    category?: string | null;
    description?: string | null;
  } | null;
};

export type MealHealthResult = {
  mealId: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  alerts: string[];
  positives: string[];
  signals: {
    hasVegetable: boolean;
    saltyRisk: boolean;
    lateNight: boolean;
    calorieDelta: number;
  };
};

export type DailyHealthResult = {
  date: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  alerts: string[];
  highlights: string[];
  recommendations: string[];
  mealScores: MealHealthResult[];
  stats: {
    meals: number;
    veggieMeals: number;
    saltyMeals: number;
    lateMeals: number;
  };
};

const VEG_KEYWORDS = [
  'rau',
  'salad',
  'vegetable',
  'cai',
  'bi',
  'dua leo',
  'ca chua',
  'rau muong',
  'rau cai',
  'rau xanh',
  'canh rau',
];

const SALTY_KEYWORDS = [
  'muoi',
  'man',
  'nuoc mam',
  'mam tom',
  'kho quet',
  'xuc xich',
  'mi goi',
  'kim chi',
  'ca kho',
  'thit kho',
  'do hop',
  'cha bong',
  'ca muoi',
];

const normalize = (value?: string | null) => (value || '').toLowerCase();

const toTextBlob = (meal: MealInputForHealth) =>
  [meal.food?.name, meal.food?.category, meal.food?.description, meal.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const getLocalHour = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: getAppTimeZone(),
    hour12: false,
    hour: '2-digit',
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === 'hour')?.value || '0');
};

const mealCalorieRange = (mealType: MealType) => {
  switch (mealType) {
    case 'BREAKFAST':
      return { min: 300, max: 650 };
    case 'LUNCH':
      return { min: 450, max: 850 };
    case 'DINNER':
      return { min: 350, max: 750 };
    case 'SNACK':
    default:
      return { min: 100, max: 350 };
  }
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const toGrade = (score: number): 'A' | 'B' | 'C' | 'D' => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
};

export const evaluateMealHealth = (meal: MealInputForHealth): MealHealthResult => {
  const textBlob = toTextBlob(meal);
  const hasVegetable = VEG_KEYWORDS.some((keyword) => textBlob.includes(keyword));
  const saltyRisk = SALTY_KEYWORDS.some((keyword) => textBlob.includes(keyword));

  const hour = getLocalHour(meal.eatenAt);
  const lateNight = hour >= 22 || hour <= 4;

  const scoreParts = {
    base: 100,
    caloriePenalty: 0,
    macroPenalty: 0,
    veggiePenalty: 0,
    saltyPenalty: 0,
    latePenalty: 0,
    proteinBonus: 0,
  };

  const range = mealCalorieRange(meal.mealType);
  const calorieDelta = meal.calories < range.min
    ? range.min - meal.calories
    : meal.calories > range.max
      ? meal.calories - range.max
      : 0;

  scoreParts.caloriePenalty = Math.min(24, calorieDelta / 20);

  const totalMacro = Math.max(1, meal.protein + meal.fat + meal.carbs);
  const proteinRatio = meal.protein / totalMacro;
  const fatRatio = meal.fat / totalMacro;

  if (proteinRatio < 0.18) scoreParts.macroPenalty += 8;
  if (fatRatio > 0.38) scoreParts.macroPenalty += 8;

  if ((meal.mealType === 'LUNCH' || meal.mealType === 'DINNER') && !hasVegetable) {
    scoreParts.veggiePenalty += 14;
  }

  if (saltyRisk) scoreParts.saltyPenalty += 14;
  if (lateNight && meal.mealType !== 'BREAKFAST') scoreParts.latePenalty += 18;

  if (meal.protein >= 22) scoreParts.proteinBonus += 5;

  const rawScore =
    scoreParts.base -
    scoreParts.caloriePenalty -
    scoreParts.macroPenalty -
    scoreParts.veggiePenalty -
    scoreParts.saltyPenalty -
    scoreParts.latePenalty +
    scoreParts.proteinBonus;

  const score = clampScore(rawScore);
  const alerts: string[] = [];
  const positives: string[] = [];

  if (scoreParts.veggiePenalty > 0) alerts.push('Thieu rau xanh trong bua an.');
  if (scoreParts.saltyPenalty > 0) alerts.push('Mon an co dau hieu qua man.');
  if (scoreParts.latePenalty > 0) alerts.push('An dem muon, de anh huong giac ngu.');
  if (scoreParts.caloriePenalty > 12) alerts.push('Luong calo bua an lech nhieu so voi khung de xuat.');

  if (scoreParts.proteinBonus > 0) positives.push('Protein tot cho hoi phuc va co bap.');
  if (hasVegetable) positives.push('Da bo sung rau xanh.');
  if (!saltyRisk) positives.push('Khong co dau hieu mon man cao.');

  return {
    mealId: meal.id,
    score,
    grade: toGrade(score),
    alerts,
    positives,
    signals: {
      hasVegetable,
      saltyRisk,
      lateNight,
      calorieDelta,
    },
  };
};

export const buildWeeklyRecommendations = (
  dailyResults: DailyHealthResult[],
  targetCalories: number,
  hydration: { avgMl: number; goalMl: number }
) => {
  const recommendations: string[] = [];
  const alerts = new Set<string>();

  const activeDays = dailyResults.filter((item) => item.stats.meals > 0);
  const avgScore = activeDays.length > 0
    ? activeDays.reduce((sum, item) => sum + item.score, 0) / activeDays.length
    : 0;

  if (avgScore < 70) {
    recommendations.push('Uu tien can doi bua chinh: them rau + nguon dam nac trong bua trua/toi.');
  }

  const lateDays = dailyResults.filter((item) => item.stats.lateMeals > 0).length;
  if (lateDays >= 2) {
    alerts.add('Tan suat an dem cao. Nen chot bua toi truoc 20:30.');
  }

  const saltyDays = dailyResults.filter((item) => item.stats.saltyMeals >= 2).length;
  if (saltyDays >= 2) {
    alerts.add('Nhieu bua co nguy co man cao. Giam nuoc cham/do kho trong tuan toi.');
  }

  const lowVegDays = dailyResults.filter((item) => item.stats.meals > 0 && item.stats.veggieMeals / item.stats.meals < 0.4).length;
  if (lowVegDays >= 3) {
    alerts.add('Rau xanh chua dat tan suat on dinh. Muc tieu toi thieu 2 bua co rau moi ngay.');
  }

  if (hydration.goalMl > 0 && hydration.avgMl < hydration.goalMl * 0.75) {
    recommendations.push(`Tang nuoc uong: hien tai trung binh ${Math.round(hydration.avgMl)}ml/ngay, muc tieu ${hydration.goalMl}ml.`);
  }

  if (!recommendations.length) {
    recommendations.push('Duy tri nhip an hien tai va theo doi chat luong bua an moi ngay de giu diem on dinh.');
  }

  return {
    avgScore: Math.round(avgScore),
    alerts: Array.from(alerts),
    recommendations,
    targetCalories,
  };
};

export const evaluateDailyHealth = (date: Date | string, meals: MealInputForHealth[]): DailyHealthResult => {
  if (!meals.length) {
    return {
      date: toAppDateKey(date),
      score: 0,
      grade: 'D',
      alerts: ['Chua co du lieu bua an trong ngay.'],
      highlights: [],
      recommendations: ['Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan goi y chinh xac.'],
      mealScores: [],
      stats: {
        meals: 0,
        veggieMeals: 0,
        saltyMeals: 0,
        lateMeals: 0,
      },
    };
  }

  const mealScores = meals.map(evaluateMealHealth);
  const stats = mealScores.reduce(
    (acc, item) => ({
      meals: acc.meals + 1,
      veggieMeals: acc.veggieMeals + (item.signals.hasVegetable ? 1 : 0),
      saltyMeals: acc.saltyMeals + (item.signals.saltyRisk ? 1 : 0),
      lateMeals: acc.lateMeals + (item.signals.lateNight ? 1 : 0),
    }),
    { meals: 0, veggieMeals: 0, saltyMeals: 0, lateMeals: 0 }
  );

  const score = clampScore(mealScores.reduce((sum, item) => sum + item.score, 0) / mealScores.length);
  const alerts = new Set<string>();
  const highlights = new Set<string>();

  mealScores.forEach((item) => {
    item.alerts.forEach((alert) => alerts.add(alert));
    item.positives.forEach((positive) => highlights.add(positive));
  });

  if (stats.meals > 0 && stats.veggieMeals / stats.meals < 0.4) {
    alerts.add('Ti le bua an co rau xanh thap hon muc khuyen nghi.');
  }
  if (stats.saltyMeals >= 2) {
    alerts.add('Nhieu bua an co nguy co qua man trong ngay.');
  }
  if (stats.lateMeals >= 1) {
    alerts.add('Can giam tan suat an dem de cai thien phuc hoi.');
  }

  const recommendations: string[] = [];
  if (stats.veggieMeals / Math.max(1, stats.meals) < 0.5) {
    recommendations.push('Them 1 phan rau/canh rau cho bua trua va bua toi.');
  }
  if (stats.saltyMeals > 0) {
    recommendations.push('Giam mon kho/man, uu tien luoc/hap trong bua tiep theo.');
  }
  if (stats.lateMeals > 0) {
    recommendations.push('Dat gio an toi truoc 20:30, tranh snack sau 22:00.');
  }
  if (!recommendations.length) {
    recommendations.push('Bua an hom nay can bang, tiep tuc duy tri.');
  }

  return {
    date: toAppDateKey(date),
    score,
    grade: toGrade(score),
    alerts: Array.from(alerts),
    highlights: Array.from(highlights).slice(0, 4),
    recommendations,
    mealScores,
    stats,
  };
};

export const normalizeGoalCalories = (value?: number | null) => {
  if (!value || value <= 0) return 2000;
  return Math.max(1200, Math.min(4500, Math.round(value)));
};
