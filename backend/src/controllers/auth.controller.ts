import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    const { fullName, gender, dateOfBirth, height, weight, activityLevel, dietaryPref, allergies, targetCalories, targetProtein, targetFat, targetCarbs } = req.body;
    
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: {
        fullName, gender, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        height: height ? parseFloat(height) : undefined, weight: weight ? parseFloat(weight) : undefined,
        activityLevel, dietaryPref, allergies,
        targetCalories: targetCalories ? parseInt(targetCalories) : undefined,
        targetProtein: targetProtein ? parseFloat(targetProtein) : undefined,
        targetFat: targetFat ? parseFloat(targetFat) : undefined,
        targetCarbs: targetCarbs ? parseFloat(targetCarbs) : undefined
      },
      create: {
        userId: req.user.id, fullName, gender, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        height: height ? parseFloat(height) : undefined, weight: weight ? parseFloat(weight) : undefined,
        activityLevel, dietaryPref, allergies,
        targetCalories: targetCalories ? parseInt(targetCalories) : 2000,
        targetProtein: targetProtein ? parseFloat(targetProtein) : 150,
        targetFat: targetFat ? parseFloat(targetFat) : 55,
        targetCarbs: targetCarbs ? parseFloat(targetCarbs) : 250
      }
    });
    
    res.json({ success: true, data: profile });
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