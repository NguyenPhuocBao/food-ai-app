"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManySettings = exports.updateSetting = exports.getSetting = exports.getAllSettings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Lấy tất cả settings (có thể lọc theo group)
const getAllSettings = async (req, res) => {
    try {
        const { group } = req.query;
        const where = group ? { group: group } : {};
        const settings = await prisma.systemSetting.findMany({ where });
        // Chuyển thành object key-value cho dễ dùng
        const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllSettings = getAllSettings;
// Lấy một setting theo key
const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prisma.systemSetting.findUnique({ where: { key } });
        if (!setting)
            return res.status(404).json({ error: 'Setting not found' });
        res.json({ success: true, data: { [setting.key]: setting.value } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSetting = getSetting;
// Cập nhật một setting (upsert)
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, group } = req.body;
        if (value === undefined)
            return res.status(400).json({ error: 'Value is required' });
        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value, group: group || 'general' },
            create: { key, value, group: group || 'general' },
        });
        res.json({ success: true, data: { [setting.key]: setting.value } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateSetting = updateSetting;
// Cập nhật nhiều settings cùng lúc
const updateManySettings = async (req, res) => {
    try {
        const updates = req.body; // object { key1: value1, key2: value2 }
        const operations = Object.entries(updates).map(([key, value]) => prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value), group: 'general' },
        }));
        await prisma.$transaction(operations);
        res.json({ success: true, message: 'Settings updated' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateManySettings = updateManySettings;
