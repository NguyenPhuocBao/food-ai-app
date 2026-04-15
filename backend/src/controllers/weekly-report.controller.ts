import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getAppUtcOffsetHours,
  shiftAppDays,
  toAppDateKey,
  toAppDayStart,
} from '../utils/timezone.util';
import {
  buildWeeklyRecommendations,
  evaluateDailyHealth,
} from '../services/health-engine.service';
import {
  getHydrationSummaryForRange,
  resolvePersonalTargets,
} from '../services/personalization.service';

const prisma = new PrismaClient();
const OFFSET_HOURS = getAppUtcOffsetHours();

const resolveUserId = (req: any) =>
  (req.user.role === 'ADMIN' && req.query.userId)
    ? parseInt(req.query.userId as string, 10)
    : req.user.id;

const getWeekRange = (anchor?: string | Date) => {
  const base = toAppDayStart(anchor || new Date());
  const baseInLocal = new Date(base.getTime() + OFFSET_HOURS * 60 * 60 * 1000);
  const weekday = baseInLocal.getUTCDay();
  const weekStart = shiftAppDays(base, -weekday);
  const weekEndExclusive = shiftAppDays(weekStart, 7);
  const weekEnd = new Date(weekEndExclusive.getTime() - 1);
  return { weekStart, weekEnd, weekEndExclusive };
};

const computeWeeklySnapshot = async (userId: number, weekStart: Date, weekEndExclusive: Date) => {
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      eatenAt: { gte: weekStart, lt: weekEndExclusive },
    },
    select: {
      id: true,
      eatenAt: true,
      calories: true,
      protein: true,
      fat: true,
      carbs: true,
      mealType: true,
      foodId: true,
      notes: true,
      food: {
        select: {
          name: true,
          category: true,
          description: true,
        },
      },
    },
  });

  const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = shiftAppDays(weekStart, index);
    return {
      date: toAppDateKey(date),
      day: dayLabels[index],
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      meals: 0,
    };
  });

  const dayMap = new Map(daily.map((item) => [item.date, item]));
  meals.forEach((meal) => {
    const key = toAppDateKey(meal.eatenAt);
    const bucket = dayMap.get(key);
    if (!bucket) return;
    bucket.calories += meal.calories;
    bucket.protein += meal.protein;
    bucket.fat += meal.fat;
    bucket.carbs += meal.carbs;
    bucket.meals += 1;
  });

  const totals = daily.reduce((acc, day) => ({
    calories: acc.calories + day.calories,
    protein: acc.protein + day.protein,
    fat: acc.fat + day.fat,
    carbs: acc.carbs + day.carbs,
    meals: acc.meals + day.meals,
    activeDays: acc.activeDays + (day.calories > 0 ? 1 : 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, meals: 0, activeDays: 0 });

  const divisor = totals.activeDays || 1;
  const average = {
    calories: Math.round(totals.calories / divisor),
    protein: Math.round((totals.protein / divisor) * 10) / 10,
    fat: Math.round((totals.fat / divisor) * 10) / 10,
    carbs: Math.round((totals.carbs / divisor) * 10) / 10,
  };

  const bestDay = daily.reduce((best, current) => (current.calories > best.calories ? current : best), daily[0]);
  const worstDay = daily.reduce((worst, current) => (current.calories < worst.calories ? current : worst), daily[0]);

  const dailyHealth = Array.from({ length: 7 }, (_, index) => {
    const dayStart = shiftAppDays(weekStart, index);
    const nextDay = shiftAppDays(dayStart, 1);
    const dayMeals = meals.filter((meal) => meal.eatenAt >= dayStart && meal.eatenAt < nextDay);
    return evaluateDailyHealth(dayStart, dayMeals as any);
  });

  const [targets, hydrationSummary] = await Promise.all([
    resolvePersonalTargets(userId),
    getHydrationSummaryForRange(userId, weekStart, weekEndExclusive),
  ]);

  const weeklyHealth = buildWeeklyRecommendations(dailyHealth, targets.targetCalories, {
    avgMl: hydrationSummary.avgMl,
    goalMl: targets.routine.waterGoalMl,
  });

  return {
    avgCalories: average.calories,
    avgProtein: average.protein,
    avgFat: average.fat,
    avgCarbs: average.carbs,
    reportData: {
      totals,
      average,
      daily,
      bestDay,
      worstDay,
      dailyHealth,
      healthScore: weeklyHealth.avgScore,
      alerts: weeklyHealth.alerts,
      recommendations: weeklyHealth.recommendations,
      hydration: {
        ...hydrationSummary,
        goalMl: targets.routine.waterGoalMl,
      },
      target: {
        calories: targets.targetCalories,
        protein: targets.targetProtein,
        fat: targets.targetFat,
        carbs: targets.targetCarbs,
      },
      generatedAt: new Date().toISOString(),
    },
  };
};

export const generateWeeklyReport = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const anchorDate = (req.body?.date || req.query?.date) as string | undefined;
    const { weekStart, weekEnd, weekEndExclusive } = getWeekRange(anchorDate ? String(anchorDate) : undefined);
    const snapshot = await computeWeeklySnapshot(userId, weekStart, weekEndExclusive);

    const existing = await prisma.weeklyReport.findFirst({
      where: { userId, weekStart },
      orderBy: { createdAt: 'desc' },
    });

    const report = existing
      ? await prisma.weeklyReport.update({
          where: { id: existing.id },
          data: { weekEnd, ...snapshot },
        })
      : await prisma.weeklyReport.create({
          data: {
            userId,
            weekStart,
            weekEnd,
            ...snapshot,
          },
        });

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyReports = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const limit = Math.max(1, Math.min(52, Number(req.query.limit || 12)));

    const reports = await prisma.weeklyReport.findMany({
      where: { userId },
      orderBy: [{ weekStart: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLatestWeeklyReport = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);

    const report = await prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: [{ weekStart: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: report || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteWeeklyReport = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const reportId = parseInt(req.params.id, 10);
    if (!Number.isFinite(reportId)) return res.status(400).json({ error: 'Invalid report id' });

    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, userId },
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    await prisma.weeklyReport.delete({ where: { id: reportId } });
    res.json({ success: true, message: 'Weekly report deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
