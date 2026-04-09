import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

// Khởi tạo OpenAI client với API key từ biến môi trường
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Hàm lấy thông tin người dùng để tạo system prompt
const getSystemPrompt = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, goals: { where: { isActive: true } } },
    });

    if (!user) return 'Bạn là AI Health Coach - Chuyên gia dinh dưỡng và sức khỏe.';

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
export const createSession = async (req: any, res: Response) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;
        const session = await prisma.chatSession.create({
            data: { userId, title: title || `Cuộc trò chuyện ${new Date().toLocaleDateString()}` },
        });
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy danh sách các phiên chat của user
export const getSessions = async (req: any, res: Response) => {
    try {
        const userId = (req.user.role === 'ADMIN' && req.query.userId) 
          ? parseInt(req.query.userId as string) 
          : req.user.id;
        const sessions = await prisma.chatSession.findMany({
            where: { userId },
            include: { _count: { select: { messages: true } } },
            orderBy: { updatedAt: 'desc' },
        });
        res.json({ success: true, data: sessions });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy chi tiết một phiên chat (kèm lịch sử tin nhắn)
export const getSession = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const session = await prisma.chatSession.findFirst({
            where: { id: parseInt(id), userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Xóa một phiên chat
export const deleteSession = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const session = await prisma.chatSession.findFirst({ where: { id: parseInt(id), userId } });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        await prisma.chatSession.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Session deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Gửi tin nhắn trong một phiên chat (có lưu lịch sử)
export const sendMessage = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const session = await prisma.chatSession.findFirst({ where: { id: parseInt(id), userId } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

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
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...previousMessages.map(m => ({
                role: m.role === 'USER' ? 'user' : 'assistant',
                content: m.content,
            })) as OpenAI.Chat.ChatCompletionMessageParam[],
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
    } catch (error: any) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Hỏi nhanh (không lưu phiên, chỉ trả lời một câu)
export const quickChat = async (req: any, res: Response) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;
        if (!question) return res.status(400).json({ error: 'Question required' });

        const systemPrompt = await getSystemPrompt(userId);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
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
    } catch (error: any) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error.message });
    }
};