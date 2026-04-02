import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addFavorite = async (req: any, res: Response) => {
  try {
    const { foodId } = req.params;
    const userId = req.user.id;

    const food = await prisma.foodItem.findUnique({ where: { id: parseInt(foodId) } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const favorite = await prisma.favorite.upsert({
      where: { userId_foodId: { userId, foodId: parseInt(foodId) } },
      update: {},
      create: { userId, foodId: parseInt(foodId) },
    });

    await prisma.foodItem.update({
      where: { id: parseInt(foodId) },
      data: { popularity: { increment: 1 } },
    });

    res.json({ success: true, data: favorite });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFavorite = async (req: any, res: Response) => {
  try {
    const { foodId } = req.params;
    const userId = req.user.id;

    await prisma.favorite.delete({
      where: { userId_foodId: { userId, foodId: parseInt(foodId) } },
    });

    await prisma.foodItem.update({
      where: { id: parseInt(foodId) },
      data: { popularity: { decrement: 1 } },
    });

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFavorites = async (req: any, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { food: true },
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: favorites.map(f => f.food), count: favorites.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};