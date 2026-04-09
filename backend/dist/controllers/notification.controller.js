"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getNotifications = async (req, res) => {
    try {
        const { limit = 50, unreadOnly = false } = req.query;
        const userId = req.user.id;
        const where = { userId };
        if (unreadOnly === 'true')
            where.isRead = false;
        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
        });
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.json({ success: true, data: notifications, unreadCount });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await prisma.notification.findFirst({
            where: { id: parseInt(id), userId },
        });
        if (!notification)
            return res.status(404).json({ error: 'Notification not found' });
        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true },
        });
        res.json({ success: true, message: 'Marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await prisma.notification.findFirst({
            where: { id: parseInt(id), userId },
        });
        if (!notification)
            return res.status(404).json({ error: 'Notification not found' });
        await prisma.notification.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteNotification = deleteNotification;
