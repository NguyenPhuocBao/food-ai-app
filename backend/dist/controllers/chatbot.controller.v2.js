"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickChat = exports.sendMessage = exports.deleteSession = exports.getSession = exports.getSessions = exports.createSession = exports.benchmarkTrainingData = exports.bootstrapDefaultTrainingData = exports.updateTrainingData = exports.getTrainingData = exports.healthCheck = void 0;
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const timezone_util_1 = require("../utils/timezone.util");
const chatbot_training_defaults_1 = require("../data/chatbot-training-defaults");
const prisma = new client_1.PrismaClient();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const grokBaseURL = (process.env.XAI_BASE_URL || 'https://api.x.ai/v1').replace(/\/+$/, '');
const grokClient = new openai_1.default({
    apiKey: process.env.XAI_API_KEY,
    baseURL: grokBaseURL,
});
const rawProviderMode = (process.env.CHAT_AI_PROVIDER || 'auto').toLowerCase();
const CHAT_AI_PROVIDER = rawProviderMode === 'gemini' || rawProviderMode === 'openai' || rawProviderMode === 'retrieval' || rawProviderMode === 'grok'
    ? rawProviderMode
    : 'auto';
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const GROK_MODEL = process.env.XAI_MODEL || 'grok-4.20-beta-latest-non-reasoning';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_MODEL_CANDIDATES = (process.env.GEMINI_MODEL_CANDIDATES ||
    `${GEMINI_MODEL},gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash-latest,gemini-1.5-flash,gemini-1.5-pro-latest,gemini-1.5-pro`)
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
const GEMINI_API_VERSIONS = (process.env.GEMINI_API_VERSIONS || 'v1,v1beta')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
const parsedHistoryLimit = Number(process.env.CHAT_HISTORY_LIMIT || 8);
const MAX_HISTORY_MESSAGES = Number.isFinite(parsedHistoryLimit) && parsedHistoryLimit > 0
    ? Math.floor(parsedHistoryLimit)
    : 8;
