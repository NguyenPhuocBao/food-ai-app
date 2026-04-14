import { Response } from 'express';
import { GoalType, MealType, PrismaClient } from '@prisma/client';
import { toAppDateKey, toAppDayRange } from '../utils/timezone.util';
import { recalculateDailyNutrition } from '../services/nutrition.service';

const prisma = new PrismaClient();
const SHOPPING_LIST_KEY_PREFIX = 'shopping_list';

const getShoppingListKey = (userId: number, mealPlanId: number) =>
  `${SHOPPING_LIST_KEY_PREFIX}:user:${userId}:plan:${mealPlanId}`;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');

const toShoppingItemKey = (name: string, unit?: string | null) =>
  `${normalizeToken(name)}__${normalizeToken(unit || 'item')}`;

const AUTO_MEAL_TYPES: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK];
const MEAL_CALORIE_RATIO: Record<MealType, number> = {
  [MealType.BREAKFAST]: 0.25,
  [MealType.LUNCH]: 0.35,
  [MealType.DINNER]: 0.3,
  [MealType.SNACK]: 0.1,
};
const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

type MacroGoalTemplate = GoalType | 'AUTO';
type MacroStrategy = 'AUTO' | 'BALANCED' | 'HIGH_PROTEIN' | 'LOW_CARB';
type MacroTargets = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const normalizeGoalTemplate = (value: unknown, fallback?: GoalType) => {
  if (!value || value === 'AUTO') return fallback;
  if (value === GoalType.WEIGHT_LOSS) return GoalType.WEIGHT_LOSS;
  if (value === GoalType.WEIGHT_GAIN) return GoalType.WEIGHT_GAIN;
  if (value === GoalType.MAINTENANCE) return GoalType.MAINTENANCE;
  if (value === GoalType.MUSCLE_GAIN) return GoalType.MUSCLE_GAIN;
  return fallback;
};

const normalizeMacroStrategy = (value: unknown): MacroStrategy => {
  if (value === 'BALANCED') return 'BALANCED';
  if (value === 'HIGH_PROTEIN') return 'HIGH_PROTEIN';
  if (value === 'LOW_CARB') return 'LOW_CARB';
  return 'AUTO';
};

const toPositiveNumber = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
};

const roundToHalf = (value: number) => Math.round(value * 2) / 2;

const clampDays = (value: number) => {
  if (!Number.isFinite(value)) return 7;
  if (value < 1) return 1;
  if (value > 14) return 14;
  return Math.floor(value);
};

const toStartOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const addDays = (value: Date, days: number) => {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
};

const MEAL_DEFAULT_HOUR: Record<MealType, number> = {
  [MealType.BREAKFAST]: 8,
  [MealType.LUNCH]: 12,
  [MealType.DINNER]: 19,
  [MealType.SNACK]: 16,
};

const applyMacroRatio = (calories: number, ratio: { protein: number; carbs: number; fat: number }): MacroTargets => ({
  calories,
  protein: Number(((calories * ratio.protein) / CALORIES_PER_GRAM.protein).toFixed(1)),
  carbs: Number(((calories * ratio.carbs) / CALORIES_PER_GRAM.carbs).toFixed(1)),
  fat: Number(((calories * ratio.fat) / CALORIES_PER_GRAM.fat).toFixed(1)),
});

const getBaseRatioByGoalType = (goalType: GoalType | undefined) => {
  switch (goalType) {
    case GoalType.WEIGHT_LOSS:
      return { protein: 0.35, carbs: 0.3, fat: 0.35 };
    case GoalType.WEIGHT_GAIN:
      return { protein: 0.25, carbs: 0.5, fat: 0.25 };
    case GoalType.MUSCLE_GAIN:
      return { protein: 0.35, carbs: 0.45, fat: 0.2 };
    case GoalType.MAINTENANCE:
    default:
      return { protein: 0.3, carbs: 0.4, fat: 0.3 };
  }
};

const applyMacroStrategy = (
  base: { protein: number; carbs: number; fat: number },
  strategy: MacroStrategy
) => {
  if (strategy === 'HIGH_PROTEIN') return { protein: 0.4, carbs: 0.3, fat: 0.3 };
  if (strategy === 'LOW_CARB') return { protein: 0.35, carbs: 0.25, fat: 0.4 };
  if (strategy === 'BALANCED') return { protein: 0.3, carbs: 0.4, fat: 0.3 };
  return base;
};

