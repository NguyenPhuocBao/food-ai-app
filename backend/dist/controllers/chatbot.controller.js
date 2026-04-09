"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickChat = exports.sendMessage = exports.deleteSession = exports.getSession = exports.getSessions = exports.createSession = void 0;
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const prisma = new client_1.PrismaClient();
// Khởi tạo OpenAI client với API key từ biến môi trường
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// Hàm lấy thông tin người dùng để tạo system prompt
const getSystemPrompt = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, goals: { where: { isActive: true } } },
    });
    if (!user)
        return 'Bạn là AI Health Coach - Chuyên gia dinh dưỡng và sức khỏe.';
    const profile = user.profile;
    const goal = user.goals[0];
    return `Bạn là AI Health Coach - Chuyên gia dinh dưỡng và sức khỏe thông minh.

THÔNG TIN NGƯỜI DÙNG:
- Tên: ${profile?.fullName || user.name}
- Cân nặng: ${profile?.weight || 'Chưa cập nhật'} kg
- Chiều cao: ${profile?.height || 'Chưa cập nhật'} cm
- Mục tiêu: ${goal?.goalType === 'WEIGHT_LOSS' ? 'Giảm cân' : goal?.goalType === 'WEIGHT_GAIN' ? 'Tăng cân' : 'Duy trì cân nặng'}
- Dị ứng: ${profile?.allergies?.join(', ') || 'Không có'}

Hãy trả lời ngắn gọn, thân thiện, có gợi ý cụ thể. Luôn ưu tiên sức khỏe và an toàn.`;
};
// Tạo phiên chat mới
const createSession = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;
        const session = await prisma.chatSession.create({
            data: { userId, title: title || `Cuộc trò chuyện ${new Date().toLocaleDateString()}` },
        });
        res.json({ success: true, data: session });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createSession = createSession;
// Lấy danh sách các phiên chat của user
const getSessions = async (req, res) => {
    try {
        const userId = (req.user.role === 'ADMIN' && req.query.userId)
            ? parseInt(req.query.userId)
            : req.user.id;
        const sessions = await prisma.chatSession.findMany({
            where: { userId },
            include: { _count: { select: { messages: true } } },
            orderBy: { updatedAt: 'desc' },
        });
        res.json({ success: true, data: sessions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSessions = getSessions;
// Lấy chi tiết một phiên chat (kèm lịch sử tin nhắn)
const getSession = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const session = await prisma.chatSession.findFirst({
            where: { id: parseInt(id), userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        res.json({ success: true, data: session });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSession = getSession;
// Xóa một phiên chat
const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const session = await prisma.chatSession.findFirst({ where: { id: parseInt(id), userId } });
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        await prisma.chatSession.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Session deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteSession = deleteSession;
// Gửi tin nhắn trong một phiên chat (có lưu lịch sử)
const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const session = await prisma.chatSession.findFirst({ where: { id: parseInt(id), userId } });
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        // Lưu tin nhắn của người dùng
        await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'USER', content } });
        // Lấy lịch sử tin nhắn (tối đa 10 tin nhắn gần nhất)
        const previousMessages = await prisma.chatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'asc' },
            take: 10,
        });
        const systemPrompt = await getSystemPrompt(userId);
        // Xây dựng mảng messages cho OpenAI API
        const messages = [
            { role: 'system', content: systemPrompt },
            ...previousMessages.map(m => ({
                role: m.role === 'USER' ? 'user' : 'assistant',
                content: m.content,
            })),
            { role: 'user', content: content },
        ];
        // Gọi OpenAI Chat Completion API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Có thể đổi thành 'gpt-4-turbo' hoặc 'gpt-4o-mini' nếu cần
            messages: messages,
            temperature: 0.7,
        });
        const responseContent = completion.choices[0]?.message?.content || "Xin lỗi, tôi không thể xử lý yêu cầu này.";
        // Lưu phản hồi của AI
        const assistantMessage = await prisma.chatMessage.create({
            data: { sessionId: session.id, role: 'ASSISTANT', content: responseContent },
        });
        // Cập nhật thời gian của phiên chat
        await prisma.chatSession.update({
            where: { id: session.id },
            data: { updatedAt: new Date() },
        });
        res.json({ success: true, data: assistantMessage });
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.sendMessage = sendMessage;
// Hỏi nhanh (không lưu phiên, chỉ trả lời một câu)
const quickChat = async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;
        if (!question)
            return res.status(400).json({ error: 'Question required' });
        const systemPrompt = await getSystemPrompt(userId);
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
        ];
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
        });
        const answer = completion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này.";
        res.json({ success: true, data: { answer } });
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.quickChat = quickChat;
