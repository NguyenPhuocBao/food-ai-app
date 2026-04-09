import { Request, Response } from 'express';
import { PrismaClient, MealType } from '@prisma/client';
import { recalculateDailyNutrition } from '../services/nutrition.service';
import { toAppDayRange } from '../utils/timezone.util';

const prisma = new PrismaClient();

export const addMeal = async (req: any, res: Response) => {
  try {
    const { foodId, mealType, eatenAt, quantity, notes } = req.body;
    const userId = req.user.id;

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const meal = await prisma.meal.create({
      data: {
        userId,
        foodId,
        mealType: mealType as MealType,
        eatenAt: eatenAt ? new Date(eatenAt) : new Date(),
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

    res.json({ success: true, data: meal });
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
    
    const nutrition = await prisma.dailyNutrition.findUnique({
      where: { userId_date: { userId, date: start } }
    });
    
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
    
    const updatedMeal = await prisma.meal.update({
      where: { id: parseInt(id) },
      data: {
        quantity: quantity || existingMeal.quantity,
        notes,
        calories: existingMeal.food.calories * (quantity || existingMeal.quantity),
        protein: existingMeal.food.protein * (quantity || existingMeal.quantity),
        fat: existingMeal.food.fat * (quantity || existingMeal.quantity),
        carbs: existingMeal.food.carbs * (quantity || existingMeal.quantity)
      },
      include: { food: true }
    });
    
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
    
    // Recalculate daily nutrition
    await recalculateDailyNutrition(meal.userId, meal.eatenAt);
    
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
