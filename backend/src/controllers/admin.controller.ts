import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  getActiveUserIds,
  getActiveProvider,
  getActiveWindowMinutes,
} from '../services/active-user.service';
import prisma from '../lib/prisma';
import {
  shiftAppDays,
  toAppDateKey,
  toAppDayStart,
} from '../utils/timezone.util';

const toLocalDateKey = (date: Date) => toAppDateKey(date);
const SUPPORT_PREFIX = 'SUPPORT_';
const SUPPORT_STATUS_OPEN = 'SUPPORT_OPEN';
const SUPPORT_STATUS_PENDING = 'SUPPORT_PENDING';
const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type FoodPlanningMeta = {
  id: number;
  mealTimeTags: string[];
  mealRoles: string[];
  goalTags: string[];
  cookingMethod: string | null;
  portionType: string | null;
};

const loadFoodPlanningMeta = async (foodIds: number[]) => {
  if (!foodIds.length) return new Map<number, FoodPlanningMeta>();
  const rows = await prisma.$queryRaw<FoodPlanningMeta[]>`
    SELECT id, "mealTimeTags", "mealRoles", "goalTags", "cookingMethod", "portionType"
    FROM "food_items"
    WHERE id = ANY(${foodIds})
  `;
  return new Map(rows.map((row) => [row.id, row]));
};

