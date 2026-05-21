import { Response } from 'express';
import { NotificationType, PrismaClient } from '@prisma/client';
import {
  buildWeeklyRecommendations,
  evaluateDailyHealth,
  evaluateMealHealth,
} from '../services/health-engine.service';
import {
  addHydrationLog,
  getHydrationRecord,
  getHydrationSummaryForRange,
  resolvePersonalTargets,
  updatePersonalRoutine,
} from '../services/personalization.service';
import {
  getAppUtcOffsetHours,
  shiftAppDays,
  toAppDayRange,
  toAppDayStart,
  toAppDateKey,
} from '../utils/timezone.util';
import { sendNoMealReminderEmail } from '../services/email.service';

const prisma = new PrismaClient();
const OFFSET_HOURS = getAppUtcOffsetHours();

const resolveUserId = (req: any) =>
  req.user.role === 'ADMIN' && req.query.userId
    ? parseInt(req.query.userId as string, 10)
    : req.user.id;

const REMINDER_SETTING_GROUP = 'runtime';
const DAILY_ENGAGEMENT_KEY_PREFIX = 'daily_engagement';

const markEngagementReminderSent = async (key: string) => {
  await prisma.systemSetting.upsert({
    where: { key },
    update: {
      value: String(Date.now()),
      group: REMINDER_SETTING_GROUP,
      updatedAt: new Date(),
    },
    create: {
      key,
      value: String(Date.now()),
      group: REMINDER_SETTING_GROUP,
    },
  });
};

const runDailyEngagementCheck = async (userId: number) => {
  const todayStart = toAppDayStart(new Date());
  const yesterdayStart = shiftAppDays(todayStart, -1);
  const yesterdayEnd = todayStart;
  const dateKey = toAppDateKey(yesterdayStart);
  const notifyKey = `${DAILY_ENGAGEMENT_KEY_PREFIX}:no_meal_notification:${dateKey}:${userId}`;
  const emailKey = `${DAILY_ENGAGEMENT_KEY_PREFIX}:no_meal_email:${dateKey}:${userId}`;

  const [mealCount, sentRows, user] = await Promise.all([
    prisma.meal.count({
      where: {
        userId,
        eatenAt: { gte: yesterdayStart, lt: yesterdayEnd },
      },
    }),
    prisma.systemSetting.findMany({
      where: {
        group: REMINDER_SETTING_GROUP,
        key: { in: [notifyKey, emailKey] },
      },
      select: { key: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, isActive: true, role: true },
    }),
  ]);

  if (mealCount > 0 || !user?.isActive || user.role !== 'USER') return;

  const sentKeys = new Set(sentRows.map((row) => row.key));
  if (!sentKeys.has(notifyKey)) {
    await prisma.notification.create({
      data: {
        userId,
        title: 'Hom qua ban chua ghi bua an nao',
        message: `FoodAI chua ghi nhan bua an nao trong ngay ${dateKey}. Hay ghi nhat ky de he thong theo doi dinh duong chinh xac hon.`,
        type: NotificationType.WARNING,
        data: {
          source: 'daily_engagement',
          reminderType: 'no_meal_previous_day',
          dateKey,
        },
      },
    });
    await markEngagementReminderSent(notifyKey);
  }

  if (!sentKeys.has(emailKey)) {
    const sent = await sendNoMealReminderEmail({
      toEmail: user.email,
      userName: user.name,
      dateKey,
    });
    if (sent) {
      await markEngagementReminderSent(emailKey);
    }
  }
};

const getWeekRange = (anchor?: Date | string) => {
  const dayStart = toAppDayStart(anchor || new Date());
  const localized = new Date(dayStart.getTime() + OFFSET_HOURS * 60 * 60 * 1000);
  const weekday = localized.getUTCDay();
  const weekStart = shiftAppDays(dayStart, -weekday);
  const weekEndExclusive = shiftAppDays(weekStart, 7);
  return { weekStart, weekEndExclusive };
};

const fallbackError = (res: Response, scope: string, fallbackData: any) =>
  res.status(200).json({
    success: false,
    fallback: true,
    scope,
    data: fallbackData,
  });

export const getMealHealth = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const mealId = parseInt(req.params.id, 10);

    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        ...(req.user.role === 'ADMIN' ? {} : { userId }),
      },
      include: {
        food: {
          select: {
            name: true,
            category: true,
            description: true,
            mealRoles: true,
            cookingMethod: true,
            portionType: true,
          },
        },
      },
    });

    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    const result = evaluateMealHealth(meal);
    res.json({ success: true, data: result });
  } catch (error) {
    fallbackError(res, 'meal', {
      score: 0,
      grade: 'D',
      alerts: ['Khong th? phan tich bua an luc nay.'],
      positives: [],
    });
  }
};

