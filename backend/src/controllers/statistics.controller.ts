import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  ONE_DAY_MS,
  getAppUtcOffsetHours,
  shiftAppDays,
  toAppDateKey,
  toAppDayStart,
} from '../utils/timezone.util';

const prisma = new PrismaClient();
const VN_UTC_OFFSET_HOURS = getAppUtcOffsetHours();
const toVnDateKey = toAppDateKey;
const toVnDayStart = toAppDayStart;

export const getDailyStats = async (req: any, res: Response) => {
  try {
    const { date } = req.query;
    const userId = (req.user.role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId as string) 
      : req.user.id;
    
    const targetDate = toVnDayStart(date ? String(date) : new Date());
    
    const nutrition = await prisma.dailyNutrition.findUnique({
      where: { userId_date: { userId, date: targetDate } }
    });
    
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    
    const goal = profile ? {
      calories: profile.targetCalories,
      protein: profile.targetProtein,
      fat: profile.targetFat,
      carbs: profile.targetCarbs
    } : { calories: 2000, protein: 150, fat: 55, carbs: 250 };
    
    const progress = nutrition ? {
      calories: Math.min(100, Math.round((nutrition.totalCalories / goal.calories) * 100)),
      protein: Math.min(100, Math.round((nutrition.totalProtein / goal.protein) * 100)),
      fat: Math.min(100, Math.round((nutrition.totalFat / goal.fat) * 100)),
      carbs: Math.min(100, Math.round((nutrition.totalCarbs / goal.carbs) * 100))
    } : { calories: 0, protein: 0, fat: 0, carbs: 0 };
    
    res.json({
      success: true,
      data: {
        date: targetDate,
        nutrition: nutrition || { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 },
        goal,
        progress,
        remaining: {
          calories: goal.calories - (nutrition?.totalCalories || 0),
          protein: goal.protein - (nutrition?.totalProtein || 0),
          fat: goal.fat - (nutrition?.totalFat || 0),
          carbs: goal.carbs - (nutrition?.totalCarbs || 0)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyStats = async (req: any, res: Response) => {
  try {
    const userId = (req.user.role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId as string) 
      : req.user.id;

    {
      const todayStart = toVnDayStart(new Date());
      const todayInVn = new Date(todayStart.getTime() + VN_UTC_OFFSET_HOURS * 60 * 60 * 1000);
      const weekday = todayInVn.getUTCDay();
      const startOfWeek = shiftAppDays(todayStart, -weekday);
      const endExclusive = shiftAppDays(startOfWeek, 7);
      const endOfWeek = new Date(endExclusive.getTime() - 1);

      const meals = await prisma.meal.findMany({
        where: {
          userId,
          eatenAt: {
            gte: startOfWeek,
            lt: endExclusive,
          },
        },
        select: {
          eatenAt: true,
          calories: true,
          protein: true,
          fat: true,
          carbs: true,
        },
      });

      const dayNames = ['Ch盻ｧ nh蘯ｭt', 'Th盻ｩ 2', 'Th盻ｩ 3', 'Th盻ｩ 4', 'Th盻ｩ 5', 'Th盻ｩ 6', 'Th盻ｩ 7'];
      const normalizedDayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dailyData = [] as Array<{
        date: string;
        day: string;
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
      }>;
      const dailyMap = new Map<string, (typeof dailyData)[number]>();

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek.getTime() + i * ONE_DAY_MS);
        const key = toVnDateKey(date);
        const bucket = {
          date: key,
          day: normalizedDayNames[i],
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
        };
        dailyData.push(bucket);
        dailyMap.set(key, bucket);
      }

      meals.forEach((meal) => {
        const key = toVnDateKey(meal.eatenAt);
        const bucket = dailyMap.get(key);
        if (!bucket) return;
        bucket.calories += meal.calories;
        bucket.protein += meal.protein;
        bucket.fat += meal.fat;
        bucket.carbs += meal.carbs;
      });

      const totals = dailyData.reduce((acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        fat: acc.fat + day.fat,
        carbs: acc.carbs + day.carbs,
        days: acc.days + (day.calories > 0 ? 1 : 0),
      }), { calories: 0, protein: 0, fat: 0, carbs: 0, days: 0 });

      const avg = totals.days > 0 ? {
        calories: Math.round(totals.calories / totals.days),
        protein: Math.round((totals.protein / totals.days) * 10) / 10,
        fat: Math.round((totals.fat / totals.days) * 10) / 10,
        carbs: Math.round((totals.carbs / totals.days) * 10) / 10,
      } : { calories: 0, protein: 0, fat: 0, carbs: 0 };

      return res.json({
        success: true,
        data: {
          week: { start: startOfWeek, end: endOfWeek },
          daily: dailyData,
          summary: {
            total: totals,
            average: avg,
            bestDay: dailyData.reduce((best, day) => (day.calories > best.calories ? day : best), dailyData[0]),
            worstDay: dailyData.reduce((worst, day) => (day.calories < worst.calories ? day : worst), dailyData[0]),
          },
        },
      });
    }
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const nutritionData = await prisma.dailyNutrition.findMany({
      where: { userId, date: { gte: startOfWeek, lte: endOfWeek } },
      orderBy: { date: 'asc' }
    });
    
    const dailyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const data = nutritionData.find(n => n.date.toDateString() === date.toDateString());
      dailyData.push({
        date: toVnDateKey(date),
        day: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][i],
        calories: data?.totalCalories || 0,
        protein: data?.totalProtein || 0,
        fat: data?.totalFat || 0,
        carbs: data?.totalCarbs || 0
      });
    }
    
    const totals = nutritionData.reduce((acc, n) => ({
      calories: acc.calories + n.totalCalories,
      protein: acc.protein + n.totalProtein,
      fat: acc.fat + n.totalFat,
      carbs: acc.carbs + n.totalCarbs,
      days: acc.days + 1
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, days: 0 });
    
    const avg = totals.days > 0 ? {
      calories: Math.round(totals.calories / totals.days),
      protein: Math.round(totals.protein / totals.days * 10) / 10,
      fat: Math.round(totals.fat / totals.days * 10) / 10,
      carbs: Math.round(totals.carbs / totals.days * 10) / 10
    } : { calories: 0, protein: 0, fat: 0, carbs: 0 };
    
    res.json({
      success: true,
      data: {
        week: { start: startOfWeek, end: endOfWeek },
        daily: dailyData,
        summary: {
          total: totals,
          average: avg,
          bestDay: dailyData.reduce((best, d) => d.calories > best.calories ? d : best, dailyData[0]),
          worstDay: dailyData.reduce((worst, d) => d.calories < worst.calories ? d : worst, dailyData[0])
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyStats = async (req: any, res: Response) => {
  try {
    const { month } = req.query;
    const userId = (req.user.role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId as string) 
      : req.user.id;
    
    let targetDate = new Date();
    if (typeof month === 'string' && month.trim()) {
      const raw = month.trim();
      if (/^\d{4}-\d{2}$/.test(raw)) {
        targetDate = new Date(`${raw}-01T00:00:00.000Z`);
      } else {
        targetDate = new Date(raw);
      }
    }

    const [targetYear, targetMonth] = toVnDateKey(targetDate).split('-').map(Number);
    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1, -VN_UTC_OFFSET_HOURS, 0, 0, 0));
    const endExclusive = new Date(Date.UTC(targetYear, targetMonth, 1, -VN_UTC_OFFSET_HOURS, 0, 0, 0));
    
    const nutritionData = await prisma.dailyNutrition.findMany({
      where: { userId, date: { gte: startOfMonth, lt: endExclusive } },
      orderBy: { date: 'asc' }
    });
    
    const totals = nutritionData.reduce((acc, n) => ({
      calories: acc.calories + n.totalCalories,
      protein: acc.protein + n.totalProtein,
      fat: acc.fat + n.totalFat,
      carbs: acc.carbs + n.totalCarbs,
      days: acc.days + 1
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, days: 0 });
    
    const avg = totals.days > 0 ? {
      calories: Math.round(totals.calories / totals.days),
      protein: Math.round(totals.protein / totals.days * 10) / 10,
      fat: Math.round(totals.fat / totals.days * 10) / 10,
      carbs: Math.round(totals.carbs / totals.days * 10) / 10
    } : { calories: 0, protein: 0, fat: 0, carbs: 0 };
    
    res.json({
      success: true,
      data: {
        month: { year: targetYear, month: targetMonth },
        days: nutritionData.map(n => ({
          date: toVnDateKey(n.date),
          calories: n.totalCalories,
          protein: n.totalProtein,
          fat: n.totalFat,
          carbs: n.totalCarbs
        })),
        summary: { total: totals, average: avg, daysLogged: totals.days }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrends = async (req: any, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const userId = (req.user.role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId as string) 
      : req.user.id;
    const periodDays = Math.max(1, Math.min(90, Number(days) || 7));

    const todayStart = toVnDayStart(new Date());
    const startDate = shiftAppDays(todayStart, -(periodDays - 1));
    const endExclusive = shiftAppDays(todayStart, 1);
    
    const nutritionData = await prisma.dailyNutrition.findMany({
      where: { userId, date: { gte: startDate, lt: endExclusive } },
      orderBy: { date: 'asc' }
    });
    
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const targetCalories = profile?.targetCalories || 2000;
    
    const nutritionMap = new Map(
      nutritionData.map((item) => [toVnDateKey(item.date), item])
    );

    const trend = Array.from({ length: periodDays }, (_, index) => {
      const currentDate = shiftAppDays(startDate, index);
      const key = toVnDateKey(currentDate);
      const item = nutritionMap.get(key);
      const calories = item?.totalCalories || 0;

      return {
        date: key,
        calories,
        vsTarget: calories - targetCalories,
        percentOfTarget: targetCalories > 0 ? Math.round((calories / targetCalories) * 100) : 0,
      };
    });

    const loggedDays = trend.filter((item) => item.calories > 0);
    const average = loggedDays.length > 0
      ? loggedDays.reduce((sum, item) => sum + item.calories, 0) / loggedDays.length
      : 0;
    
    res.json({
      success: true,
      data: {
        period: `${periodDays} ngay`,
        trend,
        average,
        target: targetCalories,
        insight: average > targetCalories ? 'Ban dang an nhieu hon muc tieu' : average < targetCalories ? 'Ban dang an it hon muc tieu' : 'Ban dang dat muc tieu'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
