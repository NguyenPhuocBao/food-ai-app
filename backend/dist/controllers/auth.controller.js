"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.updateProfile = exports.getMe = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const active_user_service_1 = require("../services/active-user.service");
const email_service_1 = require("../services/email.service");
const jwt_util_1 = require("../utils/jwt.util");
const prisma_1 = __importDefault(require("../lib/prisma"));
const env_1 = require("../config/env");
const auth_validation_1 = require("../validations/auth.validation");
const resetPasswordExpiresMinutes = Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_MINUTES || 15);
const RESET_PASSWORD_EXPIRES_MINUTES = Number.isFinite(resetPasswordExpiresMinutes) && resetPasswordExpiresMinutes > 0
    ? resetPasswordExpiresMinutes
    : 15;
const FRONTEND_URL = (0, env_1.getRuntimeEnv)().frontendUrl.replace(/\/+$/, '');
const GENERIC_FORGOT_PASSWORD_MESSAGE = 'If the email exists, reset instructions have been sent.';
const hashResetToken = (token) => (0, crypto_1.createHash)('sha256').update(token).digest('hex');
const signAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, (0, jwt_util_1.resolveJwtSecret)(), { expiresIn: '7d' });
const getValidationMessage = (error) => {
    if (typeof error === 'object' && error && 'issues' in error) {
        const firstIssue = error.issues?.[0];
        return firstIssue?.message || 'Invalid request payload';
    }
    return 'Invalid request payload';
};
const register = async (req, res) => {
    try {
        let email = '';
        let password = '';
        let name = '';
        try {
            const payload = auth_validation_1.registerSchema.parse(req.body);
            email = payload.email;
            password = payload.password;
            name = payload.name;
        }
        catch (validationError) {
            return res.status(400).json({ error: getValidationMessage(validationError) });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                profile: { create: {} }
            }
        });
        const token = signAccessToken({ id: user.id, email: user.email, role: user.role });
        await (0, active_user_service_1.markUserActive)(user.id);
        // Tạo audit log
        await prisma_1.default.auditLog.create({
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
        let email = '';
        let password = '';
        try {
            const payload = auth_validation_1.loginSchema.parse(req.body);
            email = payload.email;
            password = payload.password;
        }
        catch (validationError) {
            return res.status(400).json({ error: getValidationMessage(validationError) });
        }
        const user = await prisma_1.default.user.findUnique({
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
        const token = signAccessToken({ id: user.id, email: user.email, role: user.role });
        await (0, active_user_service_1.markUserActive)(user.id);
        await prisma_1.default.auditLog.create({
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
        await prisma_1.default.auditLog.create({
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
        const token = signAccessToken({ id: req.user.id, email: req.user.email, role: req.user.role });
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
        const user = await prisma_1.default.user.findUnique({
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
        const user = await prisma_1.default.$transaction(async (tx) => {
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
const forgotPassword = async (req, res) => {
    try {
        let emailInput = '';
        try {
            const payload = auth_validation_1.forgotPasswordSchema.parse(req.body);
            emailInput = payload.email;
        }
        catch (validationError) {
            return res.status(400).json({ error: getValidationMessage(validationError) });
        }
        const email = emailInput;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, isActive: true },
        });
        if (!user || !user.isActive) {
            return res.json({ success: true, message: GENERIC_FORGOT_PASSWORD_MESSAGE });
        }
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = hashResetToken(rawToken);
        const expiresAt = new Date(Date.now() + RESET_PASSWORD_EXPIRES_MINUTES * 60 * 1000);
        await prisma_1.default.$transaction([
            prisma_1.default.passwordResetToken.deleteMany({
                where: { userId: user.id, usedAt: null },
            }),
            prisma_1.default.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt,
                    requestedIp: req.ip,
                    requestedUserAgent: req.get('user-agent') || undefined,
                },
            }),
            prisma_1.default.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'FORGOT_PASSWORD_REQUEST',
                    entity: 'User',
                    entityId: user.id,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            }),
        ]);
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
        const sent = await (0, email_service_1.sendPasswordResetEmail)({
            toEmail: user.email,
            userName: user.name,
            resetUrl,
            expiresInMinutes: RESET_PASSWORD_EXPIRES_MINUTES,
        });
        if (!sent) {
            console.error('[auth] Password reset email was not sent. Check SMTP config.');
        }
        return res.json({ success: true, message: GENERIC_FORGOT_PASSWORD_MESSAGE });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        let token = '';
        let newPassword = '';
        try {
            const payload = auth_validation_1.resetPasswordSchema.parse(req.body);
            token = payload.token;
            newPassword = payload.newPassword;
        }
        catch (validationError) {
            return res.status(400).json({ error: getValidationMessage(validationError) });
        }
        const tokenHash = hashResetToken(token);
        const resetToken = await prisma_1.default.passwordResetToken.findUnique({
            where: { tokenHash },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
                usedAt: true,
            },
        });
        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Reset token is invalid or expired' });
        }
        const now = new Date();
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: resetToken.userId },
                data: {
                    password: hashedPassword,
                    passwordChangedAt: now,
                },
            }),
            prisma_1.default.passwordResetToken.update({
                where: { id: resetToken.id },
                data: {
                    usedAt: now,
                    usedIp: req.ip,
                    usedUserAgent: req.get('user-agent') || undefined,
                },
            }),
            prisma_1.default.passwordResetToken.deleteMany({
                where: {
                    userId: resetToken.userId,
                    usedAt: null,
                    id: { not: resetToken.id },
                },
            }),
            prisma_1.default.auditLog.create({
                data: {
                    userId: resetToken.userId,
                    action: 'RESET_PASSWORD',
                    entity: 'User',
                    entityId: resetToken.userId,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            }),
        ]);
        return res.json({ success: true, message: 'Password reset successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid)
            return res.status(401).json({ error: 'Current password is incorrect' });
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }
        const now = new Date();
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: req.user.id },
                data: { password: hashedPassword, passwordChangedAt: now },
            }),
            prisma_1.default.passwordResetToken.deleteMany({
                where: { userId: req.user.id, usedAt: null },
            }),
            prisma_1.default.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'CHANGE_PASSWORD',
                    entity: 'User',
                    entityId: req.user.id,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            }),
        ]);
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.changePassword = changePassword;