export const getDailyHealth = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const date = String(req.query.date || new Date().toISOString());
    const { start, endExclusive } = toAppDayRange(date);
    const shouldRunEngagementCheck = toAppDateKey(start) === toAppDateKey(new Date());

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        eatenAt: { gte: start, lt: endExclusive },
      },
      orderBy: { eatenAt: 'asc' },
      include: {
        food: {
          select: {
            name: true,
            category: true,
            description: true,
            mealRoles: true,
            cookingMethod: true,
            portionType: true,
          },
        },
      },
    });

    const [dailyHealth, hydration, targets] = await Promise.all([
      Promise.resolve(evaluateDailyHealth(date, meals)),
      getHydrationRecord(userId, date),
      resolvePersonalTargets(userId),
      shouldRunEngagementCheck ? runDailyEngagementCheck(userId).catch((error) => {
        console.error('[daily-engagement] check failed:', error);
      }) : Promise.resolve(),
    ]);

    res.json({
      success: true,
      data: {
        ...dailyHealth,
        hydration: {
          totalMl: hydration.totalMl,
          goalMl: targets.routine.waterGoalMl,
          percent: Math.min(100, Math.round((hydration.totalMl / Math.max(1, targets.routine.waterGoalMl)) * 100)),
        },
      },
    });
  } catch (error) {
    fallbackError(res, 'daily', {
      score: 0,
      grade: 'D',
      alerts: ['Khong th? lay du lieu suc khoe hom nay.'],
      highlights: [],
      recommendations: [],
      mealScores: [],
      stats: { meals: 0, veggieMeals: 0, saltyMeals: 0, lateMeals: 0 },
      hydration: { totalMl: 0, goalMl: 2200, percent: 0 },
    });
  }
};

export const getWeeklyHealth = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const anchorDate = (req.query.date || req.body?.date || new Date()) as string | Date;
    const { weekStart, weekEndExclusive } = getWeekRange(anchorDate);

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        eatenAt: { gte: weekStart, lt: weekEndExclusive },
      },
      orderBy: { eatenAt: 'asc' },
      include: {
        food: {
          select: {
            name: true,
            category: true,
            description: true,
          },
        },
      },
    });

    const dailyResults = Array.from({ length: 7 }, (_, index) => {
      const dayStart = shiftAppDays(weekStart, index);
      const nextDay = shiftAppDays(dayStart, 1);
      const dayMeals = meals.filter((meal) => meal.eatenAt >= dayStart && meal.eatenAt < nextDay);
      return evaluateDailyHealth(dayStart, dayMeals);
    });

    const [targets, hydrationSummary] = await Promise.all([
      resolvePersonalTargets(userId),
      getHydrationSummaryForRange(userId, weekStart, weekEndExclusive),
    ]);

    const weeklySummary = buildWeeklyRecommendations(dailyResults, targets.targetCalories, {
      avgMl: hydrationSummary.avgMl,
      goalMl: targets.routine.waterGoalMl,
    });

    res.json({
      success: true,
      data: {
        weekStart,
        weekEndExclusive,
        daily: dailyResults,
        summary: {
          ...weeklySummary,
          hydration: {
            ...hydrationSummary,
            goalMl: targets.routine.waterGoalMl,
          },
        },
      },
    });
  } catch (error) {
    fallbackError(res, 'weekly', {
      daily: [],
      summary: {
        avgScore: 0,
        alerts: ['Khong th? tong hop suc khoe tuan nay.'],
        recommendations: ['Hay tiep tuc ghi nhat ky de he thong phan tich lai.'],
        hydration: { totalMl: 0, days: 7, avgMl: 0, goalMl: 2200 },
      },
    });
  }
};

export const getPersonalization = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const data = await resolvePersonalTargets(userId);
    res.json({ success: true, data });
  } catch (error) {
    fallbackError(res, 'personalization', {
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
    });
  }
};

export const updateRoutine = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const routine = await updatePersonalRoutine(userId, req.body || {});
    res.json({ success: true, data: routine });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Cannot update routine' });
  }
};

export const getHydrationToday = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const date = String(req.query.date || new Date().toISOString());
    const [record, targets] = await Promise.all([
      getHydrationRecord(userId, date),
      resolvePersonalTargets(userId),
    ]);

    const goalMl = targets.routine.waterGoalMl;
    res.json({
      success: true,
      data: {
        ...record,
        goalMl,
        percent: Math.min(100, Math.round((record.totalMl / Math.max(1, goalMl)) * 100)),
      },
    });
  } catch (error) {
    fallbackError(res, 'hydration', {
      dateKey: '',
      totalMl: 0,
      logs: [],
      goalMl: 2200,
      percent: 0,
    });
  }
};

export const logHydration = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const amountMl = Number(req.body?.amountMl || 250);

    const [record, targets] = await Promise.all([
      addHydrationLog(userId, amountMl),
      resolvePersonalTargets(userId),
    ]);

    const goalMl = targets.routine.waterGoalMl;

    res.json({
      success: true,
      data: {
        ...record,
        goalMl,
        percent: Math.min(100, Math.round((record.totalMl / Math.max(1, goalMl)) * 100)),
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Cannot log hydration' });
  }
};

export const getWeeklyActions = async (req: any, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const report = await prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: [{ weekStart: 'desc' }, { createdAt: 'desc' }],
    });

    if (!report) {
      return res.json({
        success: true,
        data: {
          recommendations: ['Chua co weekly report. Hay tao report de nhan khuyen nghi cu the.'],
          alerts: [],
          healthScore: 0,
        },
      });
    }

    const reportData = (report.reportData || {}) as any;
    res.json({
      success: true,
      data: {
        recommendations: reportData.recommendations || [],
        alerts: reportData.alerts || [],
        healthScore: reportData.healthScore || 0,
        hydration: reportData.hydration || null,
        weekStart: report.weekStart,
        weekEnd: report.weekEnd,
      },
    });
  } catch (error) {
    fallbackError(res, 'weekly-actions', {
      recommendations: ['Khong th? lay khuyen nghi tuan nay.'],
      alerts: [],
      healthScore: 0,
    });
  }
};
