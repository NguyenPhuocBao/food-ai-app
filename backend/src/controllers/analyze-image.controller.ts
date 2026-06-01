import { Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import prisma from '../lib/prisma';
import { deleteLocalUploadIfExists, uploadImageToCloudinary } from '../services/cloudinary-upload.service';
const AI_API_URL = String(process.env.AI_API_URL || '').trim();
const AI_SCAN_MODE = String(process.env.AI_SCAN_MODE || 'auto').trim().toLowerCase();
const LOCAL_AI_API_URL = 'http://localhost:8000';

const resolveAiScanConfig = () => {
  if (AI_SCAN_MODE === 'disabled') {
    return {
      enabled: false,
      url: null,
      reason: 'AI scan is disabled for this deployment. Run the local AI service to demo image recognition.',
    };
  }

  if (AI_API_URL) {
    return { enabled: true, url: AI_API_URL, reason: null };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      enabled: false,
      url: null,
      reason: 'AI_API_URL is not configured in production. Image recognition is available only in local demo mode.',
    };
  }

  return { enabled: true, url: LOCAL_AI_API_URL, reason: null };
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const unique = <T>(items: T[]) => Array.from(new Set(items));
const MAX_SCAN_SUGGESTIONS = 12;

const SCAN_CANDIDATE_HINTS: Array<{ key: string; aliases: string[] }> = [
  { key: 'pho', aliases: ['pho bo', 'pho ga', 'pho xao'] },
  { key: 'bun', aliases: ['bun bo hue', 'bun cha', 'bun rieu', 'bun thit nuong'] },
  { key: 'com', aliases: ['com tam', 'com ga', 'com gao lut', 'com suon'] },
  { key: 'mi', aliases: ['mi quang', 'mi xao bo', 'mi trung ga', 'mi tom rau bo'] },
  { key: 'banh mi', aliases: ['banh mi trung', 'banh mi ga nuong', 'banh mi nguyen cam'] },
  { key: 'chao', aliases: ['chao ga', 'chao tom', 'chao yen mach'] },
  { key: 'salad', aliases: ['salad uc ga', 'salad ca ngu', 'salad tong hop'] },
  { key: 'ga', aliases: ['ga nuong', 'ga luoc', 'ga hap gung'] },
  { key: 'bo', aliases: ['bo xao', 'bo luc lac', 'bo ham rau cu'] },
  { key: 'ca', aliases: ['ca kho to', 'ca hoi ap chao', 'ca hap xi dau'] },
  { key: 'tom', aliases: ['tom hap', 'tom rim', 'tom chien toi'] },
  { key: 'dau hu', aliases: ['dau hu sot ca chua', 'dau hu xao nam', 'dau hu kho nam'] },
  { key: 'nuoc', aliases: ['nuoc ep tao can tay', 'nuoc ep dua leo', 'sua tuoi khong duong'] },
  { key: 'sinh to', aliases: ['sinh to bo', 'sinh to chuoi'] },
];

const toFoodPayload = (food: any) => ({
  id: food.id,
  name: food.name,
  calories: food.calories,
  protein: food.protein,
  fat: food.fat,
  carbs: food.carbs,
  imageUrl: food.imageUrl,
  category: food.category,
});

const parseConfidence = (value: unknown) => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  const percent = parsed > 1 ? parsed : parsed * 100;
  return Math.max(0, Math.min(100, percent));
};

const parsePositiveInt = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const expandCandidateNames = (candidateNames: string[]) => {
  const expanded = [...candidateNames];
  const normalized = candidateNames.map((item) => normalizeText(item)).filter(Boolean);

  for (const candidate of normalized) {
    for (const hint of SCAN_CANDIDATE_HINTS) {
      if (candidate.includes(hint.key)) {
        expanded.push(...hint.aliases);
      }
    }
  }

  return unique(expanded).slice(0, 24);
};

