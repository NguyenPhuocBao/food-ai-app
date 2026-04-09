"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFoodImage = exports.createRecipe = exports.updateRecipe = exports.getPopularFoods = exports.getCategories = exports.searchFoods = exports.getFoodById = exports.getAllFoods = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllFoods = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search, sort = 'popularity', order = 'desc' } = req.query;
        const where = {};
        if (category)
            where.category = category;
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
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
            orderBy: { [sort]: order },
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllFoods = getAllFoods;
const getFoodById = async (req, res) => {
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
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        if (food.recipe) {
            await prisma.recipe.update({
                where: { id: food.recipe.id },
                data: { viewCount: { increment: 1 } },
            });
        }
        res.json({ success: true, data: food });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFoodById = getFoodById;
const searchFoods = async (req, res) => {
    try {
        const { q, category, minCalories, maxCalories, isVegetarian, isVegan } = req.query;
        if (!q)
            return res.status(400).json({ error: 'Search query required' });
        const where = {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
            ],
        };
        if (category)
            where.category = category;
        if (minCalories)
            where.calories = { gte: parseInt(minCalories) };
        if (maxCalories)
            where.calories = { ...where.calories, lte: parseInt(maxCalories) };
        if (isVegetarian === 'true')
            where.isVegetarian = true;
        if (isVegan === 'true')
            where.isVegan = true;
        const foods = await prisma.foodItem.findMany({ where, take: 50 });
        res.json({ success: true, data: foods, count: foods.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchFoods = searchFoods;
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.foodItem.groupBy({
            by: ['category'],
            _count: true,
            _avg: { calories: true },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategories = getCategories;
const getPopularFoods = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const foods = await prisma.foodItem.findMany({
            orderBy: { popularity: 'desc' },
            take: Number(limit),
        });
        res.json({ success: true, data: foods });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPopularFoods = getPopularFoods;
//EDIT CÔNG THỨC
const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const recipe = await prisma.recipe.update({ where: { id: parseInt(id) }, data });
    res.json({ success: true, data: recipe });
};
exports.updateRecipe = updateRecipe;
const createRecipe = async (req, res) => {
    const { foodId, ...data } = req.body;
    const recipe = await prisma.recipe.create({ data: { ...data, foodId } });
    res.json({ success: true, data: recipe });
};
exports.createRecipe = createRecipe;
const uploadFoodImage = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const foodId = parseInt(req.params.id);
        const imageUrl = `/uploads/${req.file.filename}`;
        const food = await prisma.foodItem.update({
            where: { id: foodId },
            data: { imageUrl },
        });
        res.json({ success: true, data: { imageUrl } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.uploadFoodImage = uploadFoodImage;
