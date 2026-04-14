import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { toAppDateKey, toAppDayRange } from '../utils/timezone.util';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHAT_AI_PROVIDER = (process.env.CHAT_AI_PROVIDER || 'auto').toLowerCase();
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_MODEL_CANDIDATES = (
  process.env.GEMINI_MODEL_CANDIDATES ||
  `${GEMINI_MODEL},gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash-latest,gemini-1.5-flash,gemini-1.5-pro-latest,gemini-1.5-pro`
)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const GEMINI_API_VERSIONS = (process.env.GEMINI_API_VERSIONS || 'v1,v1beta')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_ENABLED = (process.env.OLLAMA_ENABLED || (CHAT_AI_PROVIDER === 'ollama' ? 'true' : 'false')).toLowerCase() === 'true';
const parsedHistoryLimit = Number(process.env.CHAT_HISTORY_LIMIT || 20);
const MAX_HISTORY_MESSAGES = Number.isFinite(parsedHistoryLimit) ? parsedHistoryLimit : 20;

const toOpenAIRole = (role: string): 'user' | 'assistant' | 'system' => {
  if (role === 'USER') return 'user';
  if (role === 'SYSTEM') return 'system';
  return 'assistant';
};

const parsePositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const isQuotaOrRateLimitError = (error: any) => {
  const status = Number(error?.status);
  const message = String(error?.message || '');
  const code = String(error?.code || error?.error?.code || '');
  const type = String(error?.type || error?.error?.type || '');
  const lowerMessage = message.toLowerCase();
  return (
    status === 429 ||
    code === 'insufficient_quota' ||
    type === 'insufficient_quota' ||
    type === 'rate_limit_exceeded' ||
    lowerMessage.includes('quota') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('429')
  );
};

const buildQuotaFallbackReply = (question: string) => {
  const shortQuestion = question.length > 120 ? `${question.slice(0, 120)}...` : question;
  return `He thong AI tam thoi vuot gioi han quota, nen minh tra loi tam thoi o che do co ban.

Noi dung ban vua gui: "${shortQuestion}"

Goi y nhanh:
1) Uu tien bua an can bang: 1 phan dam + 1 phan rau + 1 phan tinh bot vua du.
2) Neu muc tieu giam can: giam do chien, nuoc ngot, tang rau va protein nac.
3) Neu ban can goi y chinh xac theo macro/calories, vui long thu lai sau khi cap lai quota dich vu AI.`;
};

type ProviderName = 'ollama' | 'gemini' | 'openai';

type ChatTurn = {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
};

const hasGemini = () => Boolean(process.env.GEMINI_API_KEY);
const hasOpenAI = () => Boolean(process.env.OPENAI_API_KEY);
const hasOllama = () => OLLAMA_ENABLED;

const hasAnyChatProvider = () => hasOllama() || hasGemini() || hasOpenAI();

const getProviderChain = (): ProviderName[] => {
  if (CHAT_AI_PROVIDER === 'ollama') {
    return ['ollama', 'gemini', 'openai'];
  }
  if (CHAT_AI_PROVIDER === 'gemini') {
    return ['gemini', 'ollama', 'openai'];
  }
  if (CHAT_AI_PROVIDER === 'openai') {
    return ['openai', 'ollama', 'gemini'];
  }
  if (hasOllama()) {
    return ['ollama', 'gemini', 'openai'];
  }
  return ['gemini', 'openai', 'ollama'];
};

const buildGeminiPrompt = (systemPrompt: string, turns: ChatTurn[]) => {
  const history = turns
    .map((turn) => {
      const roleLabel = turn.role === 'USER' ? 'USER' : turn.role === 'ASSISTANT' ? 'ASSISTANT' : 'SYSTEM';
      return `${roleLabel}: ${turn.content}`;
    })
    .join('\n\n');

  return `${systemPrompt}

=== CONVERSATION ===
${history}

=== TASK ===
Tra loi voi vai tro ASSISTANT. Tra loi ngan gon, chinh xac, huu ich.`;
};

