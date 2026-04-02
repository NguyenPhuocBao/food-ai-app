import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { profile: true, _count: { select: { meals: true, scanHistory: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.user.count({ where });
    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        profile: true,
        goals: true,
        meals: { take: 10, orderBy: { eatenAt: 'desc' } },
        scanHistory: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { meals: true, scanHistory: true, favorites: true, reviews: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: role as Role },
    });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'UPDATE_ROLE',
        entity: 'User',
        entityId: user.id,
        newData: { role },
      },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await prisma.user.delete({ where: { id: parseInt(id) } });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'DELETE_USER',
        entity: 'User',
        entityId: parseInt(id),
        oldData: { email: user.email },
      },
    });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Foods admin (giống food controller nhưng không cần auth)
export const getAllFoodsAdmin = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where: any = {};
    if (search) where.name = { contains: search as string, mode: 'insensitive' };
    const foods = await prisma.foodItem.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { recipe: true, _count: { select: { meals: true, favorites: true, reviews: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.foodItem.count({ where });
    res.json({
      success: true,
      data: foods,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const { name, category, description, calories, protein, fat, carbs, isVegetarian, isVegan, isGlutenFree } = req.body;
    if (!name || !category || !calories) return res.status(400).json({ error: 'Missing required fields' });
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[đĐ]/g, 'd');
    const food = await prisma.foodItem.create({
      data: {
        name,
        slug,
        category,
        description,
        calories: parseInt(calories),
        protein: parseFloat(protein) || 0,
        fat: parseFloat(fat) || 0,
        carbs: parseFloat(carbs) || 0,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'CREATE_FOOD',
        entity: 'FoodItem',
        entityId: food.id,
        newData: { name, category },
      },
    });
    res.json({ success: true, data: food });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, calories, protein, fat, carbs, isVegetarian, isVegan, isGlutenFree } = req.body;
    const oldFood = await prisma.foodItem.findUnique({ where: { id: parseInt(id) } });
    if (!oldFood) return res.status(404).json({ error: 'Food not found' });
    const slug = name ? name.toLowerCase().replace(/ /g, '-').replace(/[đĐ]/g, 'd') : undefined;
    const food = await prisma.foodItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        category,
        description,
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseFloat(protein) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        isVegetarian,
        isVegan,
        isGlutenFree,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'UPDATE_FOOD',
        entity: 'FoodItem',
        entityId: food.id,
        oldData: { name: oldFood.name },
        newData: { name: food.name },
      },
    });
    res.json({ success: true, data: food });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await prisma.foodItem.findUnique({ where: { id: parseInt(id) } });
    if (!food) return res.status(404).json({ error: 'Food not found' });
    await prisma.foodItem.delete({ where: { id: parseInt(id) } });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'DELETE_FOOD',
        entity: 'FoodItem',
        entityId: parseInt(id),
        oldData: { name: food.name },
      },
    });
    res.json({ success: true, message: 'Food deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalFoods, totalMeals, totalScans, totalReviews, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.foodItem.count(),
      prisma.meal.count(),
      prisma.scanHistory.count(),
      prisma.review.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMeals = await prisma.meal.count({ where: { eatenAt: { gte: today } } });
    const popularFoods = await prisma.foodItem.findMany({ orderBy: { popularity: 'desc' }, take: 5 });
    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        foods: { total: totalFoods },
        meals: { total: totalMeals, today: todayMeals },
        scans: totalScans,
        reviews: totalReviews,
        popularFoods,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, action, entity } = req.query;
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    const logs = await prisma.auditLog.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.auditLog.count({ where });
    res.json({
      success: true,
      data: logs,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};