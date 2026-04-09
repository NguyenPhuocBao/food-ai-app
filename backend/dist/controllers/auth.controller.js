"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getMe = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const active_user_service_1 = require("../services/active-user.service");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'food-ai-secret-key-2024';
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                profile: { create: {} }
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        await (0, active_user_service_1.markUserActive)(user.id);
        // Tạo audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'REGISTER',
                entity: 'User',
                entityId: user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        });
        res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, token } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        await (0, active_user_service_1.markUserActive)(user.id);
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                entity: 'User',
                entityId: user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        });
        res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, token, profile: user.profile } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        await (0, active_user_service_1.markUserInactive)(req.user.id);
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'LOGOUT',
                entity: 'User',
                entityId: req.user.id
            }
        });
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.logout = logout;
const refreshToken = async (req, res) => {
    try {
        const token = jsonwebtoken_1.default.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
        await (0, active_user_service_1.markUserActive)(req.user.id);
        res.json({ success: true, token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.refreshToken = refreshToken;
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { profile: true, goals: { where: { isActive: true } } }
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { fullName, gender, dateOfBirth, height, weight, activityLevel, dietaryPref, allergies, targetCalories, targetProtein, targetFat, targetCarbs, goalType, targetWeight, } = req.body;
        const userId = req.user.id;
        const parsedHeight = height !== undefined && height !== null && height !== '' ? parseFloat(height) : undefined;
        const parsedWeight = weight !== undefined && weight !== null && weight !== '' ? parseFloat(weight) : undefined;
        const parsedTargetCalories = targetCalories !== undefined && targetCalories !== null && targetCalories !== '' ? parseInt(targetCalories, 10) : undefined;
        const parsedTargetProtein = targetProtein !== undefined && targetProtein !== null && targetProtein !== '' ? parseFloat(targetProtein) : undefined;
        const parsedTargetFat = targetFat !== undefined && targetFat !== null && targetFat !== '' ? parseFloat(targetFat) : undefined;
        const parsedTargetCarbs = targetCarbs !== undefined && targetCarbs !== null && targetCarbs !== '' ? parseFloat(targetCarbs) : undefined;
        const parsedTargetWeight = targetWeight !== undefined && targetWeight !== null && targetWeight !== '' ? parseFloat(targetWeight) : undefined;
        const parsedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
        const user = await prisma.$transaction(async (tx) => {
            if (fullName && typeof fullName === 'string' && fullName.trim()) {
                await tx.user.update({
                    where: { id: userId },
                    data: { name: fullName.trim() },
                });
            }
            const profile = await tx.userProfile.upsert({
                where: { userId },
                update: {
                    fullName,
                    gender,
                    dateOfBirth: parsedDateOfBirth,
                    height: parsedHeight,
                    weight: parsedWeight,
                    activityLevel,
                    dietaryPref,
                    allergies,
                    targetCalories: parsedTargetCalories,
                    targetProtein: parsedTargetProtein,
                    targetFat: parsedTargetFat,
                    targetCarbs: parsedTargetCarbs,
                },
                create: {
                    userId,
                    fullName,
                    gender,
                    dateOfBirth: parsedDateOfBirth,
                    height: parsedHeight,
                    weight: parsedWeight,
                    activityLevel,
                    dietaryPref: dietaryPref || [],
                    allergies: allergies || [],
                    targetCalories: parsedTargetCalories ?? 2000,
                    targetProtein: parsedTargetProtein ?? 150,
                    targetFat: parsedTargetFat ?? 55,
                    targetCarbs: parsedTargetCarbs ?? 250,
                },
            });
            if (parsedHeight !== undefined || parsedWeight !== undefined) {
                await tx.userHealthMetric.create({
                    data: {
                        userId,
                        height: parsedHeight,
                        weight: parsedWeight,
                    },
                });
            }
            const hasGoalPayload = goalType !== undefined ||
                parsedTargetWeight !== undefined ||
                parsedTargetCalories !== undefined ||
                parsedTargetProtein !== undefined ||
                parsedTargetFat !== undefined ||
                parsedTargetCarbs !== undefined;
            if (hasGoalPayload) {
                const activeGoal = await tx.userGoal.findFirst({
                    where: { userId, isActive: true },
                    orderBy: { startDate: 'desc' },
                });
                if (activeGoal) {
                    await tx.userGoal.update({
                        where: { id: activeGoal.id },
                        data: {
                            goalType: goalType ?? activeGoal.goalType,
                            targetWeight: parsedTargetWeight ?? activeGoal.targetWeight,
                            targetCalories: parsedTargetCalories ?? activeGoal.targetCalories,
                            targetProtein: parsedTargetProtein ?? activeGoal.targetProtein,
                            targetFat: parsedTargetFat ?? activeGoal.targetFat,
                            targetCarbs: parsedTargetCarbs ?? activeGoal.targetCarbs,
                        },
                    });
                }
                else {
                    await tx.userGoal.create({
                        data: {
                            userId,
                            goalType: goalType ?? 'MAINTENANCE',
                            targetWeight: parsedTargetWeight,
                            targetCalories: parsedTargetCalories ?? 2000,
                            targetProtein: parsedTargetProtein ?? 150,
                            targetFat: parsedTargetFat ?? 55,
                            targetCarbs: parsedTargetCarbs ?? 250,
                            isActive: true,
                        },
                    });
                }
            }
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'UPDATE_PROFILE',
                    entity: 'UserProfile',
                    entityId: profile.id,
                    newData: {
                        fullName,
                        height: parsedHeight,
                        weight: parsedWeight,
                        activityLevel,
                        targetCalories: parsedTargetCalories,
                        targetProtein: parsedTargetProtein,
                        targetFat: parsedTargetFat,
                        targetCarbs: parsedTargetCarbs,
                        goalType,
                        targetWeight: parsedTargetWeight,
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });
            return tx.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true,
                    goals: { where: { isActive: true } },
                    healthMetrics: {
                        orderBy: { recordedAt: 'desc' },
                        take: 5,
                    },
                },
            });
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid)
            return res.status(401).json({ error: 'Current password is incorrect' });
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.changePassword = changePassword;
