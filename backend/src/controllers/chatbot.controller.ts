import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { toAppDateKey, toAppDayRange } from '../utils/timezone.util';

const prisma = new PrismaClient();

// Khởi tạo OpenAI client với API key từ biến môi trường
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const MAX_HISTORY_MESSAGES = Number(process.env.CHAT_HISTORY_LIMIT || 20);

const toAssistantRole = (role: string): 'user' | 'assistant' =>
  role === 'USER' ? 'user' : 'assistant';

// Hàm lấy thông tin người dùng để tạo system prompt
const getSystemPrompt = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, goals: { where: { isActive: true } } },
    });

    if (!user) return 'Ban la AI Health Coach - chuyen gia dinh duong va suc khoe.';

    const profile = user.profile;
    const goal = user.goals[0];
    const today = new Date();
    const todayKey = toAppDateKey(today);
    const { start, endExclusive } = toAppDayRange(today);

    const [dailyNutrition, recentMeals] = await Promise.all([
      prisma.dailyNutrition.findUnique({
        where: { userId_date: { userId, date: start } },
      }),
      prisma.meal.findMany({
        where: { userId, eatenAt: { gte: start, lt: endExclusive } },
        include: { food: { select: { name: true } } },
        orderBy: { eatenAt: 'desc' },
        take: 5,
      }),
    ]);

    const mealSummary = recentMeals.length
      ? recentMeals
          .map((meal) => `${meal.mealType}: ${meal.food?.name || 'Unknown'} x${meal.quantity}`)
          .join('; ')
      : 'Chua co bua an nao hom nay';

    const nutritionSummary = dailyNutrition
      ? `${dailyNutrition.totalCalories} kcal, P ${Math.round(dailyNutrition.totalProtein)}g, C ${Math.round(dailyNutrition.totalCarbs)}g, F ${Math.round(dailyNutrition.totalFat)}g`
      : 'Chua co du lieu dinh duong hom nay';

    return `Ban la AI Health Coach chuyen ve dinh duong va theo doi bua an.

THONG TIN NGUOI DUNG:
- Ten: ${profile?.fullName || user.name}
- Can nang: ${profile?.weight || 'Chua cap nhat'} kg
- Chieu cao: ${profile?.height || 'Chua cap nhat'} cm
- Muc tieu: ${goal?.goalType === 'WEIGHT_LOSS' ? 'Giam can' : goal?.goalType === 'WEIGHT_GAIN' ? 'Tang can' : goal?.goalType === 'MUSCLE_GAIN' ? 'Tang co' : 'Duy tri can nang'}
- Di ung: ${profile?.allergies?.join(', ') || 'Khong co'}
- Calo muc tieu: ${goal?.targetCalories || profile?.targetCalories || 2000}
- Dinh duong hom nay (${todayKey}): ${nutritionSummary}
- Cac bua an da ghi nhan: ${mealSummary}

NGUYEN TAC TRA LOI:
1) Ngan gon, ro rang, ton trong boi canh cua user.
2) Neu user hoi ve bua an, uu tien de xuat co dinh luong va macro du kien.
3) Neu user co di ung/han che, KHONG de xuat mon vi pham.
4) Khong dua ra chan doan y te. Neu dau hieu bat thuong, khuyen user di kham.
5) Muc tieu la giup user ghi nhat ky de theo doi du lieu chinh xac.`;
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
        const isAdmin = req.user.role === 'ADMIN';
        const requestedUserId = req.query.userId ? parseInt(req.query.userId as string) : null;
        const where = isAdmin
          ? (requestedUserId ? { userId: requestedUserId } : {})
          : { userId: req.user.id };

        const sessions = await prisma.chatSession.findMany({
            where,
            include: {
              _count: { select: { messages: true } },
              user: { select: { id: true, name: true, email: true } },
            },
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
        const isAdmin = req.user.role === 'ADMIN';
        const requestedUserId = req.query.userId ? parseInt(req.query.userId as string) : null;
        const where = isAdmin
          ? { id: parseInt(id), ...(requestedUserId ? { userId: requestedUserId } : {}) }
          : { id: parseInt(id), userId: req.user.id };

        const session = await prisma.chatSession.findFirst({
            where,
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
        const isAdmin = req.user.role === 'ADMIN';
        const session = await prisma.chatSession.findFirst({
          where: isAdmin ? { id: parseInt(id) } : { id: parseInt(id), userId: req.user.id },
        });
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
        const content = String(req.body?.content || '').trim();
        const userId = req.user.id;
        if (!content) return res.status(400).json({ error: 'Message content is required' });
        if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });

        const session = await prisma.chatSession.findFirst({ where: { id: parseInt(id), userId } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Lưu tin nhắn của người dùng
        const userMessage = await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'USER', content } });

        // Lấy lịch sử tin nhắn gần nhất (đã gồm tin vừa gửi)
        const previousMessages = await prisma.chatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'desc' },
            take: Number.isFinite(MAX_HISTORY_MESSAGES) ? MAX_HISTORY_MESSAGES : 20,
        });
        previousMessages.reverse();

        const systemPrompt = await getSystemPrompt(userId);

        // Xây dựng mảng messages cho OpenAI API
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...previousMessages.map((m) => ({
                role: toAssistantRole(m.role),
                content: m.content,
            })) as OpenAI.Chat.ChatCompletionMessageParam[],
        ];

        // Gọi OpenAI Chat Completion API
        const completion = await openai.chat.completions.create({
            model: CHAT_MODEL,
            messages: messages,
            temperature: 0.7,
        });

        const responseContent = completion.choices[0]?.message?.content || "Xin lỗi, tôi không thể xử lý yêu cầu này.";

        // Lưu phản hồi của AI
        const assistantMessage = await prisma.chatMessage.create({
            data: { sessionId: session.id, role: 'ASSISTANT', content: responseContent },
        });

        // Cập nhật thời gian của phiên chat
        const shouldUpdateTitle = session.title.startsWith('Cuộc trò chuyện') || session.title.startsWith('Cuoc tro chuyen');
        const nextTitle = shouldUpdateTitle
          ? content.slice(0, 60)
          : session.title;

        await prisma.chatSession.update({
            where: { id: session.id },
            data: { updatedAt: new Date(), title: nextTitle || session.title },
        });

        res.json({ success: true, data: assistantMessage, meta: { userMessageId: userMessage.id } });
    } catch (error: any) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error?.message || 'ChatAI internal error' });
    }
};

// Hỏi nhanh (không lưu phiên, chỉ trả lời một câu)
export const quickChat = async (req: any, res: Response) => {
    try {
        const question = String(req.body?.question || '').trim();
        const userId = req.user.id;
        if (!question) return res.status(400).json({ error: 'Question required' });
        if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });

        const systemPrompt = await getSystemPrompt(userId);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
        ];

        const completion = await openai.chat.completions.create({
            model: CHAT_MODEL,
            messages: messages,
            temperature: 0.7,
        });

        const answer = completion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này.";
        res.json({ success: true, data: { answer } });
    } catch (error: any) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error?.message || 'Quick chat internal error' });
    }
};