const extractCandidateNames = (prediction: any, originalFileName: string) => {
  const raw = [
    prediction?.top_prediction?.class_name,
    prediction?.data?.food_name,
    prediction?.data?.class_name,
    prediction?.food_name,
    prediction?.class_name,
    ...(Array.isArray(prediction?.predictions)
      ? prediction.predictions.map((item: any) => item?.class_name || item?.food_name)
      : []),
    ...(Array.isArray(prediction?.detections)
      ? prediction.detections.map((item: any) => item?.class_name || item?.food_name)
      : []),
  ]
    .filter((item) => typeof item === 'string')
    .map((item) => String(item).trim())
    .filter(Boolean);

  const fileStem = path.parse(originalFileName).name.replace(/[_-]+/g, ' ');
  if (fileStem) raw.push(fileStem);

  return unique(raw).slice(0, 6);
};

const scoreFood = (food: any, normalizedCandidates: string[]) => {
  const normalizedName = normalizeText(food.name);
  const normalizedSlug = normalizeText(food.slug || '');
  let bestScore = 0;

  normalizedCandidates.forEach((candidate) => {
    if (!candidate) return;

    if (normalizedName === candidate || normalizedSlug === candidate) {
      bestScore = Math.max(bestScore, 120);
      return;
    }

    if (normalizedName.includes(candidate) || normalizedSlug.includes(candidate)) {
      bestScore = Math.max(bestScore, 95);
      return;
    }

    if (candidate.includes(normalizedName) || (normalizedSlug && candidate.includes(normalizedSlug))) {
      bestScore = Math.max(bestScore, 75);
      return;
    }

    const candidateTokens = candidate.split(' ').filter(Boolean);
    const nameTokens = normalizedName.split(' ').filter(Boolean);
    const overlap = candidateTokens.filter((token) => nameTokens.includes(token)).length;
    if (overlap > 0) {
      bestScore = Math.max(bestScore, 50 + overlap * 10);
    }
  });

  return bestScore;
};

const findSuggestedFoods = async (candidateNames: string[]) => {
  const foods = await prisma.foodItem.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      calories: true,
      protein: true,
      fat: true,
      carbs: true,
      imageUrl: true,
      category: true,
      popularity: true,
    },
  });

  const normalizedCandidates = candidateNames.map((item) => normalizeText(item)).filter(Boolean);

  const ranked = foods
    .map((food) => ({
      food,
      score: scoreFood(food, normalizedCandidates),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.food.popularity - left.food.popularity;
    });

  if (normalizedCandidates.length === 0) {
    return ranked.slice(0, MAX_SCAN_SUGGESTIONS).map((item) => item.food);
  }

  const result: any[] = [];
  const usedIds = new Set<number>();
  const usedCategories = new Set<string>();

  const pushFood = (food: any) => {
    if (usedIds.has(food.id)) return;
    usedIds.add(food.id);
    if (food.category) usedCategories.add(String(food.category));
    result.push(food);
  };

  ranked
    .filter((item) => item.score >= 50)
    .slice(0, MAX_SCAN_SUGGESTIONS)
    .forEach((item) => pushFood(item.food));

  if (result.length < MAX_SCAN_SUGGESTIONS) {
    ranked
      .filter((item) => !usedIds.has(item.food.id))
      .forEach((item) => {
        if (result.length >= MAX_SCAN_SUGGESTIONS) return;
        if (!item.food.category || usedCategories.has(String(item.food.category))) return;
        pushFood(item.food);
      });
  }

  if (result.length < MAX_SCAN_SUGGESTIONS) {
    ranked.forEach((item) => {
      if (result.length >= MAX_SCAN_SUGGESTIONS) return;
      pushFood(item.food);
    });
  }

  return result.slice(0, MAX_SCAN_SUGGESTIONS);
};

