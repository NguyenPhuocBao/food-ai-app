"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.removeFavorite = exports.addFavorite = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addFavorite = async (req, res) => {
    try {
        const { foodId } = req.params;
        const userId = req.user.id;
        const parsedFoodId = parseInt(foodId);
        const food = await prisma.foodItem.findUnique({ where: { id: parsedFoodId } });
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        const existingFavorite = await prisma.favorite.findUnique({
            where: { userId_foodId: { userId, foodId: parsedFoodId } },
        });
        if (existingFavorite) {
            return res.json({ success: true, data: existingFavorite });
        }
        const favorite = await prisma.favorite.create({
            data: { userId, foodId: parsedFoodId },
        });
        await prisma.foodItem.update({
            where: { id: parsedFoodId },
            data: { popularity: { increment: 1 } },
        });
        res.json({ success: true, data: favorite });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addFavorite = addFavorite;
const removeFavorite = async (req, res) => {
    try {
        const { foodId } = req.params;
        const userId = req.user.id;
        const parsedFoodId = parseInt(foodId);
        const existingFavorite = await prisma.favorite.findUnique({
            where: { userId_foodId: { userId, foodId: parsedFoodId } },
        });
        if (!existingFavorite) {
            return res.json({ success: true, message: 'Favorite already removed' });
        }
        await prisma.favorite.delete({
            where: { userId_foodId: { userId, foodId: parsedFoodId } },
        });
        await prisma.foodItem.update({
            where: { id: parsedFoodId },
            data: { popularity: { decrement: 1 } },
        });
        res.json({ success: true, message: 'Removed from favorites' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.removeFavorite = removeFavorite;
const getFavorites = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const userId = req.user.id;
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: { food: { include: { recipe: true } } },
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: favorites.map((favorite) => ({
                ...favorite.food,
                savedAt: favorite.createdAt,
            })),
            count: favorites.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFavorites = getFavorites;
