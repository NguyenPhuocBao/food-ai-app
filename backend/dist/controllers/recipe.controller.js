"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsCooked = exports.getSavedRecipes = exports.unsaveRecipe = exports.saveRecipe = exports.getRecipesByTime = exports.getRecipesByDifficulty = exports.searchRecipes = exports.getRecentRecipes = exports.getPopularRecipes = void 0;
const client_1 = require("@prisma/client");
const nutrition_service_1 = require("../services/nutrition.service");
const prisma = new client_1.PrismaClient();
const getPopularRecipes = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const recipes = await prisma.recipe.findMany({
            include: { food: true },
            orderBy: { viewCount: 'desc' },
            take: Number(limit),
        });
        res.json({ success: true, data: recipes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPopularRecipes = getPopularRecipes;
const getRecentRecipes = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const recipes = await prisma.recipe.findMany({
            include: { food: true },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
        });
        res.json({ success: true, data: recipes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRecentRecipes = getRecentRecipes;
const searchRecipes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q)
            return res.status(400).json({ error: 'Search query required' });
        const recipes = await prisma.recipe.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { tips: { contains: q, mode: 'insensitive' } },
                ],
            },
            include: { food: true, ingredients: true },
            take: 20,
        });
        res.json({ success: true, data: recipes, count: recipes.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchRecipes = searchRecipes;
const getRecipesByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const { limit = 20 } = req.query;
        if (!Object.values(client_1.Difficulty).includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty' });
        }
        const recipes = await prisma.recipe.findMany({
            where: { difficulty: difficulty },
            include: { food: true },
            take: Number(limit),
        });
        res.json({ success: true, data: recipes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRecipesByDifficulty = getRecipesByDifficulty;
const getRecipesByTime = async (req, res) => {
    try {
        const { maxTime = 30 } = req.query;
        const recipes = await prisma.recipe.findMany({
            where: { totalTime: { lte: parseInt(maxTime) } },
            include: { food: true },
            orderBy: { totalTime: 'asc' },
            take: 20,
        });
        res.json({ success: true, data: recipes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRecipesByTime = getRecipesByTime;
const saveRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        if (!recipe)
            return res.status(404).json({ error: 'Recipe not found' });
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.saveRecipe = saveRecipe;
const unsaveRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        if (!recipe)
            return res.status(404).json({ error: 'Recipe not found' });
        await prisma.favorite.delete({
            where: { userId_foodId: { userId, foodId: recipe.foodId } },
        });
        res.json({ success: true, message: 'Recipe unsaved' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.unsaveRecipe = unsaveRecipe;
const getSavedRecipes = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSavedRecipes = getSavedRecipes;
const markAsCooked = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, notes } = req.body;
        const userId = req.user.id;
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        if (!recipe)
            return res.status(404).json({ error: 'Recipe not found' });
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
            await (0, nutrition_service_1.recalculateDailyNutrition)(userId, meal.eatenAt);
        }
        res.json({ success: true, message: 'Marked as cooked!' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.markAsCooked = markAsCooked;
