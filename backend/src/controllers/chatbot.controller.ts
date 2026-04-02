import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

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

export const getSessions = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
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

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const session = await prisma.chatSession.findFirst({ where: { id: parseInt(id), userId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'USER', content },
    });

    const systemPrompt = await getSystemPrompt(userId);
    const previousMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const history = previousMessages.map(m => ({
      role: m.role === 'USER' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', safetySettings });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(content);
    const response = result.response.text();

    const assistantMessage = await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'ASSISTANT', content: response },
    });

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    res.json({ success: true, data: assistantMessage });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const quickChat = async (req: any, res: Response) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;
    if (!question) return res.status(400).json({ error: 'Question required' });

    const systemPrompt = await getSystemPrompt(userId);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', safetySettings });
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: question }] },
      ],
    });
    const answer = result.response.text();
    res.json({ success: true, data: { answer } });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: error.message });
  }
};