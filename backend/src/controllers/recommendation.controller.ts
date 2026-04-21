import { Response } from 'express';
import { GoalType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type FoodCandidate = {
  id: number;
  name: string;
  category?: string | null;
  description?: string | null;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  popularity?: number | null;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));
const toFoodText = (food: FoodCandidate) => normalize(`${food.name} ${food.category || ''} ${food.description || ''}`);

const HEALTHY_KEYWORDS = ['luoc', 'hap', 'nuong', 'salad', 'rau', 'canh', 'boiled', 'steamed', 'grilled'];
const VEGETABLE_KEYWORDS = ['rau', 'salad', 'cu', 'qua', 'vegetable', 'xanh'];
const UNHEALTHY_KEYWORDS = [
  'chien',
  'ran',
  'xao',
  'deep fry',
  'fried',
  'tra sua',
  'nuoc ngot',
  'ga ran',
  'xuc xich',
  'khoai tay chien',
  'kem',
  'do an nhanh',
  'fast food',
];
const WEIGHT_GAIN_SUPPORT_KEYWORDS = [
  'com',
  'com trang',
  'gao',
  'banh mi',
  'khoai',
  'oat',
  'yen mach',
  'bo',
  'trung',
  'sinh to',
  'fruit',
  'trai cay',
  'hoa qua',
];
const RICE_FRUIT_KEYWORDS = ['com trang', 'trai cay dia', 'dia trai cay', 'fruit plate', 'fruit platter'];
const FRUIT_DRINK_KEYWORDS = [
  'trai cay',
  'hoa qua',
  'fruit',
  'nuoc',
  'beverage',
  'drink',
  'juice',
  'smoothie',
  'tra',
  'tea',
  'coffee',
  'cafe',
  'sinh to',
];

const analyzeFood = (food: FoodCandidate) => {
  const text = toFoodText(food);
  const calories = Number(food.calories || 0);
  const protein = Number(food.protein || 0);
  const fat = Number(food.fat || 0);
  const carbs = Number(food.carbs || 0);
  const proteinDensity = calories > 0 ? protein / calories : 0;
  const fatRatioByCalories = calories > 0 ? (fat * 9) / calories : 0;
  const carbRatioByCalories = calories > 0 ? (carbs * 4) / calories : 0;

  const isHealthyStyle = includesAny(text, HEALTHY_KEYWORDS);
  const hasVegetable = includesAny(text, VEGETABLE_KEYWORDS);
  const isUnhealthyStyle = includesAny(text, UNHEALTHY_KEYWORDS);
  const supportsWeightGain = includesAny(text, WEIGHT_GAIN_SUPPORT_KEYWORDS);
  const isRiceOrFruit = includesAny(text, RICE_FRUIT_KEYWORDS);
  const isFruitOrDrink = includesAny(text, FRUIT_DRINK_KEYWORDS);

  return {
    calories,
    protein,
    fat,
    carbs,
    proteinDensity,
    fatRatioByCalories,
    carbRatioByCalories,
    isHealthyStyle,
    hasVegetable,
    isUnhealthyStyle,
    supportsWeightGain,
    isRiceOrFruit,
    isFruitOrDrink,
  };
};

const getPortionMultiplier = (goalType: GoalType | null, food: FoodCandidate) => {
  const analysis = analyzeFood(food);
  if (analysis.isFruitOrDrink) return 1;
  if (goalType === 'WEIGHT_LOSS') return 0.5;
  if (goalType === 'WEIGHT_GAIN' || goalType === 'MUSCLE_GAIN') return 1.5;
  return 1;
};

