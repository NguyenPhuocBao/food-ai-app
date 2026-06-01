import { toAppDayStart } from '../utils/timezone.util';
import prisma from '../lib/prisma';

export const normalizeToDayStart = (value: Date | string) => {
  return toAppDayStart(value);
};

const AUTO_APPLIED_MEAL_PLAN_NOTE_PREFIX = 'Auto-applied from meal plan:';

const cleanupOrphanAutoAppliedMealPlanMeals = async (userId: number, date: Date, nextDate: Date) => {
  await prisma.meal.deleteMany({
    where: {
      userId,
      eatenAt: {
        gte: date,
        lt: nextDate,
      },
      isFromAI: true,
      notes: { startsWith: AUTO_APPLIED_MEAL_PLAN_NOTE_PREFIX },
      mealPlanId: { equals: null },


    },
  });
};

export const recalculateDailyNutrition = async (userId: number, dateValue: Date | string) => {
  const date = normalizeToDayStart(dateValue);
  const nextDate = new Date(date.getTime() + 86400000);

  await cleanupOrphanAutoAppliedMealPlanMeals(userId, date, nextDate);

  const dailyMeals = await prisma.meal.findMany({
    where: {
      userId,
      eatenAt: {
        gte: date,
        lt: nextDate,
      },
    },
  });

  if (dailyMeals.length === 0) {
    await prisma.dailyNutrition.deleteMany({
      where: {
        userId,
        date,
      },
    });

    return null;
  }

  const totals = dailyMeals.reduce(
    (acc, meal) => ({
      totalCalories: acc.totalCalories + meal.calories,
      totalProtein: acc.totalProtein + meal.protein,
      totalFat: acc.totalFat + meal.fat,
      totalCarbs: acc.totalCarbs + meal.carbs,
      totalMeals: acc.totalMeals + 1,
    }),
    { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 }
  );

  return prisma.dailyNutrition.upsert({
    where: { userId_date: { userId, date } },
    update: totals,
    create: { userId, date, ...totals },
  });
};