const buildDailyMacroTargets = (params: {
  calories: number;
  goalType?: GoalType;
  macroStrategy: MacroStrategy;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
}): MacroTargets => {
  const ratio = applyMacroStrategy(getBaseRatioByGoalType(params.goalType), params.macroStrategy);
  const auto = applyMacroRatio(params.calories, ratio);

  return {
    calories: params.calories,
    protein: Number(params.targetProtein ?? auto.protein),
    fat: Number(params.targetFat ?? auto.fat),
    carbs: Number(params.targetCarbs ?? auto.carbs),
  };
};

const toMealMacroTargets = (daily: MacroTargets, mealType: MealType): MacroTargets => {
  const ratio = MEAL_CALORIE_RATIO[mealType] || 0.25;
  return {
    calories: Number((daily.calories * ratio).toFixed(1)),
    protein: Number((daily.protein * ratio).toFixed(1)),
    fat: Number((daily.fat * ratio).toFixed(1)),
    carbs: Number((daily.carbs * ratio).toFixed(1)),
  };
};

type FoodCandidate = {
  id: number;
  name: string;
  category: string | null;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const pickFoodForMeal = (
  foods: FoodCandidate[],
  mealType: MealType,
  target: MacroTargets,
  usedCounter: Map<number, number>
) => {
  const keywordsByMeal: Record<MealType, string[]> = {
    [MealType.BREAKFAST]: ['sang', 'breakfast'],
    [MealType.LUNCH]: ['trua', 'lunch'],
    [MealType.DINNER]: ['toi', 'dinner'],
    [MealType.SNACK]: ['snack', 'fruit', 'dessert'],
  };

  const keywords = keywordsByMeal[mealType];
  const byCategory = foods.filter((food) => {
    const category = (food.category || '').toLowerCase();
    return keywords.some((keyword) => category.includes(keyword));
  });

  const pool = byCategory.length >= 5 ? byCategory : foods;

  const scored = pool
    .map((food) => {
      const used = usedCounter.get(food.id) || 0;
      const suggestedQuantity = Math.max(0.5, Math.min(3, roundToHalf(target.calories / Number(food.calories || 1))));
      const predictedCalories = Number(food.calories || 0) * suggestedQuantity;
      const predictedProtein = Number(food.protein || 0) * suggestedQuantity;
      const predictedFat = Number(food.fat || 0) * suggestedQuantity;
      const predictedCarbs = Number(food.carbs || 0) * suggestedQuantity;

      const calorieGap = Math.abs(predictedCalories - target.calories);
      const proteinGap = Math.abs(predictedProtein - target.protein) * 5;
      const fatGap = Math.abs(predictedFat - target.fat) * 4;
      const carbsGap = Math.abs(predictedCarbs - target.carbs) * 3;
      const varietyPenalty = used * 120;
      const snackPenalty = mealType === MealType.SNACK && Number(food.calories || 0) > 450 ? 180 : 0;
      const score = calorieGap + proteinGap + fatGap + carbsGap + varietyPenalty + snackPenalty;
      return { food, score };
    })
    .sort((a, b) => a.score - b.score);

  const topCandidates = scored.slice(0, Math.min(3, scored.length));
  if (topCandidates.length === 0) return null;

  return topCandidates[Math.floor(Math.random() * topCandidates.length)].food;
};

const getAppDayOfWeek = (value: Date) => {
  const [year, month, day] = toAppDateKey(value).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

const loadCheckedItemKeys = async (userId: number, mealPlanId: number) => {
  const row = await prisma.systemSetting.findUnique({
    where: { key: getShoppingListKey(userId, mealPlanId) },
    select: { value: true },
  });

  if (!row?.value) return new Set<string>();

  try {
    const parsed = JSON.parse(row.value);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.filter((value) => typeof value === 'string'));
  } catch {
    return new Set<string>();
  }
};

const saveCheckedItemKeys = async (userId: number, mealPlanId: number, checkedKeys: Set<string>) => {
  const key = getShoppingListKey(userId, mealPlanId);
  await prisma.systemSetting.upsert({
    where: { key },
    update: {
      value: JSON.stringify(Array.from(checkedKeys)),
      group: 'shopping_list',
    },
    create: {
      key,
      value: JSON.stringify(Array.from(checkedKeys)),
      group: 'shopping_list',
    },
  });
};

// Lấy tất cả meal plans của user
export const getMealPlans = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const plans = await prisma.mealPlan.findMany({
      where: { userId },
      include: {
        details: {
          include: { food: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy meal plan đang active
export const getActiveMealPlan = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const plan = await prisma.mealPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        details: {
          include: { food: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
    });
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo meal plan mới
export const createMealPlan = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, startDate, endDate } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, startDate, endDate' });
    }
    const plan = await prisma.mealPlan.create({
      data: {
        userId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: false,
      },
      include: { details: { include: { food: true } } },
    });
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm món vào meal plan
export const addDetailToMealPlan = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { foodId, mealType, dayOfWeek, quantity } = req.body;

    const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    const detail = await prisma.mealPlanDetail.create({
      data: {
        mealPlanId: parseInt(id),
        foodId,
        mealType,
        dayOfWeek,
        quantity: quantity || 1,
      },
      include: { food: true },
    });
    res.json({ success: true, data: detail });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Bật/tắt meal plan (set active)
export const setActiveMealPlan = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    // Tắt tất cả plan khác của user
    await prisma.mealPlan.updateMany({ where: { userId }, data: { isActive: false } });

    // Bật plan được chọn
    const updated = await prisma.mealPlan.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
      include: { details: { include: { food: true } } },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Xoá meal plan
export const deleteMealPlan = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    await prisma.mealPlan.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Meal plan deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMealPlanShoppingList = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const mealPlanId = parseInt(req.params.id, 10);
    const dayOfWeekRaw = req.query.dayOfWeek;

    if (!Number.isFinite(mealPlanId)) {
      return res.status(400).json({ error: 'Invalid meal plan id' });
    }

    const dayOfWeek =
      dayOfWeekRaw !== undefined && dayOfWeekRaw !== null && dayOfWeekRaw !== ''
        ? Number(dayOfWeekRaw)
        : null;

    if (dayOfWeek !== null && (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6)) {
      return res.status(400).json({ error: 'dayOfWeek must be between 0 and 6' });
    }

    const plan = await prisma.mealPlan.findFirst({
      where: { id: mealPlanId, userId },
      include: {
        details: {
          include: {
            food: {
              include: {
                recipe: {
                  include: {
                    ingredients: true,
                  },
                },
              },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    const details =
      dayOfWeek === null ? plan.details : plan.details.filter((detail) => detail.dayOfWeek === dayOfWeek);

    const itemMap = new Map<
      string,
      {
        itemKey: string;
        name: string;
        unit: string;
        amount: number;
        recipeCount: number;
      }
    >();

    for (const detail of details as any[]) {
      const foodName = detail.food?.name || 'Unknown food';
      const quantityMultiplier = Number(detail.quantity || 1);
      const ingredients = detail.food?.recipe?.ingredients || [];

      if (ingredients.length > 0) {
        for (const ingredient of ingredients) {
          const unit = ingredient.unit || 'item';
          const itemKey = toShoppingItemKey(ingredient.name, unit);
          const baseAmount = Number(ingredient.amount || 0);
          const amount = Number((baseAmount * quantityMultiplier).toFixed(2));

          if (!itemMap.has(itemKey)) {
            itemMap.set(itemKey, {
              itemKey,
              name: ingredient.name,
              unit,
              amount: 0,
              recipeCount: 0,
            });
          }

          const current = itemMap.get(itemKey)!;
          current.amount = Number((current.amount + amount).toFixed(2));
          current.recipeCount += 1;
        }
      } else {
        const itemKey = toShoppingItemKey(foodName, 'khau phan');
        if (!itemMap.has(itemKey)) {
          itemMap.set(itemKey, {
            itemKey,
            name: foodName,
            unit: 'khau phan',
            amount: 0,
            recipeCount: 0,
          });
        }

        const current = itemMap.get(itemKey)!;
        current.amount = Number((current.amount + quantityMultiplier).toFixed(2));
        current.recipeCount += 1;
      }
    }

    const checkedKeys = await loadCheckedItemKeys(userId, mealPlanId);
    const items = Array.from(itemMap.values())
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      .map((item) => ({
        ...item,
        checked: checkedKeys.has(item.itemKey),
      }));

    const checkedCount = items.filter((item) => item.checked).length;

    res.json({
      success: true,
      data: {
        mealPlanId: plan.id,
        mealPlanName: plan.name,
        dayOfWeek,
        totalItems: items.length,
        checkedItems: checkedCount,
        completionRate: items.length ? Number(((checkedCount / items.length) * 100).toFixed(1)) : 0,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleShoppingListItem = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const mealPlanId = parseInt(req.params.id, 10);
    const { itemKey, checked } = req.body;

    if (!Number.isFinite(mealPlanId)) {
      return res.status(400).json({ error: 'Invalid meal plan id' });
    }
    if (!itemKey || typeof itemKey !== 'string') {
      return res.status(400).json({ error: 'itemKey is required' });
    }

    const plan = await prisma.mealPlan.findFirst({
      where: { id: mealPlanId, userId },
      select: { id: true },
    });
    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    const checkedKeys = await loadCheckedItemKeys(userId, mealPlanId);
    if (checked) checkedKeys.add(itemKey);
    else checkedKeys.delete(itemKey);

    await saveCheckedItemKeys(userId, mealPlanId, checkedKeys);

    res.json({ success: true, data: { itemKey, checked: !!checked } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resetShoppingListChecks = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const mealPlanId = parseInt(req.params.id, 10);

    if (!Number.isFinite(mealPlanId)) {
      return res.status(400).json({ error: 'Invalid meal plan id' });
    }

    const plan = await prisma.mealPlan.findFirst({
      where: { id: mealPlanId, userId },
      select: { id: true },
    });
    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    await prisma.systemSetting.deleteMany({
      where: { key: getShoppingListKey(userId, mealPlanId) },
    });

    res.json({ success: true, message: 'Shopping list checks reset' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMealPlanInsights = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const mealPlanId = parseInt(req.params.id, 10);

    if (!Number.isFinite(mealPlanId)) {
      return res.status(400).json({ error: 'Invalid meal plan id' });
    }

    const plan = await prisma.mealPlan.findFirst({
      where: { id: mealPlanId, userId },
      include: { details: true },
    });
    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    const now = new Date();
    const appDayOfWeek = getAppDayOfWeek(now);
    const todayPlannedDetails = plan.details.filter((detail) => detail.dayOfWeek === appDayOfWeek);
    const { start, endExclusive } = toAppDayRange(now);

    const todayMeals = await prisma.meal.findMany({
      where: {
        userId,
        eatenAt: { gte: start, lt: endExclusive },
      },
      select: {
        foodId: true,
        mealType: true,
      },
    });

    const plannedSlotMap = new Map<string, number>();
    todayPlannedDetails.forEach((detail) => {
      const key = `${detail.foodId}:${detail.mealType}`;
      plannedSlotMap.set(key, (plannedSlotMap.get(key) || 0) + 1);
    });

    let completed = 0;
    todayMeals.forEach((meal) => {
      const key = `${meal.foodId}:${meal.mealType}`;
      const remain = plannedSlotMap.get(key) || 0;
      if (remain > 0) {
        completed += 1;
        plannedSlotMap.set(key, remain - 1);
      }
    });

    const planned = todayPlannedDetails.length;

    res.json({
      success: true,
      data: {
        mealPlanId: plan.id,
        dateKey: toAppDateKey(now),
        plannedMealsToday: planned,
        completedMealsToday: completed,
        adherenceRateToday: planned > 0 ? Number(((completed / planned) * 100).toFixed(1)) : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const applyActiveMealPlanToday = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const appDayOfWeek = getAppDayOfWeek(now);
    const { start, endExclusive } = toAppDayRange(now);

    const activePlan = await prisma.mealPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        details: {
          where: { dayOfWeek: appDayOfWeek },
          include: { food: true },
          orderBy: { mealType: 'asc' },
        },
      },
    });

    if (!activePlan) {
      return res.status(404).json({ error: 'No active meal plan found' });
    }

    if (!activePlan.details.length) {
      return res.status(400).json({
        error: 'Active meal plan has no meals for today',
        data: { mealPlanId: activePlan.id, dayOfWeek: appDayOfWeek },
      });
    }

    const existingMeals = await prisma.meal.findMany({
      where: {
        userId,
        eatenAt: { gte: start, lt: endExclusive },
      },
      select: {
        foodId: true,
        mealType: true,
      },
    });

    const existingCountMap = new Map<string, number>();
    existingMeals.forEach((meal) => {
      const key = `${meal.foodId}:${meal.mealType}`;
      existingCountMap.set(key, (existingCountMap.get(key) || 0) + 1);
    });

    const consumedExistingMap = new Map<string, number>();
    const createdMeals: any[] = [];
    const skippedMeals: Array<{ foodId: number; mealType: MealType; reason: string }> = [];
    const mealOrderMap = new Map<MealType, number>();

    for (const detail of activePlan.details as any[]) {
      const key = `${detail.foodId}:${detail.mealType}`;
      const existing = existingCountMap.get(key) || 0;
      const consumed = consumedExistingMap.get(key) || 0;

      if (consumed < existing) {
        consumedExistingMap.set(key, consumed + 1);
        skippedMeals.push({
          foodId: detail.foodId,
          mealType: detail.mealType,
          reason: 'already_exists_today',
        });
        continue;
      }

      const mealType = detail.mealType as MealType;
      const order = mealOrderMap.get(mealType) || 0;
      mealOrderMap.set(mealType, order + 1);

      const eatenAt = new Date(start.getTime() + (MEAL_DEFAULT_HOUR[mealType] * 60 + order * 15) * 60000);
      const quantity = Number(detail.quantity || 1);

      const meal = await prisma.meal.create({
        data: {
          userId,
          foodId: detail.foodId,
          mealType,
          eatenAt,
          quantity,
          calories: Math.round(Number(detail.food.calories || 0) * quantity),
          protein: Number((Number(detail.food.protein || 0) * quantity).toFixed(2)),
          fat: Number((Number(detail.food.fat || 0) * quantity).toFixed(2)),
          carbs: Number((Number(detail.food.carbs || 0) * quantity).toFixed(2)),
          notes: `Auto-applied from meal plan: ${activePlan.name}`,
          isFromAI: true,
        },
      });

      createdMeals.push(meal);
    }

    await recalculateDailyNutrition(userId, now);

    res.json({
      success: true,
      data: {
        mealPlanId: activePlan.id,
        mealPlanName: activePlan.name,
        appliedDate: toAppDateKey(now),
        createdCount: createdMeals.length,
        skippedCount: skippedMeals.length,
        skippedMeals,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateAutoMealPlan = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      name,
      startDate,
      endDate,
      days,
      activate = true,
      includeSnack = true,
      goalTemplate = 'AUTO',
      macroStrategy = 'AUTO',
      targetCalories: targetCaloriesOverride,
      targetProtein: targetProteinOverride,
      targetFat: targetFatOverride,
      targetCarbs: targetCarbsOverride,
    } = req.body || {};

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        goals: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const activeGoal = user.goals?.[0];
    const selectedGoalType = normalizeGoalTemplate(goalTemplate as MacroGoalTemplate, activeGoal?.goalType);
    const normalizedMacroStrategy = normalizeMacroStrategy(macroStrategy);
    const targetCalories = Number(
      toPositiveNumber(targetCaloriesOverride) ||
      activeGoal?.targetCalories ||
      user.profile?.targetCalories ||
      2000
    );
    const dailyMacroTargets = buildDailyMacroTargets({
      calories: targetCalories,
      goalType: selectedGoalType,
      macroStrategy: normalizedMacroStrategy,
      targetProtein:
        toPositiveNumber(targetProteinOverride) ||
        toPositiveNumber(activeGoal?.targetProtein) ||
        toPositiveNumber(user.profile?.targetProtein),
      targetFat:
        toPositiveNumber(targetFatOverride) ||
        toPositiveNumber(activeGoal?.targetFat) ||
        toPositiveNumber(user.profile?.targetFat),
      targetCarbs:
        toPositiveNumber(targetCarbsOverride) ||
        toPositiveNumber(activeGoal?.targetCarbs) ||
        toPositiveNumber(user.profile?.targetCarbs),
    });
    const dietaryPrefs = (user.profile?.dietaryPref || []).map((item: string) => item.toLowerCase());

    const computedStart = startDate ? toStartOfDay(new Date(startDate)) : toStartOfDay(new Date());
    if (Number.isNaN(computedStart.getTime())) {
      return res.status(400).json({ error: 'Invalid startDate' });
    }

    let computedEnd: Date;
    if (endDate) {
      computedEnd = toStartOfDay(new Date(endDate));
      if (Number.isNaN(computedEnd.getTime())) {
        return res.status(400).json({ error: 'Invalid endDate' });
      }
    } else {
      const totalDays = clampDays(Number(days || 7));
      computedEnd = addDays(computedStart, totalDays - 1);
    }

    if (computedEnd < computedStart) {
      return res.status(400).json({ error: 'endDate must be >= startDate' });
    }

    const totalDays = clampDays(
      Math.floor((computedEnd.getTime() - computedStart.getTime()) / (24 * 60 * 60 * 1000)) + 1
    );
    computedEnd = addDays(computedStart, totalDays - 1);

    const foodWhere: any = { calories: { gt: 0 } };
    if (dietaryPrefs.some((pref: string) => pref.includes('vegan'))) {
      foodWhere.isVegan = true;
    } else if (dietaryPrefs.some((pref: string) => pref.includes('vegetarian') || pref.includes('chay'))) {
      foodWhere.isVegetarian = true;
    }
    if (dietaryPrefs.some((pref: string) => pref.includes('gluten'))) {
      foodWhere.isGlutenFree = true;
    }

    let foods = await prisma.foodItem.findMany({
      where: foodWhere,
      select: {
        id: true,
        name: true,
        category: true,
        calories: true,
        protein: true,
        fat: true,
        carbs: true,
      },
    });

    if (foods.length < 10) {
      foods = await prisma.foodItem.findMany({
        where: { calories: { gt: 0 } },
        select: {
          id: true,
          name: true,
          category: true,
          calories: true,
          protein: true,
          fat: true,
          carbs: true,
        },
      });
    }

    if (!foods.length) {
      return res.status(400).json({ error: 'No food data available to generate plan' });
    }

    const usedCounter = new Map<number, number>();
    const mealTypes = includeSnack
      ? AUTO_MEAL_TYPES
      : AUTO_MEAL_TYPES.filter((mealType) => mealType !== MealType.SNACK);

    const detailsData: Array<{
      dayOfWeek: number;
      mealType: MealType;
      foodId: number;
      quantity: number;
    }> = [];

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
      const currentDate = addDays(computedStart, dayOffset);
      const dayOfWeek = currentDate.getDay();

      for (const mealType of mealTypes) {
        const targetMeal = toMealMacroTargets(dailyMacroTargets, mealType);
        const selectedFood = pickFoodForMeal(foods, mealType, targetMeal, usedCounter);
        if (!selectedFood) continue;

        const rawQuantity = targetMeal.calories / Number(selectedFood.calories || 1);
        const quantity = Math.max(0.5, Math.min(3, roundToHalf(rawQuantity)));

        detailsData.push({
          dayOfWeek,
          mealType,
          foodId: selectedFood.id,
          quantity,
        });

        usedCounter.set(selectedFood.id, (usedCounter.get(selectedFood.id) || 0) + 1);
      }
    }

    const fallbackName = `Auto Plan ${toAppDateKey(computedStart)} - ${toAppDateKey(computedEnd)}`;
    const planName = (name || '').trim() || fallbackName;

    const createdPlan = await prisma.$transaction(async (tx) => {
      if (activate) {
        await tx.mealPlan.updateMany({
          where: { userId },
          data: { isActive: false },
        });
      }

      const plan = await tx.mealPlan.create({
        data: {
          userId,
          name: planName,
          startDate: computedStart,
          endDate: computedEnd,
          isActive: !!activate,
        },
      });

      if (detailsData.length) {
        await tx.mealPlanDetail.createMany({
          data: detailsData.map((detail) => ({
            mealPlanId: plan.id,
            foodId: detail.foodId,
            mealType: detail.mealType,
            dayOfWeek: detail.dayOfWeek,
            quantity: detail.quantity,
          })),
        });
      }

      return tx.mealPlan.findUnique({
        where: { id: plan.id },
        include: {
          details: {
            include: { food: true },
            orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
          },
        },
      });
    });

    res.json({
      success: true,
      data: createdPlan,
      meta: {
        targetCalories,
        goalType: selectedGoalType || GoalType.MAINTENANCE,
        macroStrategy: normalizedMacroStrategy,
        targetProtein: dailyMacroTargets.protein,
        targetFat: dailyMacroTargets.fat,
        targetCarbs: dailyMacroTargets.carbs,
        totalDays,
        mealsPerDay: mealTypes.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