export const analyzeImage = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const localImageUrl = `/uploads/${path.basename(imagePath)}`;

    let prediction: any = null;
    let aiError: string | null = null;
    const aiConfig = resolveAiScanConfig();

    if (!aiConfig.enabled || !aiConfig.url) {
      aiError = aiConfig.reason;
      prediction = { status: 'fallback', mode: 'local_demo_required', message: aiError };
    } else {
      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        const aiResponse = await axios.post(`${aiConfig.url}/predict`, formData, {
          headers: { ...formData.getHeaders() },
          timeout: 15000,
        });
        prediction = aiResponse.data;
      } catch (error: any) {
        aiError = error?.response?.data?.error || error?.message || 'AI service unavailable';
        prediction = { status: 'fallback', mode: 'service_unavailable', message: aiError };
      }
    }

    const candidateNames = extractCandidateNames(prediction, req.file.originalname || path.basename(imagePath));
    const expandedCandidateNames = expandCandidateNames(candidateNames);
    const suggestedFoods = await findSuggestedFoods(expandedCandidateNames);
    const foodItem = suggestedFoods[0] || null;

    const rawFoodName = candidateNames[0] || foodItem?.name || 'Khong xac dinh';
    const rawConfidence =
      prediction?.top_prediction?.confidence ??
      prediction?.data?.confidence ??
      prediction?.confidence ??
      0;
    const confidence = parseConfidence(rawConfidence);

    const resultPayload = {
      prediction,
      meta: {
        aiError,
        aiScanMode: aiConfig.enabled ? 'remote' : 'local_demo_required',
        aiServiceUrlConfigured: Boolean(aiConfig.url),
        candidateNames: expandedCandidateNames,
        suggestedFoodIds: suggestedFoods.map((food) => food.id),
      },
    };

    const cloudinaryUrl = await uploadImageToCloudinary(imagePath, 'scans').catch(() => null);
    const imageUrl = cloudinaryUrl || localImageUrl;
    if (cloudinaryUrl) {
      await deleteLocalUploadIfExists(imagePath);
    }

    const scanHistory = await prisma.scanHistory.create({
      data: {
        userId: req.user.id,
        imageUrl,
        result: resultPayload,
        confidence,
        isConfirmed: !!(foodItem && confidence >= 70),
      },
    });

    return res.json({
      success: true,
      data: {
        scanId: scanHistory.id,
        imageUrl,
        foodName: rawFoodName,
        confidence,
        foodItem: foodItem ? toFoodPayload(foodItem) : null,
        suggestions: suggestedFoods.map(toFoodPayload),
        prediction: resultPayload,
        fallback: Boolean(aiError),
      },
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getScanHistory = async (req: any, res: Response) => {
  try {
    const hasPagingQuery =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.confirmed !== undefined;

    const page = parsePositiveInt(req.query.page, 1, 1, 10_000);
    const limit = parsePositiveInt(req.query.limit, 20, 1, 100);
    const confirmed = String(req.query.confirmed || '').trim().toLowerCase();

    const where: any = { userId: req.user.id };
    if (confirmed === 'true') where.isConfirmed = true;
    if (confirmed === 'false') where.isConfirmed = false;

    if (!hasPagingQuery) {
      const scans = await prisma.scanHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: scans });
    }

    const skip = (page - 1) * limit;

    const [total, scans] = await prisma.$transaction([
      prisma.scanHistory.count({ where }),
      prisma.scanHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        items: scans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const confirmScanFood = async (req: any, res: Response) => {
  try {
    const scanId = Number(req.params.scanId);
    const foodId = Number(req.body.foodId);

    if (!Number.isFinite(scanId) || !Number.isFinite(foodId)) {
      return res.status(400).json({ error: 'scanId and foodId are required' });
    }

    const scan = await prisma.scanHistory.findUnique({ where: { id: scanId } });
    if (!scan || scan.userId !== req.user.id) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const food = await prisma.foodItem.findUnique({
      where: { id: foodId },
      select: {
        id: true,
        name: true,
        calories: true,
        protein: true,
        fat: true,
        carbs: true,
        imageUrl: true,
        category: true,
      },
    });

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    const previousResult = (scan.result && typeof scan.result === 'object') ? (scan.result as any) : {};
    const updatedResult = {
      ...previousResult,
      confirmed: {
        foodId: food.id,
        foodName: food.name,
        confirmedAt: new Date().toISOString(),
      },
    };

    await prisma.scanHistory.update({
      where: { id: scanId },
      data: {
        isConfirmed: true,
        result: updatedResult,
      },
    });

    return res.json({
      success: true,
      data: {
        scanId,
        foodItem: toFoodPayload(food),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
