import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lấy tất cả settings (có thể lọc theo group)
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const { group } = req.query;
    const where = group ? { group: group as string } : {};
    const settings = await prisma.systemSetting.findMany({ where });
    // Chuyển thành object key-value cho dễ dùng
    const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy một setting theo key
export const getSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json({ success: true, data: { [setting.key]: setting.value } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật một setting (upsert)
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, group } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'Value is required' });

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, group: group || 'general' },
      create: { key, value, group: group || 'general' },
    });
    res.json({ success: true, data: { [setting.key]: setting.value } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật nhiều settings cùng lúc
export const updateManySettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body; // object { key1: value1, key2: value2 }
    const operations = Object.entries(updates).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group: 'general' },
      })
    );
    await prisma.$transaction(operations);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};