import { Request, Response } from 'express';
import { PrismaClient, MealType } from '@prisma/client';

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

    const date = new Date(meal.eatenAt);
    date.setHours(0, 0, 0, 0);

    const dailyMeals = await prisma.meal.findMany({
      where: {
        userId,
        eatenAt: {
          gte: date,
          lt: new Date(date.getTime() + 86400000),
        },
      },
    });

    const totals = dailyMeals.reduce(
      (acc, m) => ({
        totalCalories: acc.totalCalories + m.calories,
        totalProtein: acc.totalProtein + m.protein,
        totalFat: acc.totalFat + m.fat,
        totalCarbs: acc.totalCarbs + m.carbs,
        totalMeals: acc.totalMeals + 1,
      }),
      { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 }
    );

    await prisma.dailyNutrition.upsert({
      where: { userId_date: { userId, date } },
      update: totals,
      create: { userId, date, ...totals },
    });

    res.json({ success: true, data: meal });
  } catch (error: any) {
    console.error('Add meal error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMealsByDate = async (req: any, res: Response) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;
    
    const startDate = date ? new Date(date as string) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
    
    const meals = await prisma.meal.findMany({
      where: { userId, eatenAt: { gte: startDate, lte: endDate } },
      include: { food: true },
      orderBy: { eatenAt: 'asc' }
    });
    
    const nutrition = await prisma.dailyNutrition.findUnique({
      where: { userId_date: { userId, date: startDate } }
    });
    
    res.json({ success: true, data: { meals, nutrition } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMealHistory = async (req: any, res: Response) => {
  try {
    const { limit = 50, startDate, endDate } = req.query;
    const userId = req.user.id;
    
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

export const updateMeal = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;
    const userId = req.user.id;
    
    const existingMeal = await prisma.meal.findFirst({ where: { id: parseInt(id), userId }, include: { food: true } });
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
    const date = new Date(existingMeal.eatenAt);
    date.setHours(0, 0, 0, 0);
    
    const dailyMeals = await prisma.meal.findMany({
      where: { userId, eatenAt: { gte: date, lt: new Date(date.getTime() + 86400000) } }
    });
    
    const totals = dailyMeals.reduce((acc, m) => ({
      totalCalories: acc.totalCalories + m.calories,
      totalProtein: acc.totalProtein + m.protein,
      totalFat: acc.totalFat + m.fat,
      totalCarbs: acc.totalCarbs + m.carbs,
      totalMeals: acc.totalMeals + 1
    }), { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 });
    
    await prisma.dailyNutrition.upsert({
      where: { userId_date: { userId, date } },
      update: totals,
      create: { userId, date, ...totals }
    });
    
    res.json({ success: true, data: updatedMeal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeal = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const meal = await prisma.meal.findFirst({ where: { id: parseInt(id), userId } });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    
    await prisma.meal.delete({ where: { id: parseInt(id) } });
    
    // Recalculate daily nutrition
    const date = new Date(meal.eatenAt);
    date.setHours(0, 0, 0, 0);
    
    const dailyMeals = await prisma.meal.findMany({
      where: { userId, eatenAt: { gte: date, lt: new Date(date.getTime() + 86400000) } }
    });
    
    const totals = dailyMeals.reduce((acc, m) => ({
      totalCalories: acc.totalCalories + m.calories,
      totalProtein: acc.totalProtein + m.protein,
      totalFat: acc.totalFat + m.fat,
      totalCarbs: acc.totalCarbs + m.carbs,
      totalMeals: acc.totalMeals + 1
    }), { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 });
    
    if (dailyMeals.length === 0) {
      await prisma.dailyNutrition.delete({ where: { userId_date: { userId, date } } });
    } else {
      await prisma.dailyNutrition.upsert({
        where: { userId_date: { userId, date } },
        update: totals,
        create: { userId, date, ...totals }
      });
    }
    
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};