const saveFoodPlanningMeta = async (
  foodId: number,
  data: {
    mealTimeTags?: unknown;
    mealRoles?: unknown;
    goalTags?: unknown;
    cookingMethod?: unknown;
    portionType?: unknown;
  },
) => {
  await prisma.$executeRaw`
    UPDATE "food_items"
    SET
      "mealTimeTags" = ${Array.isArray(data.mealTimeTags) ? data.mealTimeTags : []}::text[],
      "mealRoles" = ${Array.isArray(data.mealRoles) ? data.mealRoles : []}::text[],
      "goalTags" = ${Array.isArray(data.goalTags) ? data.goalTags : []}::text[],
      "cookingMethod" = ${data.cookingMethod ? String(data.cookingMethod) : null},
      "portionType" = ${data.portionType ? String(data.portionType) : null}
    WHERE id = ${foodId}
  `;
};
const SUPPORT_STATUS_CLOSED = 'SUPPORT_CLOSED';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const activeUserIds = await getActiveUserIds();
    const activeUserSet = new Set(activeUserIds);
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
    const usersWithActivity = users.map((user) => ({
      ...user,
      isOnline: user.isActive && activeUserSet.has(user.id),
    }));

    res.json({
      success: true,
      data: usersWithActivity,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
      meta: {
        activeProvider: getActiveProvider(),
        activeWindowMinutes: getActiveWindowMinutes(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUserByAdmin = async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const role = req.body?.role || Role.USER;
    const isActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : true;

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        isActive,
        profile: { create: {} },
      },
      include: {
        profile: true,
        _count: { select: { meals: true, scanHistory: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        newData: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.status(201).json({ success: true, data: { ...user, isOnline: false } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    const user = await prisma.user.findUnique({
      where: { id: parsedId },
      include: {
        profile: true,
        goals: true,
        meals: { take: 10, orderBy: { eatenAt: 'desc' } },
        scanHistory: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { meals: true, scanHistory: true, favorites: true, reviews: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const activeUserSet = new Set(await getActiveUserIds());
    res.json({
      success: true,
      data: {
        ...user,
        isOnline: user.isActive && activeUserSet.has(parsedId),
      },
      meta: {
        activeProvider: getActiveProvider(),
        activeWindowMinutes: getActiveWindowMinutes(),
      },
    });
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
    const meta = await loadFoodPlanningMeta(foods.map((food) => food.id));
    const total = await prisma.foodItem.count({ where });
    res.json({
      success: true,
      data: foods.map((food) => ({ ...food, ...(meta.get(food.id) || {}) })),
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFoodByIdAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid food id' });
    }

    const food = await prisma.foodItem.findUnique({
      where: { id: parsedId },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: true,
            tools: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: { select: { avatar: true } },
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    profile: { select: { avatar: true } },
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        favorites: true,
      },
    });

    if (!food) return res.status(404).json({ error: 'Food not found' });
    const meta = await loadFoodPlanningMeta([food.id]);
    return res.json({ success: true, data: { ...food, ...(meta.get(food.id) || {}) } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      description,
      calories,
      protein,
      fat,
      carbs,
      isVegetarian,
      isVegan,
      isGlutenFree,
      mealTimeTags,
      mealRoles,
      goalTags,
      cookingMethod,
      portionType,
    } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedCategory = String(category || '').trim();
    const parsedCalories = Number(calories);
    if (!normalizedName || !normalizedCategory || !Number.isFinite(parsedCalories) || parsedCalories <= 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingByName = await prisma.foodItem.findUnique({ where: { name: normalizedName } });
    if (existingByName) return res.status(409).json({ error: 'Food name already exists' });

    const baseSlug = normalizeSlug(normalizedName) || `food-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.foodItem.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const food = await prisma.foodItem.create({
      data: {
        name: normalizedName,
        slug,
        category: normalizedCategory,
        description,
        calories: Math.round(parsedCalories),
        protein: parseFloat(protein) || 0,
        fat: parseFloat(fat) || 0,
        carbs: parseFloat(carbs) || 0,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
      },
    });
    await saveFoodPlanningMeta(food.id, { mealTimeTags, mealRoles, goalTags, cookingMethod, portionType });
    const meta = await loadFoodPlanningMeta([food.id]);
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'CREATE_FOOD',
        entity: 'FoodItem',
        entityId: food.id,
        newData: {
          id: food.id,
          name: normalizedName,
          category: normalizedCategory,
          nutrition: {
            calories: Math.round(parsedCalories),
            protein: parseFloat(protein) || 0,
            fat: parseFloat(fat) || 0,
            carbs: parseFloat(carbs) || 0,
          },
          planningMeta: { mealTimeTags, mealRoles, goalTags, cookingMethod, portionType },
          requestBody: req.body,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
    res.status(201).json({ success: true, data: { ...food, ...(meta.get(food.id) || {}) } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      calories,
      protein,
      fat,
      carbs,
      isVegetarian,
      isVegan,
      isGlutenFree,
      mealTimeTags,
      mealRoles,
      goalTags,
      cookingMethod,
      portionType,
    } = req.body;
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
    await saveFoodPlanningMeta(food.id, { mealTimeTags, mealRoles, goalTags, cookingMethod, portionType });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'UPDATE_FOOD',
        entity: 'FoodItem',
        entityId: food.id,
        oldData: {
          id: oldFood.id,
          name: oldFood.name,
          category: oldFood.category,
          nutrition: {
            calories: oldFood.calories,
            protein: oldFood.protein,
            fat: oldFood.fat,
            carbs: oldFood.carbs,
          },
        },
        newData: {
          id: food.id,
          name: food.name,
          category: food.category,
          nutrition: {
            calories: food.calories,
            protein: food.protein,
            fat: food.fat,
            carbs: food.carbs,
          },
          planningMeta: { mealTimeTags, mealRoles, goalTags, cookingMethod, portionType },
          requestBody: req.body,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
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
    const foodId = parseInt(id);
    if (!Number.isFinite(foodId)) {
      return res.status(400).json({ error: 'Invalid food id' });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const cleanupSummary = await prisma.$transaction(async (tx) => {
      // 1) Prisma-level cleanup
      const deletedRecommendations = await tx.recommendation.deleteMany({ where: { foodId } });
      const deletedMealPlanDetails = await tx.mealPlanDetail.deleteMany({ where: { foodId } });
      const deletedMeals = await tx.meal.deleteMany({ where: { foodId } });
      const deletedFavorites = await tx.favorite.deleteMany({ where: { foodId } });
      const deletedReviews = await tx.review.deleteMany({ where: { foodId } });

      // 2) SQL fallback cleanup (in case some rows were created outside Prisma schema evolution)
      await tx.$executeRaw`DELETE FROM "recommendations" WHERE "foodId" = ${foodId}`;
      await tx.$executeRaw`DELETE FROM "meal_plan_details" WHERE "foodId" = ${foodId}`;
      await tx.$executeRaw`DELETE FROM "meals" WHERE "foodId" = ${foodId}`;
      await tx.$executeRaw`DELETE FROM "favorites" WHERE "foodId" = ${foodId}`;
      await tx.$executeRaw`DELETE FROM "reviews" WHERE "foodId" = ${foodId}`;

      await tx.foodItem.delete({ where: { id: foodId } });
      return {
        deletedRecommendations: deletedRecommendations.count,
        deletedMealPlanDetails: deletedMealPlanDetails.count,
        deletedMeals: deletedMeals.count,
        deletedFavorites: deletedFavorites.count,
        deletedReviews: deletedReviews.count,
      };
    });

    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'DELETE_FOOD',
        entity: 'FoodItem',
        entityId: foodId,
        oldData: {
          id: food.id,
          name: food.name,
          category: food.category,
          nutrition: {
            calories: food.calories,
            protein: food.protein,
            fat: food.fat,
            carbs: food.carbs,
          },
        },
        newData: {
          deletedRelations: cleanupSummary,
          requestBody: req.body,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
    res.json({ success: true, message: 'Food deleted' });
  } catch (error: any) {
    console.error('[deleteFood] failed', { foodId: req.params.id, message: error?.message, code: error?.code, meta: error?.meta });
    res.status(500).json({ error: error.message });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const startOfToday = toAppDayStart(new Date());
    const startOfWindow = shiftAppDays(startOfToday, -6);
    const supportFirstResponseWindowStart = shiftAppDays(startOfToday, -30);
    const supportPendingThreshold = new Date(Date.now() - (24 * 60 * 60 * 1000));

    const activeUserIds = await getActiveUserIds();
    const activeUserSet = new Set(activeUserIds);

    const [
      totalUsers,
      newUsersThisWeek,
      totalFoods,
      totalRecipes,
      totalMeals,
      mealsToday,
      totalScans,
      scansToday,
      confirmedScans,
      totalReviews,
      totalFavorites,
      totalMealPlans,
      activeMealPlans,
      topCategories,
      popularFoods,
      recentUsers,
      recentMeals,
      recentScans,
      recentFavorites,
      recentUserSignups,
      activeUsers,
      supportSessionStatusCounts,
      supportSessionsToday,
      supportPendingOver24h,
      supportMessagesTotal,
      supportSessionsForFirstResponse,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfWindow } } }),
      prisma.foodItem.count(),
      prisma.recipe.count(),
      prisma.meal.count(),
      prisma.meal.count({ where: { eatenAt: { gte: startOfToday } } }),
      prisma.scanHistory.count(),
      prisma.scanHistory.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.scanHistory.count({ where: { isConfirmed: true } }),
      prisma.review.count(),
      prisma.favorite.count(),
      prisma.mealPlan.count(),
      prisma.mealPlan.count({ where: { isActive: true } }),
      prisma.foodItem.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 6,
      }),
      prisma.foodItem.findMany({
        orderBy: [{ popularity: 'desc' }, { updatedAt: 'desc' }],
        take: 6,
        include: {
          recipe: { select: { id: true, title: true } },
          _count: { select: { favorites: true, reviews: true, meals: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          _count: { select: { meals: true, scanHistory: true, favorites: true, mealPlans: true } },
        },
      }),
      prisma.meal.findMany({
        where: { eatenAt: { gte: startOfWindow } },
        select: { eatenAt: true, calories: true },
      }),
      prisma.scanHistory.findMany({
        where: { createdAt: { gte: startOfWindow } },
        select: { createdAt: true, isConfirmed: true },
      }),
      prisma.favorite.findMany({
        where: { createdAt: { gte: startOfWindow } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startOfWindow } },
        select: { createdAt: true },
      }),
      activeUserIds.length > 0
        ? prisma.user.count({
            where: {
              id: { in: activeUserIds },
              isActive: true,
            },
          })
        : Promise.resolve(0),
      prisma.chatSession.groupBy({
        by: ['status'],
        where: {
          status: { startsWith: SUPPORT_PREFIX },
        },
        _count: { status: true },
      }),
      prisma.chatSession.count({
        where: {
          status: { startsWith: SUPPORT_PREFIX },
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.chatSession.count({
        where: {
          status: SUPPORT_STATUS_PENDING,
          updatedAt: { lte: supportPendingThreshold },
        },
      }),
      prisma.chatMessage.count({
        where: {
          session: {
            status: { startsWith: SUPPORT_PREFIX },
          },
        },
      }),
      prisma.chatSession.findMany({
        where: {
          status: { startsWith: SUPPORT_PREFIX },
          createdAt: { gte: supportFirstResponseWindowStart },
        },
        select: {
          id: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            select: { role: true, createdAt: true },
          },
        },
      }),
    ]);

    const supportStatusMap = supportSessionStatusCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    let supportFirstResponseSamples30d = 0;
    let supportFirstResponseTotalMinutes30d = 0;

    supportSessionsForFirstResponse.forEach((session) => {
      const firstUserMessage = session.messages.find((message) => message.role === 'USER');
      if (!firstUserMessage) return;

      const firstAdminReply = session.messages.find(
        (message) =>
          message.role === 'ADMIN' &&
          message.createdAt.getTime() >= firstUserMessage.createdAt.getTime(),
      );
      if (!firstAdminReply) return;

      const diffMinutes = (firstAdminReply.createdAt.getTime() - firstUserMessage.createdAt.getTime()) / 60000;
      supportFirstResponseTotalMinutes30d += Math.max(0, diffMinutes);
      supportFirstResponseSamples30d += 1;
    });

    const avgFirstResponseMinutes30d = supportFirstResponseSamples30d > 0
      ? Math.round((supportFirstResponseTotalMinutes30d / supportFirstResponseSamples30d) * 10) / 10
      : null;

    const dailyMap = new Map<string, {
      date: string;
      meals: number;
      calories: number;
      scans: number;
      confirmedScans: number;
      saves: number;
      newUsers: number;
    }>();

    for (let offset = 0; offset < 7; offset += 1) {
      const current = shiftAppDays(startOfWindow, offset);
      const key = toLocalDateKey(current);

      dailyMap.set(key, {
        date: key,
        meals: 0,
        calories: 0,
        scans: 0,
        confirmedScans: 0,
        saves: 0,
        newUsers: 0,
      });
    }

    recentMeals.forEach((meal) => {
      const key = toLocalDateKey(meal.eatenAt);
      const bucket = dailyMap.get(key);
      if (!bucket) return;
      bucket.meals += 1;
      bucket.calories += meal.calories;
    });

    recentScans.forEach((scan) => {
      const key = toLocalDateKey(scan.createdAt);
      const bucket = dailyMap.get(key);
      if (!bucket) return;
      bucket.scans += 1;
      if (scan.isConfirmed) bucket.confirmedScans += 1;
    });

    recentFavorites.forEach((favorite) => {
      const key = toLocalDateKey(favorite.createdAt);
      const bucket = dailyMap.get(key);
      if (!bucket) return;
      bucket.saves += 1;
    });

    recentUserSignups.forEach((user) => {
      const key = toLocalDateKey(user.createdAt);
      const bucket = dailyMap.get(key);
      if (!bucket) return;
      bucket.newUsers += 1;
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisWeek: newUsersThisWeek,
        },
        foods: {
          total: totalFoods,
          withRecipes: totalRecipes,
        },
        recipes: {
          total: totalRecipes,
        },
        meals: {
          total: totalMeals,
          today: mealsToday,
        },
        scans: {
          total: totalScans,
          today: scansToday,
          confirmed: confirmedScans,
        },
        library: {
          favorites: totalFavorites,
          reviews: totalReviews,
        },
        mealPlans: {
          total: totalMealPlans,
          active: activeMealPlans,
        },
        support: {
          totalSessions:
            (supportStatusMap[SUPPORT_STATUS_OPEN] || 0) +
            (supportStatusMap[SUPPORT_STATUS_PENDING] || 0) +
            (supportStatusMap[SUPPORT_STATUS_CLOSED] || 0),
          open: supportStatusMap[SUPPORT_STATUS_OPEN] || 0,
          pending: supportStatusMap[SUPPORT_STATUS_PENDING] || 0,
          closed: supportStatusMap[SUPPORT_STATUS_CLOSED] || 0,
          today: supportSessionsToday,
          pendingOver24h: supportPendingOver24h,
          totalMessages: supportMessagesTotal,
          avgFirstResponseMinutes30d,
          firstResponseSamples30d: supportFirstResponseSamples30d,
        },
        topCategories: topCategories.map((item) => ({
          name: item.category,
          value: item._count.category,
        })),
        popularFoods,
        recentUsers: recentUsers.map((user) => ({
          ...user,
          isOnline: user.isActive && activeUserSet.has(user.id),
        })),
        weeklyOverview: Array.from(dailyMap.values()),
        activeProvider: getActiveProvider(),
        activeWindowMinutes: getActiveWindowMinutes(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, action, entity, search } = req.query;
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const keyword = String(search || '').trim();
    if (keyword) {
      const relationSearch = {
        user: {
          is: {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' as const } },
              { email: { contains: keyword, mode: 'insensitive' as const } },
            ],
          },
        },
      };

      const numericKeyword = Number.parseInt(keyword, 10);
      where.OR = [
        { action: { contains: keyword, mode: 'insensitive' as const } },
        { entity: { contains: keyword, mode: 'insensitive' as const } },
        { ipAddress: { contains: keyword, mode: 'insensitive' as const } },
        { userAgent: { contains: keyword, mode: 'insensitive' as const } },
        relationSearch,
        ...(Number.isInteger(numericKeyword) ? [{ entityId: numericKeyword }] : []),
      ];
    }

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

export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive }
    });
    
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'TOGGLE_BAN',
        entity: 'User',
        entityId: updated.id,
        newData: { isActive: updated.isActive }
      }
    });
    
    res.json({ success: true, data: { isActive: updated.isActive } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Reset user password về mật khẩu mặc định.
// Có thể override bằng biến môi trường ADMIN_DEFAULT_RESET_PASSWORD.
const ADMIN_DEFAULT_RESET_PASSWORD = (process.env.ADMIN_DEFAULT_RESET_PASSWORD || '123456').trim();

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestedPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword.trim() : '';
    const temporaryPassword = requestedPassword || ADMIN_DEFAULT_RESET_PASSWORD;
    if (temporaryPassword.length < 6) {
      return res.status(400).json({ error: 'newPassword must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const now = new Date();
    
    const parsedUserId = parseInt(id);
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: parsedUserId },
        data: { password: hashedPassword, passwordChangedAt: now }
      });

      await tx.passwordResetToken.deleteMany({
        where: { userId: parsedUserId, usedAt: null }
      });

      return updatedUser;
    });
    
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'RESET_PASSWORD',
        entity: 'User',
        entityId: user.id,
        newData: {
          resetMode: requestedPassword ? 'custom' : 'default_password',
        },
      }
    });
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        temporaryPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật profile của user (chỉ số sức khỏe)
export const updateUserProfileByAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { height, weight, targetCalories, targetProtein, targetFat, targetCarbs, allergies } = req.body;
    
    const profile = await prisma.userProfile.update({
      where: { userId: parseInt(id) },
      data: {
        height: height !== undefined ? parseFloat(height) : undefined,
        weight: weight !== undefined ? parseFloat(weight) : undefined,
        targetCalories: targetCalories ? parseInt(targetCalories) : undefined,
        targetProtein: targetProtein ? parseFloat(targetProtein) : undefined,
        targetFat: targetFat ? parseFloat(targetFat) : undefined,
        targetCarbs: targetCarbs ? parseFloat(targetCarbs) : undefined,
        allergies: allergies || undefined
      }
    });
    
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'UPDATE_PROFILE',
        entity: 'UserProfile',
        entityId: profile.id,
        newData: { height, weight, targetCalories }
      }
    });
    
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// Lấy danh sách recipe (có phân trang, tìm kiếm)
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where: any = {};
    if (search) where.title = { contains: search as string, mode: 'insensitive' };
    const recipes = await prisma.recipe.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { food: true },
      orderBy: { createdAt: 'desc' }
    });
    const total = await prisma.recipe.count({ where });
    res.json({
      success: true,
      data: recipes,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa recipe
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.recipe.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách reviews
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, rating, userId, foodId, search } = req.query;
    const where: any = {};
    if (rating) where.rating = parseInt(rating as string);
    if (userId) where.userId = parseInt(userId as string);
    if (foodId) where.foodId = parseInt(foodId as string);
    const keyword = String(search || '').trim();
    if (keyword) {
      const numericId = Number(keyword);
      where.OR = [
        { comment: { contains: keyword, mode: 'insensitive' } },
        { user: { name: { contains: keyword, mode: 'insensitive' } } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
        { food: { name: { contains: keyword, mode: 'insensitive' } } },
        ...(Number.isInteger(numericId) ? [{ id: numericId }] : []),
      ];
    }
    const reviews = await prisma.review.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { user: { select: { name: true, email: true } }, food: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const total = await prisma.review.count({ where });
    res.json({
      success: true,
      data: reviews,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await prisma.notification.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const total = await prisma.notification.count();
    res.json({
      success: true,
      data: notifications,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



// ==================== SETTINGS MANAGEMENT ====================
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateManySettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body; // { key1: value1, key2: value2 }
    const operations = Object.entries(updates).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group: 'general' }
      })
    );
    await prisma.$transaction(operations);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { ingredients, steps, tools, ...rest } = data;
    await prisma.recipe.update({
      where: { id: parseInt(id) },
      data: {
        ...rest,
        ingredients: { deleteMany: {}, create: ingredients?.create || [] },
        steps: { deleteMany: {}, create: steps?.create || [] },
        tools: { deleteMany: {}, create: tools?.create || [] },
      },
    });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createRecipe = async (req: Request, res: Response) => {
  try {
    const { foodId, ...data } = req.body;
    const { ingredients, steps, tools } = data;
    const recipe = await prisma.recipe.create({
      data: {
        foodId,
        title: data.title,
        summary: data.summary,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        totalTime: data.totalTime,
        servings: data.servings,
        difficulty: data.difficulty,
        tips: data.tips,
        nutritionNotes: data.nutritionNotes,
        ingredients: { create: ingredients?.create || [] },
        steps: { create: steps?.create || [] },
        tools: { create: tools?.create || [] },
      },
    });
    res.json({ success: true, data: recipe });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== MEAL PLAN MANAGEMENT ====================
export const getUserMealPlans = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const plans = await prisma.mealPlan.findMany({
      where: { userId: parseInt(userId) },
      include: {
        details: {
          include: { food: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMealPlan = async (req: Request, res: Response) => {
  try {
    const { userId, name, startDate, endDate, details } = req.body;
    const plan = await prisma.mealPlan.create({
      data: {
        userId: parseInt(userId),
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        details: {
          create: details.map((d: any) => ({
            foodId: d.foodId,
            mealType: d.mealType,
            dayOfWeek: d.dayOfWeek,
            quantity: d.quantity || 1,
          })),
        },
      },
      include: { details: true },
    });
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMealPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isActive, details } = req.body;
    await prisma.mealPlan.update({
      where: { id: parseInt(id) },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        details: {
          deleteMany: {},
          create: details.map((d: any) => ({
            foodId: d.foodId,
            mealType: d.mealType,
            dayOfWeek: d.dayOfWeek,
            quantity: d.quantity || 1,
          })),
        },
      },
    });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMealPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mealPlan.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Gửi thông báo cho một hoặc nhiều user (danh sách userIds)
export const sendToUsers = async (req: Request, res: Response) => {
  try {
    const { title, message, type, userIds } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type: type || 'INFO',
    }));
    await prisma.notification.createMany({ data: notifications });
    res.json({ success: true, message: `Sent to ${userIds.length} users` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// Gửi thông báo cho một user cụ thể
export const sendNotificationToUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, message, type = 'INFO' } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    const notification = await prisma.notification.create({
      data: { userId: parseInt(userId), title, message, type },
    });
    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'SEND_NOTIFICATION',
        entity: 'Notification',
        entityId: notification.id,
        newData: { userId: parseInt(userId), title, message, type },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendNotificationToMultipleUsers = async (req: Request, res: Response) => {
  try {
    const { userIds, title, message, type = 'INFO' } = req.body;
    if (!userIds || !userIds.length) return res.status(400).json({ error: 'User IDs required' });
    const notifications = userIds.map((userId: number) => ({
      userId, title, message, type,
    }));
    await prisma.notification.createMany({ data: notifications });
    // Ghi audit log (lưu danh sách userIds)
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'SEND_NOTIFICATION_MULTIPLE',
        entity: 'Notification',
        newData: { userIds, title, message, type },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
    res.json({ success: true, message: `Sent to ${userIds.length} users` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const broadcastNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, type = 'INFO' } = req.body;
    const users = await prisma.user.findMany({ select: { id: true } });
    const notifications = users.map(user => ({ userId: user.id, title, message, type }));
    await prisma.notification.createMany({ data: notifications });
    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'BROADCAST_NOTIFICATION',
        entity: 'Notification',
        newData: { title, message, type, totalUsers: users.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
    res.json({ success: true, message: `Sent to ${users.length} users` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
