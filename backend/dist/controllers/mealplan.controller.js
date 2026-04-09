"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMealPlan = exports.setActiveMealPlan = exports.addDetailToMealPlan = exports.createMealPlan = exports.getActiveMealPlan = exports.getMealPlans = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Lấy tất cả meal plans của user
const getMealPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const plans = await prisma.mealPlan.findMany({
            where: { userId },
            include: {
                details: {
                    include: { food: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealPlans = getMealPlans;
// Lấy meal plan đang active
const getActiveMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const plan = await prisma.mealPlan.findFirst({
            where: { userId, isActive: true },
            include: {
                details: {
                    include: { food: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
                },
            },
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getActiveMealPlan = getActiveMealPlan;
// Tạo meal plan mới
const createMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, startDate, endDate } = req.body;
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, startDate, endDate' });
        }
        const plan = await prisma.mealPlan.create({
            data: {
                userId,
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: false,
            },
            include: { details: { include: { food: true } } },
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createMealPlan = createMealPlan;
// Thêm món vào meal plan
const addDetailToMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { foodId, mealType, dayOfWeek, quantity } = req.body;
        const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        const detail = await prisma.mealPlanDetail.create({
            data: {
                mealPlanId: parseInt(id),
                foodId,
                mealType,
                dayOfWeek,
                quantity: quantity || 1,
            },
            include: { food: true },
        });
        res.json({ success: true, data: detail });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addDetailToMealPlan = addDetailToMealPlan;
// Bật/tắt meal plan (set active)
const setActiveMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        // Tắt tất cả plan khác của user
        await prisma.mealPlan.updateMany({ where: { userId }, data: { isActive: false } });
        // Bật plan được chọn
        const updated = await prisma.mealPlan.update({
            where: { id: parseInt(id) },
            data: { isActive: true },
            include: { details: { include: { food: true } } },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.setActiveMealPlan = setActiveMealPlan;
// Xoá meal plan
const deleteMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        await prisma.mealPlan.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Meal plan deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMealPlan = deleteMealPlan;