const isModelNotFoundError = (error: any) => {
  const status = Number(error?.status);
  const message = String(error?.message || '').toLowerCase();
  return status === 404 || message.includes('model') && message.includes('not found');
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

type OllamaTagsResponse = {
  models?: Array<{ name?: string; model?: string }>;
};

const callGeminiGenerateContent = async (model: string, version: string, prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as GeminiGenerateResponse;
  if (!response.ok) {
    const error: any = new Error(data?.error?.message || `Gemini API failed with status ${response.status}`);
    error.status = response.status;
    error.code = data?.error?.status;
    error.raw = data;
    throw error;
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim();
  if (!text) {
    const error: any = new Error('Gemini returned empty response');
    error.status = 502;
    throw error;
  }

  return text;
};

const generateWithGemini = async (systemPrompt: string, turns: ChatTurn[]) => {
  if (!hasGemini()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = buildGeminiPrompt(systemPrompt, turns);
  let lastError: any = null;

  for (const version of GEMINI_API_VERSIONS) {
    for (const modelName of GEMINI_MODEL_CANDIDATES) {
      try {
        const text = await callGeminiGenerateContent(modelName, version, prompt);
        return text;
      } catch (error: any) {
        lastError = error;
        if (isModelNotFoundError(error)) {
          console.warn('[ChatAI] gemini model/version unavailable, trying next option', {
            model: modelName,
            version,
            status: error?.status,
            message: error?.message,
          });
          continue;
        }
        throw error;
      }
    }
  }

  throw lastError || new Error('No valid Gemini model available');
};

const generateWithOllama = async (systemPrompt: string, turns: ChatTurn[]) => {
  if (!hasOllama()) {
    throw new Error('OLLAMA is not enabled');
  }

  const prompt = buildGeminiPrompt(systemPrompt, turns);
  let response: globalThis.Response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
        },
      }),
    });
  } catch (error: any) {
    const wrapped: any = new Error(
      `Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Start Ollama and pull model "${OLLAMA_MODEL}".`
    );
    wrapped.status = 503;
    wrapped.code = error?.code;
    throw wrapped;
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  if (!response.ok || data?.error) {
    const wrapped: any = new Error(
      data?.error || `Ollama request failed with status ${response.status}. Ensure model "${OLLAMA_MODEL}" is available.`
    );
    wrapped.status = response.status || 500;
    throw wrapped;
  }

  const text = String(data?.response || '').trim();
  if (!text) {
    const wrapped: any = new Error('Ollama returned empty response');
    wrapped.status = 502;
    throw wrapped;
  }

  return text;
};

