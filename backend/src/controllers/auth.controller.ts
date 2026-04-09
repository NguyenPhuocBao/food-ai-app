import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { markUserActive, markUserInactive } from '../services/active-user.service';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'food-ai-secret-key-2024';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        profile: { create: {} }
      }
    });
    
    const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);
    await markUserActive(user.id);
    
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
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
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);
    await markUserActive(user.id);
    
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req: any, res: Response) => {
  try {
    await markUserInactive(req.user.id);
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user.id
      }
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req: any, res: Response) => {
  try {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
    await markUserActive(req.user.id);
    res.json({ success: true, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true, goals: { where: { isActive: true } } }
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const {
      fullName,
      gender,
      dateOfBirth,
      height,
      weight,
      activityLevel,
      dietaryPref,
      allergies,
      targetCalories,
      targetProtein,
      targetFat,
      targetCarbs,
      goalType,
      targetWeight,
    } = req.body;

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

      const hasGoalPayload =
        goalType !== undefined ||
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
        } else {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
