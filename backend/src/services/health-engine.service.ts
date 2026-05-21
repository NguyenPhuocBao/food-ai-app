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
    mealRoles?: string[] | null;
    cookingMethod?: string | null;
    portionType?: string | null;
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
  'bong cai',
  'dua chuot',
  'nam',
  'sup rau',
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

const HEALTHY_COOKING_KEYWORDS = ['luoc', 'hap', 'nuong', 'ap chao', 'salad', 'canh'];
const OILY_COOKING_KEYWORDS = ['chien', 'ran', 'xao', 'xoi mo', 'xoi mỡ', 'fried'];
const PROTEIN_KEYWORDS = ['ga', 'bo', 'thit', 'ca', 'tom', 'muc', 'trung', 'dau hu', 'tofu', 'chicken', 'beef', 'fish', 'shrimp'];
const STAPLE_KEYWORDS = ['com', 'bun', 'pho', 'mi', 'mien', 'banh mi', 'khoai', 'xoi', 'rice', 'noodle'];

const normalize = (value?: string | null) => (value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const toTextBlob = (meal: MealInputForHealth) =>
  [meal.food?.name, meal.food?.category, meal.food?.description, meal.food?.cookingMethod, meal.food?.portionType, meal.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const hasAnyKeyword = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(normalize(keyword)));
const hasFoodRole = (meal: MealInputForHealth, role: string) => meal.food?.mealRoles?.includes(role) || false;
const isFullMeal = (meal: MealInputForHealth) => meal.food?.portionType === 'FULL_MEAL';

const aggregateMealsByType = (meals: MealInputForHealth[]): MealInputForHealth[] => {
  const grouped = new Map<MealType, MealInputForHealth[]>();
  meals.forEach((meal) => {
    grouped.set(meal.mealType, [...(grouped.get(meal.mealType) || []), meal]);
  });

  return Array.from(grouped.entries()).map(([mealType, items]) => {
    const first = items[0];
    const names = items.map((item) => item.food?.name).filter(Boolean).join(', ');
    const categories = items.map((item) => item.food?.category).filter(Boolean).join(', ');
    const descriptions = items.map((item) => item.food?.description).filter(Boolean).join(' ');
    const roles = Array.from(new Set(items.flatMap((item) => item.food?.mealRoles || [])));
    const portionTypes = Array.from(new Set(items.map((item) => item.food?.portionType).filter(Boolean)));
    const cookingMethods = Array.from(new Set(items.map((item) => item.food?.cookingMethod).filter(Boolean)));

    return {
      id: first.id,
      mealType,
      eatenAt: first.eatenAt,
      calories: items.reduce((sum, item) => sum + Number(item.calories || 0), 0),
      protein: items.reduce((sum, item) => sum + Number(item.protein || 0), 0),
      fat: items.reduce((sum, item) => sum + Number(item.fat || 0), 0),
      carbs: items.reduce((sum, item) => sum + Number(item.carbs || 0), 0),
      notes: items.map((item) => item.notes).filter(Boolean).join(' '),
      food: {
        name: names,
        category: categories,
        description: descriptions,
        mealRoles: roles,
        cookingMethod: cookingMethods.join(' '),
        portionType: portionTypes.includes('FULL_MEAL') ? 'FULL_MEAL' : portionTypes[0] || null,
      },
    };
  });
};

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
      return { min: 250, max: 650 };
    case 'LUNCH':
      return { min: 400, max: 850 };
    case 'DINNER':
      return { min: 320, max: 750 };
    case 'SNACK':
    default:
      return { min: 80, max: 320 };
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
  const hasVegetable =
    hasAnyKeyword(textBlob, VEG_KEYWORDS) ||
    hasFoodRole(meal, 'SIDE') ||
    hasFoodRole(meal, 'SOUP');
  const hasProtein =
    Number(meal.protein || 0) >= (meal.mealType === 'SNACK' ? 5 : 14) ||
    hasAnyKeyword(textBlob, PROTEIN_KEYWORDS) ||
    hasFoodRole(meal, 'MAIN');
  const hasStaple =
    hasAnyKeyword(textBlob, STAPLE_KEYWORDS) ||
    hasFoodRole(meal, 'STAPLE');
  const saltyRisk = hasAnyKeyword(textBlob, SALTY_KEYWORDS);
  const healthyCooking = hasAnyKeyword(textBlob, HEALTHY_COOKING_KEYWORDS);
  const oilyCooking = hasAnyKeyword(textBlob, OILY_COOKING_KEYWORDS);

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
    balanceBonus: 0,
  };

  const range = mealCalorieRange(meal.mealType);
  const calorieDelta = meal.calories < range.min
    ? range.min - meal.calories
    : meal.calories > range.max
      ? meal.calories - range.max
      : 0;

  const allowedTolerance = meal.mealType === 'SNACK' ? 80 : 140;
  scoreParts.caloriePenalty = calorieDelta > allowedTolerance
    ? Math.min(18, (calorieDelta - allowedTolerance) / 28)
    : 0;

  const macroCalories = Math.max(1, meal.protein * 4 + meal.fat * 9 + meal.carbs * 4);
  const proteinCalorieRatio = (meal.protein * 4) / macroCalories;
  const fatCalorieRatio = (meal.fat * 9) / macroCalories;
  const carbCalorieRatio = (meal.carbs * 4) / macroCalories;

  if (meal.mealType !== 'SNACK' && !hasProtein) scoreParts.macroPenalty += 10;
  if (meal.mealType !== 'SNACK' && proteinCalorieRatio < 0.12) scoreParts.macroPenalty += 5;
  if (fatCalorieRatio > 0.45) scoreParts.macroPenalty += 8;
  if (meal.mealType !== 'SNACK' && carbCalorieRatio > 0.7 && !hasProtein) scoreParts.macroPenalty += 6;

  if ((meal.mealType === 'LUNCH' || meal.mealType === 'DINNER') && !hasVegetable && !isFullMeal(meal)) {
    scoreParts.veggiePenalty += 8;
  }

  if (saltyRisk) scoreParts.saltyPenalty += 10;
  if (oilyCooking && meal.fat >= 18) scoreParts.saltyPenalty += 6;
  if (lateNight && meal.mealType !== 'BREAKFAST') scoreParts.latePenalty += 18;

  if (hasProtein && meal.protein >= 18) scoreParts.proteinBonus += 5;
  if ((meal.mealType === 'LUNCH' || meal.mealType === 'DINNER') && hasProtein && hasStaple && hasVegetable) {
    scoreParts.balanceBonus += 7;
  }
  if (healthyCooking && !oilyCooking) scoreParts.balanceBonus += 3;

  const rawScore =
    scoreParts.base -
    scoreParts.caloriePenalty -
    scoreParts.macroPenalty -
    scoreParts.veggiePenalty -
    scoreParts.saltyPenalty -
    scoreParts.latePenalty +
    scoreParts.proteinBonus +
    scoreParts.balanceBonus;

  const score = clampScore(rawScore);
  const alerts: string[] = [];
  const positives: string[] = [];

  if (scoreParts.veggiePenalty > 0) alerts.push('Bua chinh nen them mot phan rau hoac canh rau.');
  if (scoreParts.saltyPenalty >= 10) alerts.push('Mon an co dau hieu nhieu muoi/dau mo, nen can doi o bua tiep theo.');
  if (scoreParts.latePenalty > 0) alerts.push('An dem muon, de anh huong giac ngu.');
  if (scoreParts.caloriePenalty >= 10) alerts.push('Tong calo cua bua nay lech kha xa khung bua an thong thuong.');
  if (meal.mealType !== 'SNACK' && !hasProtein) alerts.push('Bua chinh thieu nguon dam ro rang.');

  if (scoreParts.proteinBonus > 0) positives.push('Protein tot cho hoi phuc va co bap.');
  if (hasVegetable) positives.push('Co rau/canh giup bua an can bang hon.');
  if (hasProtein && hasStaple && (meal.mealType === 'LUNCH' || meal.mealType === 'DINNER')) positives.push('Bua chinh co cau truc dam + tinh bot hop ly.');
  if (!saltyRisk && !oilyCooking) positives.push('Khong co dau hieu qua man hoac qua dau mo.');

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
      recommendations: ['Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac.'],
      mealScores: [],
      stats: {
        meals: 0,
        veggieMeals: 0,
        saltyMeals: 0,
        lateMeals: 0,
      },
    };
  }

  const mealGroups = aggregateMealsByType(meals);
  const mealScores = mealGroups.map(evaluateMealHealth);
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

  const mainMealCount = mealGroups.filter((meal) => meal.mealType === 'LUNCH' || meal.mealType === 'DINNER').length;
  const mainMealsWithVeg = mealScores.filter((item) => (
    item.signals.hasVegetable &&
    mealGroups.find((meal) => meal.id === item.mealId && (meal.mealType === 'LUNCH' || meal.mealType === 'DINNER'))
  )).length;

  if (mainMealCount >= 2 && mainMealsWithVeg === 0) {
    alerts.add('Bua trua va bua toi chua co rau/canh ro rang.');
  }
  if (stats.saltyMeals >= 2) {
    alerts.add('Nhieu bua an co nguy co qua man hoac nhieu dau mo trong ngay.');
  }
  if (stats.lateMeals >= 1) {
    alerts.add('Can giam tan suat an dem de cai thien phuc hoi.');
  }

  const recommendations: string[] = [];
  if (mainMealCount > 0 && mainMealsWithVeg < mainMealCount) {
    recommendations.push('Neu bua chinh chua co rau, hay them 1 phan rau luoc/canh rau/salad nho.');
  }
  if (stats.saltyMeals > 0) {
    recommendations.push('Can doi mon kho/chien/xao bang mon luoc, hap hoac canh trong bua tiep theo.');
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
