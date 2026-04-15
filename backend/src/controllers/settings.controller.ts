import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toStringValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const toSettingsObject = (rows: Array<{ key: string; value: string }>) =>
  rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const group = typeof req.query.group === 'string' ? req.query.group : undefined;
    const where = group ? { group } : {};
    const rows = await prisma.systemSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    return res.json({ success: true, data: toSettingsObject(rows) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllSettingsRows = async (req: Request, res: Response) => {
  try {
    const group = typeof req.query.group === 'string' ? req.query.group : undefined;
    const where = group ? { group } : {};
    const rows = await prisma.systemSetting.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { key: 'asc' }],
      select: {
        id: true,
        key: true,
        value: true,
        group: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSetting = async (req: Request, res: Response) => {
  try {
    const key = String(req.params.key || '').trim();
    if (!key) return res.status(400).json({ error: 'Invalid setting key' });

    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });

    return res.json({
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        group: setting.group,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const key = String(req.params.key || '').trim();
    const value = req.body?.value;
    const group = typeof req.body?.group === 'string' && req.body.group.trim() ? req.body.group.trim() : undefined;

    if (!key) return res.status(400).json({ error: 'Invalid setting key' });
    if (value === undefined || value === null) return res.status(400).json({ error: 'Value is required' });

    const valueText = toStringValue(value);
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: valueText,
        ...(group ? { group } : {}),
      },
      create: {
        key,
        value: valueText,
        group: group || 'general',
      },
    });

    return res.json({
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        group: setting.group,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const key = String(req.params.key || '').trim();
    if (!key) return res.status(400).json({ error: 'Invalid setting key' });

    const existing = await prisma.systemSetting.findUnique({ where: { key }, select: { key: true } });
    if (!existing) return res.status(404).json({ error: 'Setting not found' });

    await prisma.systemSetting.delete({ where: { key } });
    return res.json({ success: true, message: `Deleted setting: ${key}` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateManySettings = async (req: Request, res: Response) => {
  try {
    const input = req.body || {};
    const defaultGroup =
      typeof input?.group === 'string' && input.group.trim() ? input.group.trim() : 'general';

    if (Array.isArray(input?.rows)) {
      const rows = input.rows
        .map((row: any) => ({
          key: String(row?.key || '').trim(),
          value: row?.value,
          group: typeof row?.group === 'string' && row.group.trim() ? row.group.trim() : defaultGroup,
        }))
        .filter((row: any) => row.key && row.value !== undefined && row.value !== null);

      if (rows.length === 0) {
        return res.status(400).json({ error: 'No valid rows to update' });
      }

      const operations = rows.map((row: any) =>
        prisma.systemSetting.upsert({
          where: { key: row.key },
          update: {
            value: toStringValue(row.value),
            group: row.group,
          },
          create: {
            key: row.key,
            value: toStringValue(row.value),
            group: row.group,
          },
        }),
      );

      await prisma.$transaction(operations);
      return res.json({ success: true, message: `Updated ${rows.length} rows` });
    }

    const updates =
      input && typeof input === 'object' && input.updates && typeof input.updates === 'object'
        ? input.updates
        : input;

    const entries = Object.entries(updates).filter(([key, value]) => key.trim() && value !== undefined && value !== null);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid settings to update' });
    }

    const operations = entries.map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key: key.trim() },
        update: { value: toStringValue(value) },
        create: {
          key: key.trim(),
          value: toStringValue(value),
          group: defaultGroup,
        },
      }),
    );

    await prisma.$transaction(operations);
    return res.json({ success: true, message: `Updated ${entries.length} settings` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
