import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const prisma = new PrismaClient();

export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'popularity', order = 'desc' } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const foods = await prisma.foodItem.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { [sort as string]: order },
    });

    const total = await prisma.foodItem.count({ where });

    res.json({
      success: true,
      data: foods,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFoodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await prisma.foodItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        recipe: { include: { ingredients: true, steps: true, tools: true } },
        reviews: {
          include: {
            user: {
              include: {
                profile: { select: { avatar: true } }, // chỉ lấy avatar từ profile
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        favorites: true,
      },
    });

    if (!food) return res.status(404).json({ error: 'Food not found' });

    if (food.recipe) {
      await prisma.recipe.update({
        where: { id: food.recipe.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    res.json({ success: true, data: food });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchFoods = async (req: Request, res: Response) => {
  try {
    const { q, category, minCalories, maxCalories, isVegetarian, isVegan } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const where: any = {
      OR: [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { category: { contains: q as string, mode: 'insensitive' } },
      ],
    };

    if (category) where.category = category;
    if (minCalories) where.calories = { gte: parseInt(minCalories as string) };
    if (maxCalories) where.calories = { ...where.calories, lte: parseInt(maxCalories as string) };
    if (isVegetarian === 'true') where.isVegetarian = true;
    if (isVegan === 'true') where.isVegan = true;

    const foods = await prisma.foodItem.findMany({ where, take: 50 });

    res.json({ success: true, data: foods, count: foods.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.foodItem.groupBy({
      by: ['category'],
      _count: true,
      _avg: { calories: true },
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPopularFoods = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const foods = await prisma.foodItem.findMany({
      orderBy: { popularity: 'desc' },
      take: Number(limit),
    });
    res.json({ success: true, data: foods });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
//EDIT CÔNG THỨC
export const updateRecipe = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const recipe = await prisma.recipe.update({ where: { id: parseInt(id) }, data });
  res.json({ success: true, data: recipe });
};
export const createRecipe = async (req: Request, res: Response) => {
  const { foodId, ...data } = req.body;
  const recipe = await prisma.recipe.create({ data: { ...data, foodId } });
  res.json({ success: true, data: recipe });
};

export const uploadFoodImage = async (req: any, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const foodId = parseInt(req.params.id);
    const imageUrl = `/uploads/${req.file.filename}`;
    const food = await prisma.foodItem.update({
      where: { id: foodId },
      data: { imageUrl },
    });
    res.json({ success: true, data: { imageUrl } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};