const generateWithOpenAI = async (systemPrompt: string, turns: ChatTurn[]) => {
  if (!hasOpenAI()) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...turns.map((turn) => ({
      role: toOpenAIRole(turn.role),
      content: turn.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || 'Xin loi, toi khong the xu ly yeu cau nay.';
};

const checkOllamaHealth = async () => {
  if (!hasOllama()) {
    return {
      enabled: false,
      reachable: false,
      modelReady: false,
      model: OLLAMA_MODEL,
      baseUrl: OLLAMA_BASE_URL,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    const data = (await response.json()) as OllamaTagsResponse;
    const modelNames = (data?.models || []).map((m) => (m.name || m.model || '').trim()).filter(Boolean);
    const modelReady = modelNames.some((name) => name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`));

    return {
      enabled: true,
      reachable: response.ok,
      modelReady,
      model: OLLAMA_MODEL,
      baseUrl: OLLAMA_BASE_URL,
      availableModels: modelNames,
      status: response.status,
    };
  } catch (error: any) {
    return {
      enabled: true,
      reachable: false,
      modelReady: false,
      model: OLLAMA_MODEL,
      baseUrl: OLLAMA_BASE_URL,
      error: error?.name === 'AbortError' ? 'timeout' : error?.message || 'unknown',
    };
  } finally {
    clearTimeout(timeout);
  }
};

const generateAssistantReply = async (systemPrompt: string, turns: ChatTurn[]) => {
  const providers = getProviderChain();
  let lastError: any = null;

  for (const provider of providers) {
    try {
      if (provider === 'ollama' && hasOllama()) {
        const text = await generateWithOllama(systemPrompt, turns);
        return { text, provider: 'ollama' as const };
      }

      if (provider === 'gemini' && hasGemini()) {
        const text = await generateWithGemini(systemPrompt, turns);
        return { text, provider: 'gemini' as const };
      }

      if (provider === 'openai' && hasOpenAI()) {
        const text = await generateWithOpenAI(systemPrompt, turns);
        return { text, provider: 'openai' as const };
      }
    } catch (error: any) {
      lastError = error;
      console.warn('[ChatAI] provider failed, try next provider', {
        provider,
        message: error?.message,
        status: error?.status,
        code: error?.code || error?.error?.code,
      });
    }
  }

  throw lastError || new Error('No available AI provider');
};

const getSystemPrompt = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, goals: { where: { isActive: true } } },
  });

  if (!user) return 'Ban la AI health coach chuyen gia dinh duong va suc khoe.';

  const profile = user.profile;
  const goal = user.goals[0];
  const now = new Date();
  const todayKey = toAppDateKey(now);
  const { start, endExclusive } = toAppDayRange(now);

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

  const mealSummary =
    recentMeals.length > 0
      ? recentMeals
          .map((meal) => `${meal.mealType}: ${meal.food?.name || 'Unknown'} x${meal.quantity}`)
          .join('; ')
      : 'Chua co bua an nao hom nay';

  const nutritionSummary = dailyNutrition
    ? `${dailyNutrition.totalCalories} kcal, P ${Math.round(dailyNutrition.totalProtein)}g, C ${Math.round(dailyNutrition.totalCarbs)}g, F ${Math.round(dailyNutrition.totalFat)}g`
    : 'Chua co du lieu dinh duong hom nay';

  const userGoal =
    goal?.goalType === 'WEIGHT_LOSS'
      ? 'Giam can'
      : goal?.goalType === 'WEIGHT_GAIN'
        ? 'Tang can'
        : goal?.goalType === 'MUSCLE_GAIN'
          ? 'Tang co'
          : 'Duy tri can nang';

  return `Ban la AI Health Coach chuyen ve dinh duong va theo doi bua an.

THONG TIN NGUOI DUNG:
- Ten: ${profile?.fullName || user.name}
- Can nang: ${profile?.weight || 'Chua cap nhat'} kg
- Chieu cao: ${profile?.height || 'Chua cap nhat'} cm
- Muc tieu: ${userGoal}
- Di ung: ${profile?.allergies?.join(', ') || 'Khong co'}
- Calo muc tieu: ${goal?.targetCalories || profile?.targetCalories || 2000}
- Dinh duong hom nay (${todayKey}): ${nutritionSummary}
- Cac bua an da ghi nhan: ${mealSummary}

NGUYEN TAC TRA LOI:
1) Ngan gon, ro rang, ton trong boi canh user.
2) Neu user hoi ve bua an, uu tien de xuat co dinh luong va macro du kien.
3) Neu user co di ung/han che, KHONG de xuat mon vi pham.
4) Khong dua chan doan y te. Neu co dau hieu bat thuong, khuyen user di kham.
5) Muc tieu la giup user ghi nhat ky de theo doi du lieu chinh xac.`;
};

export const healthCheck = async (req: any, res: Response) => {
  try {
    const ollama = await checkOllamaHealth();
    return res.json({
      success: true,
      data: {
        providerMode: CHAT_AI_PROVIDER,
        providerChain: getProviderChain(),
        providers: {
          ollama,
          gemini: {
            configured: hasGemini(),
            model: GEMINI_MODEL,
            candidates: GEMINI_MODEL_CANDIDATES,
            apiVersions: GEMINI_API_VERSIONS,
          },
          openai: {
            configured: hasOpenAI(),
            model: CHAT_MODEL,
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'chat health check failed',
    });
  }
};

export const createSession = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const rawTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const title = rawTitle || `Cuoc tro chuyen ${new Date().toLocaleDateString()}`;

    const session = await prisma.chatSession.create({
      data: { userId, title },
    });

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessions = async (req: any, res: Response) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const requestedUserId = parsePositiveInt(req.query.userId);
    const where = isAdmin ? (requestedUserId ? { userId: requestedUserId } : {}) : { userId: req.user.id };

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

export const getSession = async (req: any, res: Response) => {
  try {
    const sessionId = parsePositiveInt(req.params.id);
    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' });

    const isAdmin = req.user.role === 'ADMIN';
    const requestedUserId = parsePositiveInt(req.query.userId);
    const where = isAdmin
      ? { id: sessionId, ...(requestedUserId ? { userId: requestedUserId } : {}) }
      : { id: sessionId, userId: req.user.id };

    const session = await prisma.chatSession.findFirst({
      where,
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSession = async (req: any, res: Response) => {
  try {
    const sessionId = parsePositiveInt(req.params.id);
    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' });

    const isAdmin = req.user.role === 'ADMIN';
    const session = await prisma.chatSession.findFirst({
      where: isAdmin ? { id: sessionId } : { id: sessionId, userId: req.user.id },
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    await prisma.chatSession.delete({ where: { id: sessionId } });
    res.json({ success: true, message: 'Session deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const sessionId = parsePositiveInt(req.params.id);
    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' });

    const userId = req.user.id;
    const content = String(req.body?.content || '').trim();

    if (!content) return res.status(400).json({ error: 'Message content is required' });
    if (!hasAnyChatProvider()) {
      return res.status(500).json({ error: 'No AI provider configured. Set OLLAMA_ENABLED=true or GEMINI_API_KEY or OPENAI_API_KEY.' });
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const userMessage = await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'USER', content },
    });

    const historyMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_MESSAGES,
    });
    historyMessages.reverse();

    const systemPrompt = await getSystemPrompt(userId);
    const turns: ChatTurn[] = historyMessages.map((m) => ({
      role: m.role as ChatTurn['role'],
      content: m.content,
    }));

    let responseContent = 'Xin loi, toi khong the xu ly yeu cau nay.';
    let degraded = false;
    let degradedReason: string | null = null;
    let aiProviderUsed: ProviderName | 'fallback' = 'fallback';

    try {
      const generated = await generateAssistantReply(systemPrompt, turns);
      responseContent = generated.text || responseContent;
      aiProviderUsed = generated.provider;
    } catch (error: any) {
      if (isQuotaOrRateLimitError(error)) {
        degraded = true;
        degradedReason = 'insufficient_quota';
        responseContent = buildQuotaFallbackReply(content);
        aiProviderUsed = 'fallback';
        console.warn('[ChatAI] provider quota/rate limited', {
          status: error?.status,
          code: error?.code || error?.error?.code,
          requestId: error?.requestID,
          providerMode: CHAT_AI_PROVIDER,
        });
      } else {
        throw error;
      }
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'ASSISTANT', content: responseContent },
    });

    const shouldUpdateTitle = session.title.startsWith('Cuoc tro chuyen');
    const nextTitle = shouldUpdateTitle ? content.slice(0, 60) : session.title;

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date(), title: nextTitle || session.title },
    });

    res.json({
      success: true,
      data: assistantMessage,
      meta: { userMessageId: userMessage.id, degraded, degradedReason, aiProvider: aiProviderUsed },
    });
  } catch (error: any) {
    console.error('[ChatAI] sendMessage failed', {
      message: error?.message,
      status: error?.status,
      code: error?.code || error?.error?.code,
      requestId: error?.requestID,
    });
    res.status(500).json({ error: error?.message || 'ChatAI internal error' });
  }
};

export const quickChat = async (req: any, res: Response) => {
  try {
    const question = String(req.body?.question || '').trim();
    const userId = req.user.id;

    if (!question) return res.status(400).json({ error: 'Question required' });
    if (!hasAnyChatProvider()) {
      return res.status(500).json({ error: 'No AI provider configured. Set OLLAMA_ENABLED=true or GEMINI_API_KEY or OPENAI_API_KEY.' });
    }

    const systemPrompt = await getSystemPrompt(userId);
    const turns: ChatTurn[] = [{ role: 'USER', content: question }];

    try {
      const generated = await generateAssistantReply(systemPrompt, turns);
      const answer = generated.text || 'Xin loi, toi khong the tra loi cau hoi nay.';
      return res.json({ success: true, data: { answer, degraded: false, aiProvider: generated.provider } });
    } catch (error: any) {
      if (isQuotaOrRateLimitError(error)) {
        console.warn('[ChatAI] provider quota/rate limited (quickChat)', {
          status: error?.status,
          code: error?.code || error?.error?.code,
          requestId: error?.requestID,
          providerMode: CHAT_AI_PROVIDER,
        });
        return res.json({
          success: true,
          data: {
            answer: buildQuotaFallbackReply(question),
            degraded: true,
            degradedReason: 'insufficient_quota',
            aiProvider: 'fallback',
          },
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('[ChatAI] quickChat failed', {
      message: error?.message,
      status: error?.status,
      code: error?.code || error?.error?.code,
      requestId: error?.requestID,
    });
    res.status(500).json({ error: error?.message || 'Quick chat internal error' });
  }
};