const scoreByGoal = (goalType: GoalType | null, food: FoodCandidate) => {
  const a = analyzeFood(food);

  switch (goalType) {
    case 'WEIGHT_LOSS': {
      const calorieScore = Math.max(0, 32 - a.calories / 14);
      const proteinScore = a.proteinDensity * 900;
      const veggieScore = a.hasVegetable ? 14 : 0;
      const healthyStyleScore = a.isHealthyStyle ? 10 : 0;
      const unhealthyPenalty = a.isUnhealthyStyle ? 42 : 0;
      const highCalPenalty = a.calories > 650 ? 35 : 0;
      const fatPenalty = a.fatRatioByCalories > 0.42 ? 22 : 0;
      const carbPenalty = a.carbs > 85 ? 12 : 0;
      return calorieScore + proteinScore + veggieScore + healthyStyleScore - unhealthyPenalty - highCalPenalty - fatPenalty - carbPenalty;
    }
    case 'WEIGHT_GAIN': {
      const calorieScore = a.calories / 12;
      const proteinScore = a.proteinDensity * 750 + a.protein * 0.6;
      const healthyStyleScore = a.isHealthyStyle ? 12 : 0;
      const gainSupportScore = a.supportsWeightGain ? 18 : 0;
      const riceFruitBonus = a.isRiceOrFruit ? 10 : 0;
      const lowCalPenalty = a.calories < 180 ? 25 : 0;
      const veryUnhealthyPenalty = a.isUnhealthyStyle ? 28 : 0;
      const lowProteinPenalty = a.protein < 7 ? 12 : 0;
      return calorieScore + proteinScore + healthyStyleScore + gainSupportScore + riceFruitBonus - lowCalPenalty - veryUnhealthyPenalty - lowProteinPenalty;
    }
    case 'MUSCLE_GAIN': {
      const proteinScore = a.proteinDensity * 1400 + a.protein;
      const carbSupportScore = a.carbs >= 22 ? 12 : -8;
      const calorieSupportScore = a.calories >= 180 ? 10 : -14;
      const unhealthyPenalty = a.isUnhealthyStyle ? 24 : 0;
      return proteinScore + carbSupportScore + calorieSupportScore - unhealthyPenalty;
    }
    case 'MAINTENANCE':
    default: {
      const calorieBalance = 14 - Math.abs(a.calories - 420) / 38;
      const proteinScore = a.proteinDensity * 650;
      const healthyStyleScore = a.isHealthyStyle ? 8 : 0;
      const unhealthyPenalty = a.isUnhealthyStyle ? 16 : 0;
      return calorieBalance + proteinScore + healthyStyleScore - unhealthyPenalty;
    }
  }
};

const scoreByDietaryPreference = (dietaryPref: string[], food: FoodCandidate) => {
  if (!dietaryPref.length) return 0;

  let score = 0;
  const pref = dietaryPref.map((item) => normalize(item));

  if (pref.some((item) => item.includes('vegan') || item.includes('thuan chay'))) {
    score += food.isVegan ? 15 : -20;
  }

  if (pref.some((item) => item.includes('vegetarian') || item.includes('chay'))) {
    score += food.isVegetarian ? 10 : -8;
  }

  if (pref.some((item) => item.includes('gluten'))) {
    score += food.isGlutenFree ? 8 : -12;
  }

  return score;
};

const findMatchedAllergies = (allergies: string[], food: FoodCandidate) =>
  allergies
    .map((item) => normalize(item))
    .filter((item) => item && toFoodText(food).includes(item));

const isGoalCompatible = (goalType: GoalType | null, food: FoodCandidate) => {
  const a = analyzeFood(food);

  if (goalType === 'WEIGHT_LOSS') {
    if (a.calories > 680) return false;
    if (a.fat > 32) return false;
    if (a.isUnhealthyStyle && !a.isHealthyStyle) return false;
    return true;
  }

  if (goalType === 'WEIGHT_GAIN') {
    if (a.calories < 140) return false;
    if (a.protein < 6) return false;
    return true;
  }

  if (goalType === 'MUSCLE_GAIN') {
    if (a.protein < 10) return false;
    if (a.calories < 150) return false;
    return true;
  }

  return true;
};

const buildGoalReason = (goalType: GoalType | null, food: FoodCandidate) => {
  const a = analyzeFood(food);
  const reasons: string[] = [];

  if (goalType === 'WEIGHT_GAIN' || goalType === 'MUSCLE_GAIN') {
    if (a.supportsWeightGain) reasons.push('ho tro tang can lanh manh');
    if (a.isHealthyStyle) reasons.push('uu tien cach che bien healthy');
    if (a.isRiceOrFruit) reasons.push('phu hop ket hop com trang/trai cay dia');
  } else if (goalType === 'WEIGHT_LOSS') {
    if (a.hasVegetable) reasons.push('nhieu rau xanh');
    if (a.isHealthyStyle) reasons.push('uu tien luoc/hap/nuong');
    if (a.calories <= 450) reasons.push('muc calo hop ly cho giam can');
  } else {
    reasons.push('can bang cho muc tieu duy tri');
  }

  if (!reasons.length) reasons.push('phu hop muc tieu hien tai');
  return reasons;
};

