import { Request, Response } from 'express';
import { PrismaClient, Difficulty } from '@prisma/client';
import { recalculateDailyNutrition } from '../services/nutrition.service';

const prisma = new PrismaClient();

export const getPopularRecipes = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const recipes = await prisma.recipe.findMany({
      include: { food: true },
      orderBy: { viewCount: 'desc' },
      take: Number(limit),
    });
    res.json({ success: true, data: recipes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecentRecipes = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const recipes = await prisma.recipe.findMany({
      include: { food: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });
    res.json({ success: true, data: recipes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchRecipes = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { title: { contains: q as string, mode: 'insensitive' } },
          { tips: { contains: q as string, mode: 'insensitive' } },
        ],
      },
      include: { food: true, ingredients: true },
      take: 20,
    });
    res.json({ success: true, data: recipes, count: recipes.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecipesByDifficulty = async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.params;
    const { limit = 20 } = req.query;

    if (!Object.values(Difficulty).includes(difficulty as Difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    const recipes = await prisma.recipe.findMany({
      where: { difficulty: difficulty as Difficulty },
      include: { food: true },
      take: Number(limit),
    });
    res.json({ success: true, data: recipes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecipesByTime = async (req: Request, res: Response) => {
  try {
    const { maxTime = 30 } = req.query;
    const recipes = await prisma.recipe.findMany({
      where: { totalTime: { lte: parseInt(maxTime as string) } },
      include: { food: true },
      orderBy: { totalTime: 'asc' },
      take: 20,
    });
    res.json({ success: true, data: recipes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveRecipe = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const existing = await prisma.favorite.findFirst({
      where: { userId, foodId: recipe.foodId },
    });
    if (existing) {
      return res.json({ success: true, message: 'Recipe already saved', data: existing });
    }

    const favorite = await prisma.favorite.create({
      data: { userId, foodId: recipe.foodId },
    });
    res.json({ success: true, data: favorite });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const unsaveRecipe = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    await prisma.favorite.delete({
      where: { userId_foodId: { userId, foodId: recipe.foodId } },
    });
    res.json({ success: true, message: 'Recipe unsaved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedRecipes = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { food: { include: { recipe: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: favorites
        .filter((favorite) => favorite.food.recipe)
        .map((favorite) => ({ ...favorite.food, savedAt: favorite.createdAt })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsCooked = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, notes } = req.body;
    const userId = req.user.id;

    const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    await prisma.recipe.update({
      where: { id: parseInt(id) },
      data: { cookCount: { increment: 1 } },
    });

    if (rating) {
      await prisma.review.create({
        data: {
          userId,
          foodId: recipe.foodId,
          rating,
          comment: notes,
        },
      });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: recipe.foodId } });
    if (food) {
      const meal = await prisma.meal.create({
        data: {
          userId,
          foodId: recipe.foodId,
          mealType: 'DINNER',
          calories: food.calories,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
          isFromAI: false,
          notes: `Đã nấu từ công thức: ${recipe.title}`,
        },
      });

      await recalculateDailyNutrition(userId, meal.eatenAt);
    }

    res.json({ success: true, message: 'Marked as cooked!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

