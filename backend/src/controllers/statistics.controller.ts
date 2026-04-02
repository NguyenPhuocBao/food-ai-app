import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDailyStats = async (req: any, res: Response) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;
    
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
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
    const { week } = req.query;
    const userId = req.user.id;
    
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
        date: date.toISOString().split('T')[0],
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
    const userId = req.user.id;
    
    const targetMonth = month ? new Date(month as string) : new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const nutritionData = await prisma.dailyNutrition.findMany({
      where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
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
        month: { year: targetMonth.getFullYear(), month: targetMonth.getMonth() + 1 },
        days: nutritionData.map(n => ({
          date: n.date,
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
    const userId = req.user.id;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);
    
    const nutritionData = await prisma.dailyNutrition.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });
    
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const targetCalories = profile?.targetCalories || 2000;
    
    const trend = nutritionData.map(n => ({
      date: n.date,
      calories: n.totalCalories,
      vsTarget: n.totalCalories - targetCalories,
      percentOfTarget: Math.round((n.totalCalories / targetCalories) * 100)
    }));
    
    const average = trend.length > 0 ? trend.reduce((sum, t) => sum + t.calories, 0) / trend.length : 0;
    
    res.json({
      success: true,
      data: {
        period: `${days} ngày`,
        trend,
        average,
        target: targetCalories,
        insight: average > targetCalories ? 'Bạn đang ăn nhiều hơn mục tiêu' : average < targetCalories ? 'Bạn đang ăn ít hơn mục tiêu' : 'Bạn đang đạt mục tiêu'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};