export const generateRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = Math.max(3, Math.min(20, Number(req.body?.limit || req.query?.limit || 8)));

    const [profile, activeGoal, recentMeals, favorites, foods] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.userGoal.findFirst({
        where: { userId, isActive: true },
        orderBy: { startDate: 'desc' },
      }),
      prisma.meal.findMany({
        where: { userId },
        orderBy: { eatenAt: 'desc' },
        take: 80,
        select: { foodId: true, eatenAt: true },
      }),
      prisma.favorite.findMany({
        where: { userId },
        select: { foodId: true },
      }),
      prisma.foodItem.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          calories: true,
          protein: true,
          fat: true,
          carbs: true,
          imageUrl: true,
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          popularity: true,
        },
      }),
    ]);

    const goalType = activeGoal?.goalType || null;
    const dietaryPref = profile?.dietaryPref || [];
    const allergies = profile?.allergies || [];
    const favoriteIds = new Set(favorites.map((item) => item.foodId));

    const recentCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentFoodIds = new Set(
      recentMeals
        .filter((item) => new Date(item.eatenAt) >= recentCutoff)
        .map((item) => item.foodId)
    );

    const scoredRaw = foods
      .map((food) => {
        const matchedAllergies = findMatchedAllergies(allergies, food);
        const hasAllergyConflict = matchedAllergies.length > 0;
        const goalScore = scoreByGoal(goalType, food);
        const dietaryScore = scoreByDietaryPreference(dietaryPref, food);
        const allergyScore = hasAllergyConflict ? -400 : 0;
        const favoriteScore = favoriteIds.has(food.id) ? 12 : 0;
        const recentPenalty = recentFoodIds.has(food.id) ? -10 : 6;
        const popularityScore = Math.min(12, (food.popularity || 0) / 8);

        const score = goalScore + dietaryScore + allergyScore + favoriteScore + recentPenalty + popularityScore;
        const reasons: string[] = [];
        const portion = getPortionMultiplier(goalType, food);

        reasons.push(...buildGoalReason(goalType, food));
        reasons.push(`khau phan de xuat ${portion.toFixed(1)}x`);
        if (favoriteIds.has(food.id)) reasons.push('duoc ban yeu thich');
        if (!recentFoodIds.has(food.id)) reasons.push('chua an gan day');
        if (food.isVegan && dietaryPref.some((item) => normalize(item).includes('vegan'))) reasons.push('hop che do vegan');
        if (hasAllergyConflict) reasons.push(`khong phu hop di ung: ${matchedAllergies.join(', ')}`);

        return {
          food,
          score,
          reason: Array.from(new Set(reasons)).slice(0, 3).join(', '),
          hasAllergyConflict,
          goalCompatible: isGoalCompatible(goalType, food),
        };
      });

    const strictPool = scoredRaw.filter((item) => !item.hasAllergyConflict && item.goalCompatible);
    const fallbackPool = scoredRaw.filter((item) => !item.hasAllergyConflict);
    const candidatePool = strictPool.length > 0 ? strictPool : fallbackPool;

    const scoredFoods = candidatePool
      .filter((item) => item.score > -80)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (!scoredFoods.length) {
      return res.json({ success: true, data: [] });
    }

    await prisma.recommendation.deleteMany({
      where: {
        userId,
        isViewed: false,
        isAccepted: null,
      },
    });

    await prisma.recommendation.createMany({
      data: scoredFoods.map((item) => ({
        userId,
        foodId: item.food.id,
        reason: item.reason,
        score: Number(item.score.toFixed(2)),
      })),
    });

    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      include: { food: true },
      orderBy: [{ createdAt: 'desc' }, { score: 'desc' }],
      take: limit,
    });

    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
    const status = String(req.query.status || 'all');

    const where: any = { userId };
    if (status === 'new') {
      where.isViewed = false;
      where.isAccepted = null;
    } else if (status === 'accepted') {
      where.isAccepted = true;
    } else if (status === 'rejected') {
      where.isAccepted = false;
    }

    const recommendations = await prisma.recommendation.findMany({
      where,
      include: { food: true },
      orderBy: [{ isViewed: 'asc' }, { score: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markRecommendationViewed = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const recommendationId = parseInt(req.params.id);

    const recommendation = await prisma.recommendation.findFirst({
      where: { id: recommendationId, userId },
    });
    if (!recommendation) return res.status(404).json({ error: 'Recommendation not found' });

    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { isViewed: true },
      include: { food: true },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const respondToRecommendation = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const recommendationId = parseInt(req.params.id);
    const accepted = Boolean(req.body.accepted);

    const recommendation = await prisma.recommendation.findFirst({
      where: { id: recommendationId, userId },
    });
    if (!recommendation) return res.status(404).json({ error: 'Recommendation not found' });

    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        isAccepted: accepted,
        isViewed: true,
      },
      include: { food: true },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
