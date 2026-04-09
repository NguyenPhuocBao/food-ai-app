import { Response } from 'express';
import { GoalType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalize = (value: string) => value.toLowerCase().trim();

const scoreByGoal = (goalType: GoalType | null, food: any) => {
  const proteinDensity = food.calories > 0 ? food.protein / food.calories : 0;

  switch (goalType) {
    case 'WEIGHT_LOSS':
      return Math.max(0, 24 - food.calories / 15) + proteinDensity * 800;
    case 'WEIGHT_GAIN':
      return food.calories / 18 + proteinDensity * 500;
    case 'MUSCLE_GAIN':
      return proteinDensity * 1200 + food.protein;
    case 'MAINTENANCE':
    default:
      return 12 - Math.abs(food.calories - 450) / 40 + proteinDensity * 600;
  }
};

const scoreByDietaryPreference = (dietaryPref: string[], food: any) => {
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

const scoreByAllergy = (allergies: string[], food: any) => {
  if (!allergies.length) return 0;

  const foodText = normalize(`${food.name} ${food.category || ''}`);
  const matched = allergies
    .map((item) => normalize(item))
    .filter((item) => item && foodText.includes(item));

  if (matched.length > 0) return -100;
  return 0;
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

    const scoredFoods = foods
      .map((food) => {
        const goalScore = scoreByGoal(goalType, food);
        const dietaryScore = scoreByDietaryPreference(dietaryPref, food);
        const allergyScore = scoreByAllergy(allergies, food);
        const favoriteScore = favoriteIds.has(food.id) ? 12 : 0;
        const recentPenalty = recentFoodIds.has(food.id) ? -10 : 6;
        const popularityScore = Math.min(12, (food.popularity || 0) / 8);

        const score = goalScore + dietaryScore + allergyScore + favoriteScore + recentPenalty + popularityScore;
        const reasons: string[] = [];

        if (favoriteIds.has(food.id)) reasons.push('duoc ban yeu thich');
        if (!recentFoodIds.has(food.id)) reasons.push('chua an gan day');
        if (goalType === 'MUSCLE_GAIN' && food.protein >= 20) reasons.push('protein cao');
        if (goalType === 'WEIGHT_LOSS' && food.calories <= 450) reasons.push('calo phu hop giam can');
        if (food.isVegan && dietaryPref.some((item) => normalize(item).includes('vegan'))) reasons.push('hop che do vegan');
        if (!reasons.length) reasons.push('phu hop muc tieu hien tai');

        return {
          food,
          score,
          reason: reasons.slice(0, 2).join(', '),
        };
      })
      .filter((item) => item.score > -50)
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

