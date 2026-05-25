import { Request, Response } from 'express';
import { PrismaClient, MealType } from '@prisma/client';
import { recalculateDailyNutrition } from '../services/nutrition.service';
import { toAppDateKey, toAppDayRange } from '../utils/timezone.util';

const prisma = new PrismaClient();

const getAppDayOfWeek = (value: Date) => {
  const [year, month, day] = toAppDateKey(value).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

export const addMeal = async (req: any, res: Response) => {
  try {
    const { foodId, mealType, eatenAt, quantity, notes } = req.body;
    const userId = req.user.id;

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const mealDate = eatenAt ? new Date(eatenAt) : new Date();
    const planForSync = await prisma.mealPlan.findFirst({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, startDate: true, endDate: true, isActive: true },
    });

    const meal = await prisma.meal.create({
      data: {
        userId,
        foodId,
        mealType: mealType as MealType,
        eatenAt: mealDate,
        mealPlanId: planForSync?.id ?? null,
        quantity: quantity || 1,
        calories: food.calories * (quantity || 1),
        protein: food.protein * (quantity || 1),
        fat: food.fat * (quantity || 1),
        carbs: food.carbs * (quantity || 1),
        notes,
      },
      include: { food: true },
    });

    await recalculateDailyNutrition(userId, meal.eatenAt);

    let syncedMealPlanDetail = null;
    let mealPlanSyncMeta: null | {
      mealPlanId: number;
      strategy: 'active_or_latest';
      isActive: boolean;
      inPlanDateRange: boolean;
    } = null;

    if (planForSync) {
      const planStart = new Date(planForSync.startDate);
      planStart.setHours(0, 0, 0, 0);
      const planEnd = new Date(planForSync.endDate);
      planEnd.setHours(23, 59, 59, 999);
      const inPlanDateRange = meal.eatenAt >= planStart && meal.eatenAt <= planEnd;
      mealPlanSyncMeta = {
        mealPlanId: planForSync.id,
        strategy: 'active_or_latest',
        isActive: planForSync.isActive,
        inPlanDateRange,
      };

      const dayOfWeek = getAppDayOfWeek(meal.eatenAt);
      const existingDetail = await prisma.mealPlanDetail.findFirst({
        where: {
          mealPlanId: planForSync.id,
          foodId,
          mealType: meal.mealType,
          dayOfWeek,
        },
      });

      if (existingDetail) {
        syncedMealPlanDetail = await prisma.mealPlanDetail.update({
          where: { id: existingDetail.id },
          data: {
            quantity: Number((existingDetail.quantity + meal.quantity).toFixed(2)),
          },
        });
      } else {
        syncedMealPlanDetail = await prisma.mealPlanDetail.create({
          data: {
            mealPlanId: planForSync.id,
            foodId,
            mealType: meal.mealType,
            dayOfWeek,
            quantity: meal.quantity,
          },
        });
      }
    }

    res.json({
      success: true,
      data: meal,
      mealPlanDetail: syncedMealPlanDetail,
      mealPlanSync: mealPlanSyncMeta,
    });
  } catch (error: any) {
    console.error('Add meal error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMealsByDate = async (req: any, res: Response) => {
  try {
    const { date } = req.query;
    const userId = (req.user.role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId as string) 
      : req.user.id;
    const { start, endExclusive } = toAppDayRange(date ? String(date) : new Date());
    
    const meals = await prisma.meal.findMany({
      where: { userId, eatenAt: { gte: start, lt: endExclusive } },
      include: { food: true },
      orderBy: { eatenAt: 'asc' }
    });
    
    const nutrition = await recalculateDailyNutrition(userId, start);
    
    res.json({ success: true, data: { meals, nutrition } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMealHistory = async (req: any, res: Response) => {
  try {
    const { limit = 50, startDate, endDate } = req.query;
    const userId = (req.user.role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId as string) 
      : req.user.id;
    
    const where: any = { userId };
    if (startDate) where.eatenAt = { gte: new Date(startDate as string) };
    if (endDate) where.eatenAt = { ...where.eatenAt, lte: new Date(endDate as string) };
    
    const meals = await prisma.meal.findMany({
      where,
      include: { food: true },
      orderBy: { eatenAt: 'desc' },
      take: Number(limit)
    });
    
    res.json({ success: true, data: meals, count: meals.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMealById = async (req: any, res: Response) => {
  try {
    const mealId = parseInt(req.params.id);
    if (!Number.isFinite(mealId)) {
      return res.status(400).json({ error: 'Invalid meal id' });
    }

    const where: any = { id: mealId };
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const meal = await prisma.meal.findFirst({
      where,
      include: {
        food: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    res.json({ success: true, data: meal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMeal = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;

    const where: any = { id: parseInt(id) };
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const existingMeal = await prisma.meal.findFirst({ where, include: { food: true } });
    if (!existingMeal) return res.status(404).json({ error: 'Meal not found' });
    
    const nextQuantity = quantity || existingMeal.quantity;
    const quantityDelta = Number((nextQuantity - existingMeal.quantity).toFixed(2));

    const updatedMeal = await prisma.meal.update({
      where: { id: parseInt(id) },
      data: {
        quantity: nextQuantity,
        notes,
        calories: existingMeal.food.calories * nextQuantity,
        protein: existingMeal.food.protein * nextQuantity,
        fat: existingMeal.food.fat * nextQuantity,
        carbs: existingMeal.food.carbs * nextQuantity
      },
      include: { food: true }
    });

    if (quantityDelta !== 0) {
      const planForSync = existingMeal.mealPlanId
        ? { id: existingMeal.mealPlanId }
        : await prisma.mealPlan.findFirst({
            where: { userId: existingMeal.userId },
            orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
            select: { id: true },
          });

      if (planForSync) {
        const dayOfWeek = getAppDayOfWeek(existingMeal.eatenAt);
        const detail = await prisma.mealPlanDetail.findFirst({
          where: {
            mealPlanId: planForSync.id,
            foodId: existingMeal.foodId,
            mealType: existingMeal.mealType,
            dayOfWeek,
          },
        });

        if (detail) {
          const nextDetailQuantity = Number((detail.quantity + quantityDelta).toFixed(2));
          if (nextDetailQuantity <= 0) {
            await prisma.mealPlanDetail.delete({ where: { id: detail.id } });
          } else {
            await prisma.mealPlanDetail.update({
              where: { id: detail.id },
              data: { quantity: nextDetailQuantity },
            });
          }
        }
      }
    }
    
    // Recalculate daily nutrition
    await recalculateDailyNutrition(existingMeal.userId, existingMeal.eatenAt);
    
    res.json({ success: true, data: updatedMeal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeal = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const where: any = { id: parseInt(id) };

    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const meal = await prisma.meal.findFirst({ where });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    
    await prisma.meal.delete({ where: { id: parseInt(id) } });

    const planForSync = meal.mealPlanId
      ? { id: meal.mealPlanId }
      : await prisma.mealPlan.findFirst({
          where: { userId: meal.userId },
          orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
          select: { id: true },
        });

    if (planForSync) {
      const dayOfWeek = getAppDayOfWeek(meal.eatenAt);
      const detail = await prisma.mealPlanDetail.findFirst({
        where: {
          mealPlanId: planForSync.id,
          foodId: meal.foodId,
          mealType: meal.mealType,
          dayOfWeek,
        },
      });

      if (detail) {
        const nextQuantity = Number((detail.quantity - meal.quantity).toFixed(2));
        if (nextQuantity <= 0) {
          await prisma.mealPlanDetail.delete({ where: { id: detail.id } });
        } else {
          await prisma.mealPlanDetail.update({
            where: { id: detail.id },
            data: { quantity: nextQuantity },
          });
        }
      }
    }
    
    // Recalculate daily nutrition
    await recalculateDailyNutrition(meal.userId, meal.eatenAt);
    
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
