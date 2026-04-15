import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildPopularFoodSeedData } from '../services/popular-foods.service';

const prisma = new PrismaClient();

const CUSTOM_CATEGORY_PREFIX = 'CUSTOM_USER_';

const getCustomCategory = (userId: number) => `${CUSTOM_CATEGORY_PREFIX}${userId}`;

const isCustomCategory = (category?: string | null) =>
  Boolean(category && category.startsWith(CUSTOM_CATEGORY_PREFIX));

const isOwnedCustomCategory = (category: string | null | undefined, userId: number) =>
  category === getCustomCategory(userId);

const buildFoodVisibilityFilter = (req: any) => {
  if (req.user.role === 'ADMIN') return {};
  return {
    OR: [
      { NOT: { category: { startsWith: CUSTOM_CATEGORY_PREFIX } } },
      { category: getCustomCategory(req.user.id) },
    ],
  };
};

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CATEGORY_LABEL_PERSONAL = 'Mon ca nhan';

const toPublicCategoryLabel = (category: string, userId: number) => {
  if (isOwnedCustomCategory(category, userId)) return CATEGORY_LABEL_PERSONAL;
  return category;
};

export const getAllFoods = async (req: any, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sort = 'popularity',
      order = 'desc',
    } = req.query;

    const where: any = {
      ...buildFoodVisibilityFilter(req),
    };

    if (category) {
      if (category === CATEGORY_LABEL_PERSONAL) {
        where.category = getCustomCategory(req.user.id);
      } else {
        where.category = category;
      }
    }

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const sortField = ['popularity', 'createdAt', 'calories', 'name'].includes(String(sort))
      ? String(sort)
      : 'popularity';
    const sortOrder = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const foods = await prisma.foodItem.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { [sortField]: sortOrder },
    });

    const data = foods.map((food) => ({
      ...food,
      category: toPublicCategoryLabel(food.category, req.user.id),
      isCustom: isOwnedCustomCategory(food.category, req.user.id),
    }));

    const total = await prisma.foodItem.count({ where });

    res.json({
      success: true,
      data,
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

export const getFoodById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const food = await prisma.foodItem.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        recipe: { include: { ingredients: true, steps: true, tools: true } },
        reviews: {
          include: {
            user: {
              include: {
                profile: { select: { avatar: true } },
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

    if (
      req.user.role !== 'ADMIN' &&
      isCustomCategory(food.category) &&
      !isOwnedCustomCategory(food.category, req.user.id)
    ) {
      return res.status(404).json({ error: 'Food not found' });
    }

    if (food.recipe) {
      await prisma.recipe.update({
        where: { id: food.recipe.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    res.json({
      success: true,
      data: {
        ...food,
        category: toPublicCategoryLabel(food.category, req.user.id),
        isCustom: isOwnedCustomCategory(food.category, req.user.id),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchFoods = async (req: any, res: Response) => {
  try {
    const { q, category, minCalories, maxCalories, isVegetarian, isVegan } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const where: any = {
      AND: [
        buildFoodVisibilityFilter(req),
        {
          OR: [
            { name: { contains: q as string, mode: 'insensitive' } },
            { description: { contains: q as string, mode: 'insensitive' } },
            { category: { contains: q as string, mode: 'insensitive' } },
          ],
        },
      ],
    };

    if (category) {
      if (category === CATEGORY_LABEL_PERSONAL) {
        where.AND.push({ category: getCustomCategory(req.user.id) });
      } else {
        where.AND.push({ category });
      }
    }

    if (minCalories) where.AND.push({ calories: { gte: parseInt(minCalories as string, 10) } });
    if (maxCalories) {
      where.AND.push({ calories: { lte: parseInt(maxCalories as string, 10) } });
    }
    if (isVegetarian === 'true') where.AND.push({ isVegetarian: true });
    if (isVegan === 'true') where.AND.push({ isVegan: true });

    const foods = await prisma.foodItem.findMany({ where, take: 50 });

    res.json({
      success: true,
      data: foods.map((food) => ({
        ...food,
        category: toPublicCategoryLabel(food.category, req.user.id),
        isCustom: isOwnedCustomCategory(food.category, req.user.id),
      })),
      count: foods.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req: any, res: Response) => {
  try {
    const where = buildFoodVisibilityFilter(req);

    const categories = await prisma.foodItem.groupBy({
      by: ['category'],
      where,
      _count: true,
      _avg: { calories: true },
    });

    const normalized = categories.map((item) => ({
      ...item,
      category: toPublicCategoryLabel(item.category, req.user.id),
    }));

    res.json({ success: true, data: normalized });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPopularFoods = async (req: any, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const where: any = {
      ...buildFoodVisibilityFilter(req),
      NOT: {
        category: { startsWith: CUSTOM_CATEGORY_PREFIX },
      },
    };

    const foods = await prisma.foodItem.findMany({
      where,
      orderBy: { popularity: 'desc' },
      take: Number(limit),
    });

    res.json({ success: true, data: foods });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyCustomFoods = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const foods = await prisma.foodItem.findMany({
      where: { category: getCustomCategory(userId) },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: foods.map((food) => ({
        ...food,
        category: CATEGORY_LABEL_PERSONAL,
        isCustom: true,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomFood = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      calories,
      protein,
      fat,
      carbs,
      fiber,
      sugar,
      isVegetarian,
      isVegan,
      isGlutenFree,
    } = req.body || {};

    if (!name || calories === undefined || protein === undefined || fat === undefined || carbs === undefined) {
      return res.status(400).json({ error: 'Missing required nutrition fields' });
    }

    let normalizedName = String(name).trim();
    if (!normalizedName) return res.status(400).json({ error: 'Invalid food name' });

    const existingByName = await prisma.foodItem.findUnique({ where: { name: normalizedName } });
    if (existingByName) {
      normalizedName = `${normalizedName} (ca nhan ${userId})`;
    }

    const slugBase = normalizeSlug(normalizedName);
    const slug = `${slugBase}-${userId}-${Date.now()}`;

    const item = await prisma.foodItem.create({
      data: {
        name: normalizedName,
        slug,
        category: getCustomCategory(userId),
        description: description || 'Mon ca nhan do nguoi dung tu tao.',
        calories: Math.max(0, Math.round(Number(calories))),
        protein: Math.max(0, Number(protein)),
        fat: Math.max(0, Number(fat)),
        carbs: Math.max(0, Number(carbs)),
        fiber: fiber !== undefined ? Math.max(0, Number(fiber)) : null,
        sugar: sugar !== undefined ? Math.max(0, Number(sugar)) : null,
        popularity: 0,
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...item,
        category: CATEGORY_LABEL_PERSONAL,
        isCustom: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bootstrapPopularFoods = async (req: any, res: Response) => {
  try {
    const limit = Math.max(200, Math.min(500, Number(req.body?.limit || req.query?.limit || 240)));
    const seedItems = buildPopularFoodSeedData(limit);

    const existing = await prisma.foodItem.findMany({
      where: { name: { in: seedItems.map((item) => item.name) } },
      select: { name: true },
    });

    const existingNames = new Set(existing.map((item) => item.name));
    const toInsert = seedItems.filter((item) => !existingNames.has(item.name));

    const result = toInsert.length
      ? await prisma.foodItem.createMany({ data: toInsert, skipDuplicates: true })
      : { count: 0 };

    const totalFoods = await prisma.foodItem.count({
      where: {
        NOT: { category: { startsWith: CUSTOM_CATEGORY_PREFIX } },
      },
    });

    res.json({
      success: true,
      data: {
        inserted: result.count,
        skipped: seedItems.length - result.count,
        totalFoods,
      },
      message: 'Popular food catalog bootstrap completed',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const recipe = await prisma.recipe.update({ where: { id: parseInt(id, 10) }, data });
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
    const foodId = parseInt(req.params.id, 10);

    const food = await prisma.foodItem.findUnique({ where: { id: foodId }, select: { category: true } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    if (
      req.user.role !== 'ADMIN' &&
      isCustomCategory(food.category) &&
      !isOwnedCustomCategory(food.category, req.user.id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    await prisma.foodItem.update({
      where: { id: foodId },
      data: { imageUrl },
    });
    res.json({ success: true, data: { imageUrl } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