const toOpenAIRole = (role) => {
    if (role === 'USER')
        return 'user';
    if (role === 'SYSTEM')
        return 'system';
    return 'assistant';
};
const parsePositiveInt = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0)
        return null;
    return parsed;
};
const isQuotaOrRateLimitError = (error) => {
    const status = Number(error?.status);
    const message = String(error?.message || '');
    const code = String(error?.code || error?.error?.code || '');
    const type = String(error?.type || error?.error?.type || '');
    const lowerMessage = message.toLowerCase();
    return (status === 429 ||
        code === 'insufficient_quota' ||
        type === 'insufficient_quota' ||
        type === 'rate_limit_exceeded' ||
        lowerMessage.includes('quota') ||
        lowerMessage.includes('rate limit') ||
        lowerMessage.includes('429'));
};
const buildQuotaFallbackReply = (question) => {
    const shortQuestion = question.length > 120 ? `${question.slice(0, 120)}...` : question;
    return `He thong AI tam thoi vuot gioi han quota, nen minh tra loi tam thoi o che do co ban.

Noi dung ban vua gui: "${shortQuestion}"

Goi y nhanh:
1) Uu tien bua an can bang: 1 phan dam + 1 phan rau + 1 phan tinh bot vua du.
2) Neu muc tieu giam can: giam do chien, nuoc ngot, tang rau va protein nac.
3) Neu ban can goi y chinh xac theo macro/calories, vui long thu lai sau khi cap lai quota dich vu AI.`;
};
const buildServiceFallbackReply = (question) => {
    const shortQuestion = question.length > 120 ? `${question.slice(0, 120)}...` : question;
    return `He thong AI dang cham hoac tam thoi gian doan, nen minh tra loi o che do co ban.

Noi dung ban vua gui: "${shortQuestion}"

Goi y nhanh:
1) Neu ban can giam can: uu tien dam nac + rau, giam do ngot va do chien.
2) Neu ban can tang co: chia 3 bua chinh + 1-2 bua phu, dam bao protein moi bua.
3) Ban co the hoi lai ngan gon hon de he thong tra loi nhanh va sat muc tieu hon.`;
};
const CHAT_TRAINING_SETTINGS_KEY = 'chatbot_training_examples';
const MAX_TRAINING_EXAMPLES = 1000;
const MAX_EXAMPLES_IN_PROMPT = 4;
const DEFAULT_BENCHMARK_SAMPLE_SIZE = 120;
const MAX_BENCHMARK_SAMPLE_SIZE = 300;
const isRetrievalOnlyMode = CHAT_AI_PROVIDER === 'retrieval';
const hasGrok = () => Boolean(process.env.XAI_API_KEY);
const hasGemini = () => Boolean(process.env.GEMINI_API_KEY);
const hasOpenAI = () => Boolean(process.env.OPENAI_API_KEY);
const hasAnyChatProvider = () => isRetrievalOnlyMode || hasGrok() || hasGemini() || hasOpenAI();
const getProviderChain = () => {
    if (CHAT_AI_PROVIDER === 'retrieval') {
        return ['retrieval'];
    }
    if (CHAT_AI_PROVIDER === 'grok') {
        return ['grok', 'retrieval', 'gemini', 'openai'];
    }
    if (CHAT_AI_PROVIDER === 'gemini') {
        return ['gemini', 'grok', 'openai', 'retrieval'];
    }
    if (CHAT_AI_PROVIDER === 'openai') {
        return ['openai', 'grok', 'gemini', 'retrieval'];
    }
    return ['grok', 'gemini', 'openai', 'retrieval'];
};
const normalizeText = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const tokenize = (value) => normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);
const normalizeTrainingExamples = (raw) => {
    if (!Array.isArray(raw))
        return [];
    const dedupe = new Set();
    const normalized = [];
    for (const [index, item] of raw.entries()) {
        const question = String(item?.question || '').trim();
        const answer = String(item?.answer || '').trim();
        if (!question || !answer)
            continue;
        const tags = Array.isArray(item?.tags)
            ? item.tags
                .map((tag) => String(tag || '').trim())
                .filter(Boolean)
                .slice(0, 8)
            : [];
        const dedupeKey = `${question.toLowerCase()}||${answer.toLowerCase()}`;
        if (dedupe.has(dedupeKey))
            continue;
        dedupe.add(dedupeKey);
        const rawId = String(item?.id || '').trim();
        const id = rawId || `ex-${index + 1}`;
        normalized.push({ id, question, answer, tags });
        if (normalized.length >= MAX_TRAINING_EXAMPLES)
            break;
    }
    return normalized;
};
const getDefaultTrainingExamples = () => normalizeTrainingExamples(chatbot_training_defaults_1.DEFAULT_CHATBOT_TRAINING_EXAMPLES);
const loadTrainingExamples = async () => {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: CHAT_TRAINING_SETTINGS_KEY },
        select: { value: true },
    });
    if (!setting?.value) {
        return {
            examples: getDefaultTrainingExamples(),
            source: 'default',
        };
    }
    try {
        const parsed = JSON.parse(setting.value);
        const examples = normalizeTrainingExamples(parsed);
        if (examples.length > 0) {
            return {
                examples,
                source: 'custom',
            };
        }
        return {
            examples: getDefaultTrainingExamples(),
            source: 'default',
        };
    }
    catch {
        return {
            examples: getDefaultTrainingExamples(),
            source: 'default',
        };
    }
};
const selectRelevantExamples = (examples, userQuestion) => {
    if (!examples.length)
        return [];
    const queryTokens = new Set(tokenize(userQuestion));
    if (!queryTokens.size)
        return examples.slice(0, Math.min(2, examples.length));
    const ranked = examples
        .map((example) => {
        const questionTokens = tokenize(example.question);
        const answerTokens = tokenize(example.answer);
        const tagTokens = example.tags.flatMap((tag) => tokenize(tag));
        const allTokens = new Set([...questionTokens, ...answerTokens, ...tagTokens]);
        let overlap = 0;
        for (const token of queryTokens) {
            if (allTokens.has(token))
                overlap += 1;
        }
        const questionBonus = questionTokens.some((token) => queryTokens.has(token)) ? 2 : 0;
        const tagBonus = tagTokens.some((token) => queryTokens.has(token)) ? 1 : 0;
        return {
            example,
            score: overlap + questionBonus + tagBonus,
        };
    })
        .sort((a, b) => b.score - a.score);
    const positive = ranked.filter((item) => item.score > 0).slice(0, MAX_EXAMPLES_IN_PROMPT);
    if (positive.length > 0)
        return positive.map((item) => item.example);
    return ranked.slice(0, Math.min(2, ranked.length)).map((item) => item.example);
};
const buildBenchmarkQuestionVariant = (question, index) => {
    const trimmed = question.trim();
    if (!trimmed)
        return question;
    const mode = index % 5;
    if (mode === 0)
        return `Tu van cho toi: ${trimmed}`;
    if (mode === 1)
        return `${trimmed} Neu muon ap dung ngay thi bat dau tu dau?`;
    if (mode === 2)
        return `Truong hop cua toi la ${trimmed.toLowerCase()}.`;
    if (mode === 3)
        return `${trimmed.replace(/\btoi\b/gi, 'minh')} duoc khong?`;
    return `${trimmed} Ban cho phuong an ngan gon 3 buoc.`;
};
const answerJaccardScore = (expected, predicted) => {
    const expectedTokens = new Set(tokenize(expected));
    const predictedTokens = new Set(tokenize(predicted));
    if (!expectedTokens.size || !predictedTokens.size)
        return 0;
    let intersection = 0;
    for (const token of expectedTokens) {
        if (predictedTokens.has(token))
            intersection += 1;
    }
    const union = expectedTokens.size + predictedTokens.size - intersection;
    return union > 0 ? intersection / union : 0;
};
const buildBenchmarkSample = (examples, requested) => {
    const maxSample = Math.min(examples.length, MAX_BENCHMARK_SAMPLE_SIZE);
    const desired = requested ? Math.min(Math.max(requested, 20), maxSample) : Math.min(DEFAULT_BENCHMARK_SAMPLE_SIZE, maxSample);
    const sample = [];
    const step = Math.max(1, Math.floor(examples.length / Math.max(desired, 1)));
    for (let i = 0; i < examples.length && sample.length < desired; i += step) {
        sample.push(examples[i]);
    }
    for (const item of examples) {
        if (sample.length >= desired)
            break;
        if (!sample.includes(item))
            sample.push(item);
    }
    return sample;
};
const mapGoalTypeToLabel = (goalType) => {
    if (goalType === 'WEIGHT_LOSS')
        return 'Giam can';
    if (goalType === 'WEIGHT_GAIN')
        return 'Tang can';
    if (goalType === 'MUSCLE_GAIN')
        return 'Tang co';
    return 'Duy tri can nang';
};
const buildRuleBasedRetrievalAnswer = (question, goalLabel, allergies) => {
    const q = normalizeText(question);
    if (q.includes('tieu duong')) {
        const lines = [
            'Voi tieu duong type 2, bua toi nen theo nguyen tac dia an:',
            '- 1/2 dia rau xanh khong sot ngot.',
            '- 1/4 dia dam nac (ca, ga bo da, dau hu, trung).',
            '- 1/4 dia tinh bot hap thu cham (gao lut, khoai, bun/mi nguyen cam) voi khau phan vua phai.',
            '- Han che nuoc ngot, tra sua, banh trang mieng nhieu duong vao buoi toi.',
            '- Sau an nen di bo nhe 10-15 phut de ho tro duong huyet.',
        ];
        if (allergies.length > 0) {
            lines.push(`- Luu y di ung: tranh nhom mon lien quan den ${allergies.join(', ')}.`);
        }
        lines.push('Neu dang dung thuoc ha duong huyet/insulin, theo doi duong huyet va trao doi bac si khi can.');
        return lines.join('\n');
    }
    if (q.includes('cao huyet ap') || q.includes('huyet ap')) {
        return [
            'Voi cao huyet ap, uu tien an nhat:',
            '- Giam muoi (muc tieu <5g muoi/ngay), han che mon kho, mon nuoc dung dong goi.',
            '- Uu tien dam nac + rau xanh + tinh bot vua du.',
            '- Giam do an che bien san, xuc xich, do hop, mi goi.',
            '- Tang thuc pham giau kali tu rau cu trai cay nguyen qua.',
            'Theo doi huyet ap dinh ky va tu van bac si neu huyet ap tang dai dang.',
        ].join('\n');
    }
    if (q.includes('tang co') || q.includes('gym') || q.includes('sau tap')) {
        return [
            'De ho tro tang co:',
            '- Du protein 1.6-2.2g/kg/ngay, chia deu 3-4 bua.',
            '- Sau tap 30-60 phut: 25-35g protein + it carb de phuc hoi.',
            '- Ngu 7-8 gio moi dem va tap tien bo tai.',
            '- Uu tien thuc pham it che bien, theo doi can nang va so do co the theo tuan.',
        ].join('\n');
    }
    if (q.includes('giam can') || q.includes('giam mo')) {
        return [
            'De giam can ben vung:',
            '- Tao tham hut nhe 300-500 kcal/ngay.',
            '- Moi bua uu tien dam nac + rau xanh, giam do ngot va do chien.',
            '- Duy tri van dong deu (di bo nhanh/tap suc manh).',
            '- Theo doi can nang 1-2 lan/tuan de dieu chinh khau phan.',
        ].join('\n');
    }
    if (q.includes('an dem') || q.includes('them do ngot')) {
        return [
            'Neu hay an dem, ban co the xu ly theo 3 buoc:',
            '- Sua bua toi: them dam + chat xo de giam doi muon.',
            '- Dat gio dong bep co dinh, khong de snack ngot trong tam tay.',
            '- Neu van doi, dung bua phu nho: sua chua khong duong/hat dinh luong/trai cay it ngot.',
        ].join('\n');
    }
    if (goalLabel === 'Tang co') {
        return 'Muc tieu tang co: uu tien dam nac moi bua, carb quanh buoi tap, ngu du va tap tien bo tai.';
    }
    if (goalLabel === 'Giam can') {
        return 'Muc tieu giam can: giu tham hut nhe, uu tien dam nac + rau, han che do ngot/chien va theo doi tien trinh theo tuan.';
    }
    return null;
};
const generateWithRetrieval = async (userId, question) => {
    const [trainingConfig, user] = await Promise.all([
        loadTrainingExamples(),
        prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: { select: { allergies: true } },
                goals: { where: { isActive: true }, take: 1, select: { goalType: true } },
            },
        }),
    ]);
    const candidates = selectRelevantExamples(trainingConfig.examples, question);
    if (!candidates.length) {
        return buildServiceFallbackReply(question);
    }
    const top = candidates[0];
    const secondary = candidates.slice(1, 3);
    const allergies = user?.profile?.allergies?.filter(Boolean) || [];
    const goalLabel = mapGoalTypeToLabel(user?.goals?.[0]?.goalType);
    const ruleBasedAnswer = buildRuleBasedRetrievalAnswer(question, goalLabel, allergies);
    if (ruleBasedAnswer) {
        return ruleBasedAnswer;
    }
    const lines = [top.answer];
    if (secondary.length > 0) {
        lines.push(`Goi y bo sung: ${secondary[0].answer}`);
    }
    lines.push(`Muc tieu hien tai cua ban: ${goalLabel}.`);
    if (allergies.length > 0) {
        lines.push(`Luu y di ung: tranh cac nhom mon lien quan den ${allergies.join(', ')}.`);
    }
    lines.push('Neu co benh nen hoac dang dung thuoc, uu tien trao doi bac si de ca nhan hoa.');
    return lines.join('\n');
};
const buildGeminiPrompt = (systemPrompt, turns) => {
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
const isModelNotFoundError = (error) => {
    const status = Number(error?.status);
    const message = String(error?.message || '').toLowerCase();
    return status === 404 || message.includes('model') && message.includes('not found');
};
const isTimeoutError = (error) => {
    const status = Number(error?.status);
    const message = String(error?.message || '').toLowerCase();
    return status === 504 || message.includes('timeout') || message.includes('timed out');
};
const callGeminiGenerateContent = async (model, version, prompt) => {
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
    const data = (await response.json());
    if (!response.ok) {
        const error = new Error(data?.error?.message || `Gemini API failed with status ${response.status}`);
        error.status = response.status;
        error.code = data?.error?.status;
        error.raw = data;
        throw error;
    }
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim();
    if (!text) {
        const error = new Error('Gemini returned empty response');
        error.status = 502;
        throw error;
    }
    return text;
};
const generateWithGemini = async (systemPrompt, turns) => {
    if (!hasGemini()) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    const prompt = buildGeminiPrompt(systemPrompt, turns);
    let lastError = null;
    for (const version of GEMINI_API_VERSIONS) {
        for (const modelName of GEMINI_MODEL_CANDIDATES) {
            try {
                const text = await callGeminiGenerateContent(modelName, version, prompt);
                return text;
            }
            catch (error) {
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
const generateWithOpenAI = async (systemPrompt, turns) => {
    if (!hasOpenAI()) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    const messages = [
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
const generateWithGrok = async (systemPrompt, turns) => {
    if (!hasGrok()) {
        throw new Error('XAI_API_KEY is not configured');
    }
    const messages = [
        { role: 'system', content: systemPrompt },
        ...turns.map((turn) => ({
            role: toOpenAIRole(turn.role),
            content: turn.content,
        })),
    ];
    const completion = await grokClient.chat.completions.create({
        model: GROK_MODEL,
        messages,
        temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || 'Xin loi, toi khong the xu ly yeu cau nay.';
};
const generateAssistantReply = async (systemPrompt, turns, userId, question) => {
    const providers = getProviderChain();
    let lastError = null;
    for (const provider of providers) {
        try {
            if (provider === 'grok' && hasGrok()) {
                const text = await generateWithGrok(systemPrompt, turns);
                return { text, provider: 'grok' };
            }
            if (provider === 'retrieval') {
                const text = await generateWithRetrieval(userId, question);
                return { text, provider: 'retrieval' };
            }
            if (provider === 'gemini' && hasGemini()) {
                const text = await generateWithGemini(systemPrompt, turns);
                return { text, provider: 'gemini' };
            }
            if (provider === 'openai' && hasOpenAI()) {
                const text = await generateWithOpenAI(systemPrompt, turns);
                return { text, provider: 'openai' };
            }
        }
        catch (error) {
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
const getSystemPrompt = async (userId, userQuestion) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, goals: { where: { isActive: true } } },
    });
    if (!user)
        return 'Ban la AI health coach chuyen gia dinh duong va suc khoe.';
    const profile = user.profile;
    const goal = user.goals[0];
    const now = new Date();
    const todayKey = (0, timezone_util_1.toAppDateKey)(now);
    const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(now);
    const [dailyNutrition, recentMeals, trainingConfig] = await Promise.all([
        prisma.dailyNutrition.findUnique({
            where: { userId_date: { userId, date: start } },
        }),
        prisma.meal.findMany({
            where: { userId, eatenAt: { gte: start, lt: endExclusive } },
            include: { food: { select: { name: true } } },
            orderBy: { eatenAt: 'desc' },
            take: 5,
        }),
        loadTrainingExamples(),
    ]);
    const mealSummary = recentMeals.length > 0
        ? recentMeals
            .map((meal) => `${meal.mealType}: ${meal.food?.name || 'Unknown'} x${meal.quantity}`)
            .join('; ')
        : 'Chua co bua an nao hom nay';
    const nutritionSummary = dailyNutrition
        ? `${dailyNutrition.totalCalories} kcal, P ${Math.round(dailyNutrition.totalProtein)}g, C ${Math.round(dailyNutrition.totalCarbs)}g, F ${Math.round(dailyNutrition.totalFat)}g`
        : 'Chua co du lieu dinh duong hom nay';
    const userGoal = mapGoalTypeToLabel(goal?.goalType);
    const relevantExamples = selectRelevantExamples(trainingConfig.examples, userQuestion);
    const trainingSection = relevantExamples.length
        ? relevantExamples
            .map((example, index) => `${index + 1}) USER: ${example.question}\nASSISTANT: ${example.answer}${example.tags.length ? `\nTAGS: ${example.tags.join(', ')}` : ''}`)
            .join('\n\n')
        : 'Khong co du lieu train mau.';
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

DU LIEU TRAIN THAM KHAO:
${trainingSection}

NGUYEN TAC TRA LOI:
1) Ngan gon, ro rang, ton trong boi canh user.
2) Neu user hoi ve bua an, uu tien de xuat co dinh luong va macro du kien.
3) Neu user co di ung/han che, KHONG de xuat mon vi pham.
4) Khong dua chan doan y te. Neu co dau hieu bat thuong, khuyen user di kham.
5) Muc tieu la giup user ghi nhat ky de theo doi du lieu chinh xac.`;
};
const healthCheck = async (req, res) => {
    try {
        const trainingConfig = await loadTrainingExamples();
        return res.json({
            success: true,
            data: {
                providerMode: CHAT_AI_PROVIDER,
                providerChain: getProviderChain(),
                providers: {
                    retrieval: {
                        enabled: true,
                        active: isRetrievalOnlyMode,
                    },
                    grok: {
                        configured: hasGrok(),
                        model: GROK_MODEL,
                        baseUrl: grokBaseURL,
                    },
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
                training: {
                    key: CHAT_TRAINING_SETTINGS_KEY,
                    totalExamples: trainingConfig.examples.length,
                    source: trainingConfig.source,
                    defaultExamples: getDefaultTrainingExamples().length,
                    maxExamples: MAX_TRAINING_EXAMPLES,
                    maxExamplesInPrompt: MAX_EXAMPLES_IN_PROMPT,
                },
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error?.message || 'chat health check failed',
        });
    }
};
exports.healthCheck = healthCheck;
const getTrainingData = async (req, res) => {
    try {
        const trainingConfig = await loadTrainingExamples();
        return res.json({
            success: true,
            data: {
                key: CHAT_TRAINING_SETTINGS_KEY,
                source: trainingConfig.source,
                examples: trainingConfig.examples,
                total: trainingConfig.examples.length,
                defaultExamples: getDefaultTrainingExamples().length,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error?.message || 'Cannot load chatbot training data' });
    }
};
exports.getTrainingData = getTrainingData;
const updateTrainingData = async (req, res) => {
    try {
        const normalizedExamples = normalizeTrainingExamples(req.body?.examples);
        await prisma.systemSetting.upsert({
            where: { key: CHAT_TRAINING_SETTINGS_KEY },
            update: {
                value: JSON.stringify(normalizedExamples),
                group: 'ai',
            },
            create: {
                key: CHAT_TRAINING_SETTINGS_KEY,
                value: JSON.stringify(normalizedExamples),
                group: 'ai',
            },
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_CHATBOT_TRAINING',
                entity: 'SystemSetting',
                newData: {
                    key: CHAT_TRAINING_SETTINGS_KEY,
                    total: normalizedExamples.length,
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            },
        });
        return res.json({
            success: true,
            message: `Chatbot training updated with ${normalizedExamples.length} examples`,
            data: {
                key: CHAT_TRAINING_SETTINGS_KEY,
                total: normalizedExamples.length,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error?.message || 'Cannot update chatbot training data' });
    }
};
exports.updateTrainingData = updateTrainingData;
const bootstrapDefaultTrainingData = async (req, res) => {
    try {
        const defaults = getDefaultTrainingExamples();
        await prisma.systemSetting.upsert({
            where: { key: CHAT_TRAINING_SETTINGS_KEY },
            update: {
                value: JSON.stringify(defaults),
                group: 'ai',
            },
            create: {
                key: CHAT_TRAINING_SETTINGS_KEY,
                value: JSON.stringify(defaults),
                group: 'ai',
            },
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'BOOTSTRAP_CHATBOT_TRAINING_DEFAULTS',
                entity: 'SystemSetting',
                newData: {
                    key: CHAT_TRAINING_SETTINGS_KEY,
                    total: defaults.length,
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            },
        });
        return res.json({
            success: true,
            message: `Default chatbot training bootstrapped: ${defaults.length} examples`,
            data: {
                key: CHAT_TRAINING_SETTINGS_KEY,
                total: defaults.length,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error?.message || 'Cannot bootstrap default chatbot training data' });
    }
};
exports.bootstrapDefaultTrainingData = bootstrapDefaultTrainingData;
const benchmarkTrainingData = async (req, res) => {
    try {
        const requestedSample = parsePositiveInt(req.body?.sampleSize ?? req.query?.sampleSize);
        const trainingConfig = await loadTrainingExamples();
        const examples = trainingConfig.examples;
        if (examples.length < 20) {
            return res.status(400).json({
                error: 'Need at least 20 training examples to run benchmark',
            });
        }
        const sample = buildBenchmarkSample(examples, requestedSample);
        let top1Hits = 0;
        let top3Hits = 0;
        let similaritySum = 0;
        const failedCases = [];
        sample.forEach((expected, index) => {
            const variantQuestion = buildBenchmarkQuestionVariant(expected.question, index);
            const candidates = selectRelevantExamples(examples, variantQuestion);
            const top = candidates[0];
            const top3 = candidates.slice(0, 3);
            const expectedQuestion = normalizeText(expected.question);
            const top1Match = Boolean(top && normalizeText(top.question) === expectedQuestion);
            const top3Match = top3.some((item) => normalizeText(item.question) === expectedQuestion);
            const similarity = answerJaccardScore(expected.answer, top?.answer || '');
            if (top1Match)
                top1Hits += 1;
            if (top3Match)
                top3Hits += 1;
            similaritySum += similarity;
            if (!top3Match && failedCases.length < 12) {
                failedCases.push({
                    id: expected.id,
                    question: expected.question,
                    variantQuestion,
                    topQuestion: top?.question || '',
                    topAnswerPreview: (top?.answer || '').slice(0, 180),
                });
            }
        });
        const total = sample.length;
        const top1Rate = Number(((top1Hits / total) * 100).toFixed(2));
        const top3Rate = Number(((top3Hits / total) * 100).toFixed(2));
        const avgAnswerSimilarity = Number(((similaritySum / total) * 100).toFixed(2));
        return res.json({
            success: true,
            data: {
                source: trainingConfig.source,
                totalTrainingExamples: examples.length,
                sampleSize: total,
                metrics: {
                    top1Rate,
                    top3Rate,
                    avgAnswerSimilarity,
                },
                failedCases,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error?.message || 'Cannot benchmark chatbot training data' });
    }
};
exports.benchmarkTrainingData = benchmarkTrainingData;
const createSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const rawTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
        const title = rawTitle || `Cuoc tro chuyen ${new Date().toLocaleDateString()}`;
        const session = await prisma.chatSession.create({
            data: { userId, title },
        });
        res.json({ success: true, data: session });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createSession = createSession;
const getSessions = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSessions = getSessions;
const getSession = async (req, res) => {
    try {
        const sessionId = parsePositiveInt(req.params.id);
        if (!sessionId)
            return res.status(400).json({ error: 'Invalid session id' });
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
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        res.json({ success: true, data: session });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSession = getSession;
const deleteSession = async (req, res) => {
    try {
        const sessionId = parsePositiveInt(req.params.id);
        if (!sessionId)
            return res.status(400).json({ error: 'Invalid session id' });
        const isAdmin = req.user.role === 'ADMIN';
        const session = await prisma.chatSession.findFirst({
            where: isAdmin ? { id: sessionId } : { id: sessionId, userId: req.user.id },
        });
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        await prisma.chatSession.delete({ where: { id: sessionId } });
        res.json({ success: true, message: 'Session deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteSession = deleteSession;
const sendMessage = async (req, res) => {
    try {
        const sessionId = parsePositiveInt(req.params.id);
        if (!sessionId)
            return res.status(400).json({ error: 'Invalid session id' });
        const userId = req.user.id;
        const content = String(req.body?.content || '').trim();
        if (!content)
            return res.status(400).json({ error: 'Message content is required' });
        if (!hasAnyChatProvider()) {
            return res.status(500).json({ error: 'No AI provider configured. Set CHAT_AI_PROVIDER=\"retrieval\" or XAI_API_KEY or GEMINI_API_KEY or OPENAI_API_KEY.' });
        }
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const userMessage = await prisma.chatMessage.create({
            data: { sessionId: session.id, role: 'USER', content },
        });
        const historyMessages = await prisma.chatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'desc' },
            take: MAX_HISTORY_MESSAGES,
        });
        historyMessages.reverse();
        const systemPrompt = isRetrievalOnlyMode ? '' : await getSystemPrompt(userId, content);
        const turns = historyMessages.map((m) => ({
            role: m.role,
            content: m.content,
        }));
        let responseContent = 'Xin loi, toi khong the xu ly yeu cau nay.';
        let degraded = false;
        let degradedReason = null;
        let aiProviderUsed = 'fallback';
        try {
            const generated = await generateAssistantReply(systemPrompt, turns, userId, content);
            responseContent = generated.text || responseContent;
            aiProviderUsed = generated.provider;
        }
        catch (error) {
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
            }
            else if (isTimeoutError(error)) {
                degraded = true;
                degradedReason = 'provider_timeout';
                responseContent = buildServiceFallbackReply(content);
                aiProviderUsed = 'fallback';
                console.warn('[ChatAI] provider timeout, fallback enabled', {
                    status: error?.status,
                    code: error?.code || error?.error?.code,
                    providerMode: CHAT_AI_PROVIDER,
                });
            }
            else {
                degraded = true;
                degradedReason = 'provider_unavailable';
                responseContent = buildServiceFallbackReply(content);
                aiProviderUsed = 'fallback';
                console.warn('[ChatAI] provider unavailable, fallback enabled', {
                    status: error?.status,
                    code: error?.code || error?.error?.code,
                    providerMode: CHAT_AI_PROVIDER,
                    message: error?.message,
                });
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
    }
    catch (error) {
        console.error('[ChatAI] sendMessage failed', {
            message: error?.message,
            status: error?.status,
            code: error?.code || error?.error?.code,
            requestId: error?.requestID,
        });
        res.status(500).json({ error: error?.message || 'ChatAI internal error' });
    }
};
exports.sendMessage = sendMessage;
const quickChat = async (req, res) => {
    try {
        const question = String(req.body?.question || '').trim();
        const userId = req.user.id;
        if (!question)
            return res.status(400).json({ error: 'Question required' });
        if (!hasAnyChatProvider()) {
            return res.status(500).json({ error: 'No AI provider configured. Set CHAT_AI_PROVIDER=\"retrieval\" or XAI_API_KEY or GEMINI_API_KEY or OPENAI_API_KEY.' });
        }
        const systemPrompt = isRetrievalOnlyMode ? '' : await getSystemPrompt(userId, question);
        const turns = [{ role: 'USER', content: question }];
        try {
            const generated = await generateAssistantReply(systemPrompt, turns, userId, question);
            const answer = generated.text || 'Xin loi, toi khong the tra loi cau hoi nay.';
            return res.json({ success: true, data: { answer, degraded: false, aiProvider: generated.provider } });
        }
        catch (error) {
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
            if (isTimeoutError(error)) {
                console.warn('[ChatAI] provider timeout (quickChat), fallback enabled', {
                    status: error?.status,
                    code: error?.code || error?.error?.code,
                    providerMode: CHAT_AI_PROVIDER,
                });
                return res.json({
                    success: true,
                    data: {
                        answer: buildServiceFallbackReply(question),
                        degraded: true,
                        degradedReason: 'provider_timeout',
                        aiProvider: 'fallback',
                    },
                });
            }
            console.warn('[ChatAI] provider unavailable (quickChat), fallback enabled', {
                status: error?.status,
                code: error?.code || error?.error?.code,
                providerMode: CHAT_AI_PROVIDER,
                message: error?.message,
            });
            return res.json({
                success: true,
                data: {
                    answer: buildServiceFallbackReply(question),
                    degraded: true,
                    degradedReason: 'provider_unavailable',
                    aiProvider: 'fallback',
                },
            });
        }
    }
    catch (error) {
        console.error('[ChatAI] quickChat failed', {
            message: error?.message,
            status: error?.status,
            code: error?.code || error?.error?.code,
            requestId: error?.requestID,
        });
        res.status(500).json({ error: error?.message || 'Quick chat internal error' });
    }
};
exports.quickChat = quickChat;
