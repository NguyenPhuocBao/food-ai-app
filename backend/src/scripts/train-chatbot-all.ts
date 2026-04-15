import fs from 'fs';
import path from 'path';
import '../load-env';
import prisma from '../lib/prisma';
import { DEFAULT_CHATBOT_TRAINING_EXAMPLES } from '../data/chatbot-training-defaults';

type TrainingExample = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
};

type FineTuneRow = {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
};

const SETTINGS_KEY = 'chatbot_training_examples';
const DEFAULT_TARGET = 30000;
const DEFAULT_VAL_RATIO = 0.08;
const DEFAULT_TEST_RATIO = 0.04;
const DEFAULT_OUT_DIR = path.resolve(process.cwd(), 'exports', 'fine-tune-all');
const SYSTEM_PROMPT =
  'Ban la AI health coach chuyen ve dinh duong va suc khoe. Tra loi ngan gon, an toan, khong chan doan y khoa.';

const arg = (name: string) => process.argv.find((item) => item.startsWith(`--${name}=`))?.split('=')[1];
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

const requestedTarget = Number(arg('target') || DEFAULT_TARGET);
const targetCount = Number.isFinite(requestedTarget) && requestedTarget >= 1000 ? Math.floor(requestedTarget) : DEFAULT_TARGET;
const requestedValRatio = Number(arg('val-ratio') || DEFAULT_VAL_RATIO);
const valRatio =
  Number.isFinite(requestedValRatio) && requestedValRatio > 0 && requestedValRatio < 0.3
    ? requestedValRatio
    : DEFAULT_VAL_RATIO;
const requestedTestRatio = Number(arg('test-ratio') || DEFAULT_TEST_RATIO);
const testRatio =
  Number.isFinite(requestedTestRatio) && requestedTestRatio > 0 && requestedTestRatio < 0.2
    ? requestedTestRatio
    : DEFAULT_TEST_RATIO;
const outDir = arg('out-dir') ? path.resolve(process.cwd(), String(arg('out-dir'))) : DEFAULT_OUT_DIR;
const shouldSyncDb = hasFlag('sync-db');
const syncDbLimit = Number(arg('sync-limit') || 5000);

const normalize = (raw: unknown): TrainingExample[] => {
  if (!Array.isArray(raw)) return [];

  const dedupe = new Set<string>();
  const out: TrainingExample[] = [];

  for (const [index, item] of raw.entries()) {
    const question = String((item as any)?.question || '').trim();
    const answer = String((item as any)?.answer || '').trim();
    if (!question || !answer) continue;

    const tags = Array.isArray((item as any)?.tags)
      ? (item as any).tags.map((tag: unknown) => String(tag || '').trim()).filter(Boolean).slice(0, 8)
      : [];

    const key = `${question.toLowerCase()}||${answer.toLowerCase()}`;
    if (dedupe.has(key)) continue;
    dedupe.add(key);

    out.push({
      id: String((item as any)?.id || `ex-${index + 1}`),
      question,
      answer,
      tags,
    });
  }

  return out;
};

const hash32 = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
};

const pick = <T>(arr: readonly T[], seed: number): T => arr[Math.abs(seed) % arr.length];

const questionStarters = [
  'Ban co the tu van giup toi',
  'Cho toi goi y ve',
  'Toi can huong dan cu the cho',
  'Neu toi dang quan tam',
  'Xin goi y ngan gon ve',
  'Toi muon toi uu',
  'Truong hop cua toi la',
  'Cho toi cach xu ly',
] as const;

const questionClosers = [
  'de an toan va ben vung?',
  'de phu hop muc tieu suc khoe?',
  'de de ap dung hang ngay?',
  'trong 1-2 tuan toi?',
  'neu toi muon duy tri lau dai?',
  'ma khong qua kho de theo?',
] as const;

const personas = [
  'Toi la sinh vien',
  'Toi la nhan vien van phong',
  'Toi lam viec ca toi',
  'Toi vua sinh con',
  'Toi tren 40 tuoi',
  'Toi tren 50 tuoi',
  'Toi it van dong',
  'Toi thuong tap gym 4 buoi/tuan',
  'Toi hay di cong tac',
  'Toi co lich lam viec that thuong',
  'Toi hay an ngoai',
  'Toi co kha nang nau an co ban',
  'Toi khong co nhieu thoi gian',
  'Toi dang giam can',
  'Toi dang tang co',
  'Toi muon an lanh manh ben vung',
] as const;

const contexts = [
  'ngan sach an uong khong cao',
  'toi de bi doi vao buoi toi',
  'toi hay them do ngot',
  'toi can de xuat don gian',
  'toi can cach de theo trong 7 ngay',
  'toi can cach de theo trong 30 ngay',
  'toi can de xuat de mang di lam',
  'toi can thuc don de nau nhanh',
  'toi hay bo bua sang',
  'toi can kiem soat duong huyet',
  'toi can kiem soat huyet ap',
  'toi bi roi loan mo mau',
  'toi can toi uu hie u qua tap luyen',
  'toi can giu nang luong ca ngay',
  'toi can thoi quen de duy tri lau dai',
  'toi muon tranh tang can tro lai',
] as const;

const timeframes = [
  'trong 3 ngay toi',
  'trong 7 ngay toi',
  'trong 14 ngay toi',
  'trong 1 thang toi',
  'cho lich hang ngay',
  'cho bua tiep theo',
  'cho tuan toi',
  'cho cuoi tuan nay',
] as const;

const constraints = [
  'khong dung do chien ngap dau',
  'han che do ngot',
  'han che mon qua man',
  'uu tien nguyen lieu de mua',
  'uu tien mon nau duoi 20 phut',
  'uu tien mon co san o sieu thi',
  'uu tien bua an de mang di',
  'han che thuc pham che bien san',
  'khong dung nuoc ngot',
  'uu tien do an it calo',
] as const;

const answerIntros = [
  'Ban co the bat dau nhu sau:',
  'Ke hoach thuc te cho ban:',
  'Mot cach de ap dung ngay:',
  'Huong uu tien an toan:',
  'Goi y tam thoi de ban theo:',
] as const;

const answerOutros = [
  'Theo doi 7-14 ngay de dieu chinh khau phan.',
  'Neu co benh nen, uu tien trao doi bac si de ca nhan hoa.',
  'Ghi nhat ky bua an de danh gia tien trinh ro hon.',
  'Tap trung vao su deu dan, khong can hoan hao ngay tu dau.',
  'Ket hop van dong va ngu du de hieu qua on dinh hon.',
] as const;

const answerStructs = [
  'Mau ap dung: 1) Khung bua an 2) Khau phan 3) Theo doi.',
  'Mau ap dung: uu tien dam nac + rau + tinh bot vua du.',
  'Mau ap dung: duy tri deu dan moi ngay, khong can qua chat ngay dau.',
  'Mau ap dung: theo doi 3 chi so can nang, nang luong, cam giac no.',
  'Mau ap dung: chia nho muc tieu theo tung tuan de de theo.',
] as const;

const wordVariants: Array<{ find: RegExp; replace: string[] }> = [
  { find: /\bgiam can\b/gi, replace: ['kiem soat can nang', 'giam mo', 'siet can'] },
  { find: /\btang co\b/gi, replace: ['phat trien co bap', 'xay dung co'] },
  { find: /\bbua toi\b/gi, replace: ['buoi toi', 'an toi'] },
  { find: /\btieu duong\b/gi, replace: ['duong huyet cao', 'tieu duong type 2'] },
  { find: /\bcao huyet ap\b/gi, replace: ['huyet ap cao', 'tang huyet ap'] },
  { find: /\bprotein\b/gi, replace: ['dam', 'chat dam'] },
  { find: /\bcarb\b/gi, replace: ['tinh bot', 'chat bot duong'] },
];

const mutateText = (input: string, seed: number) => {
  let out = input;
  wordVariants.forEach((variant, index) => {
    if ((seed + index) % 3 === 0) {
      out = out.replace(variant.find, pick(variant.replace, seed + index));
    }
  });
  return out.replace(/\s+/g, ' ').trim();
};

const buildQuestionVariant = (question: string, seed: number) => {
  const mode = Math.abs(seed) % 10;
  const base = mutateText(question, seed);

  if (mode === 0) return base.endsWith('?') ? base : `${base}?`;
  if (mode === 1) return `${pick(questionStarters, seed)} ${base.toLowerCase()} ${pick(questionClosers, seed + 7)}`;
  if (mode === 2) return `${base} Neu toi muon ap dung ngay hom nay thi bat dau tu dau?`;
  if (mode === 3) return `Ban phan tich giup: ${base.toLowerCase()} De toi de theo doi trong app?`;
  if (mode === 4) return `${base} Ban co the de xuat phien ban don gian hon khong?`;
  if (mode === 5) {
    return `${pick(personas, seed)} va ${pick(contexts, seed + 1)}. ${base} Can ap dung ${pick(timeframes, seed + 2)} duoc khong?`;
  }
  if (mode === 6) {
    return `Truong hop cua toi: ${pick(personas, seed + 3)}, ${pick(constraints, seed + 4)}. ${base}`;
  }
  if (mode === 7) {
    return `Cho toi phuong an theo kieu thuc te: ${base} Trong dieu kien ${pick(contexts, seed + 5)} va ${pick(constraints, seed + 6)}.`;
  }
  if (mode === 8) {
    return `Neu ${pick(personas, seed + 7).toLowerCase()} thi ${base.toLowerCase()} can dieu chinh gi ${pick(timeframes, seed + 8)}?`;
  }
  return `${base} Ban giup toi rut gon thanh checklist 3 buoc de theo duoc khong?`;
};

const buildAnswerVariant = (answer: string, seed: number) => {
  const mode = Math.abs(seed) % 7;
  const core = mutateText(answer, seed + 17);
  if (mode === 0) return core;
  if (mode === 1) return `${pick(answerIntros, seed)} ${core}`;
  if (mode === 2) return `${core} ${pick(answerOutros, seed + 3)}`;
  if (mode === 3) return `${pick(answerIntros, seed + 5)} ${core} ${pick(answerOutros, seed + 11)}`;
  if (mode === 4) return `${pick(answerIntros, seed + 9)} ${core} ${pick(answerStructs, seed + 12)}`;
  if (mode === 5) return `${core} Dieu kien ap dung: ${pick(constraints, seed + 13)}. ${pick(answerOutros, seed + 14)}`;
  return `${pick(answerStructs, seed + 21)} ${core} ${pick(answerOutros, seed + 22)}`;
};

const augment = (baseExamples: TrainingExample[], target: number) => {
  const out: TrainingExample[] = [];
  const dedupe = new Set<string>();

  const pushUnique = (item: TrainingExample) => {
    const key = `${item.question.toLowerCase()}||${item.answer.toLowerCase()}`;
    if (dedupe.has(key)) return false;
    dedupe.add(key);
    out.push(item);
    return true;
  };

  baseExamples.forEach((item, index) => {
    pushUnique({ ...item, id: item.id || `base-${index + 1}` });
  });

  const baseLen = Math.max(baseExamples.length, 1);
  const variantsNeeded = Math.ceil(Math.max(target - out.length, 0) / baseLen);
  const maxVariantRounds = Math.max(variantsNeeded * 4, 50);

  for (let variantIndex = 0; variantIndex < maxVariantRounds && out.length < target; variantIndex += 1) {
    for (let baseIndex = 0; baseIndex < baseExamples.length && out.length < target; baseIndex += 1) {
      const ex = baseExamples[baseIndex];
      const seed = variantIndex * 104729 + baseIndex * 13007 + 17;

      const question = buildQuestionVariant(ex.question, seed);
      const answer = buildAnswerVariant(ex.answer, seed + 99991);

      pushUnique({
        id: `${ex.id}-aug-v${variantIndex + 1}-b${baseIndex + 1}`,
        question,
        answer,
        tags: Array.from(new Set([...ex.tags, 'augmented'])).slice(0, 8),
      });
    }
  }

  return out.slice(0, target);
};

const toRow = (example: TrainingExample): FineTuneRow => ({
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: example.question },
    { role: 'assistant', content: example.answer },
  ],
});

const writeJsonl = (filePath: string, rows: FineTuneRow[]) => {
  const lines = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.writeFileSync(filePath, `${lines}\n`, 'utf8');
};

const run = async () => {
  let source: 'custom' | 'default' | 'fallback' = 'default';
  let baseExamples: TrainingExample[] = [];
  let dbError: string | null = null;

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTINGS_KEY },
      select: { value: true },
    });
    if (setting?.value) {
      baseExamples = normalize(JSON.parse(setting.value));
      if (baseExamples.length > 0) source = 'custom';
    }
  } catch (error: any) {
    dbError = error?.message || 'unknown db error';
  }

  if (baseExamples.length === 0) {
    baseExamples = normalize(DEFAULT_CHATBOT_TRAINING_EXAMPLES);
    source = dbError ? 'fallback' : 'default';
  }

  const expandedExamples = augment(baseExamples, targetCount);
  const trainRows: FineTuneRow[] = [];
  const valRows: FineTuneRow[] = [];
  const testRows: FineTuneRow[] = [];

  expandedExamples.forEach((example) => {
    const row = toRow(example);
    const bucket = hash32(`${example.id}|${example.question}`) % 10000;
    if (bucket < Math.floor(testRatio * 10000)) {
      testRows.push(row);
      return;
    }
    if (bucket < Math.floor((testRatio + valRatio) * 10000)) {
      valRows.push(row);
      return;
    }
    trainRows.push(row);
  });

  const shortQuestions = expandedExamples.filter((x) => x.question.length < 15).length;
  const shortAnswers = expandedExamples.filter((x) => x.answer.length < 40).length;
  const longAnswers = expandedExamples.filter((x) => x.answer.length > 900).length;
  const missingTags = expandedExamples.filter((x) => x.tags.length === 0).length;

  fs.mkdirSync(outDir, { recursive: true });
  const trainPath = path.join(outDir, 'chatbot-all.train.jsonl');
  const valPath = path.join(outDir, 'chatbot-all.val.jsonl');
  const testPath = path.join(outDir, 'chatbot-all.test.jsonl');
  const reportPath = path.join(outDir, 'chatbot-all.report.json');
  const rawPath = path.join(outDir, 'chatbot-all.raw.json');

  writeJsonl(trainPath, trainRows);
  writeJsonl(valPath, valRows);
  writeJsonl(testPath, testRows);
  fs.writeFileSync(rawPath, JSON.stringify(expandedExamples, null, 2), 'utf8');

  if (shouldSyncDb) {
    const maxLimit = Number.isFinite(syncDbLimit) && syncDbLimit > 0 ? Math.floor(syncDbLimit) : 5000;
    const syncPayload = expandedExamples.slice(0, maxLimit).map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      tags: item.tags,
    }));

    await prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: {
        value: JSON.stringify(syncPayload),
        group: 'ai',
      },
      create: {
        key: SETTINGS_KEY,
        value: JSON.stringify(syncPayload),
        group: 'ai',
      },
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source,
    dbError,
    config: {
      targetCount,
      valRatio,
      testRatio,
      syncDb: shouldSyncDb,
      syncDbLimit: shouldSyncDb ? syncDbLimit : 0,
    },
    totals: {
      baseExamples: baseExamples.length,
      expandedExamples: expandedExamples.length,
      train: trainRows.length,
      validation: valRows.length,
      test: testRows.length,
    },
    quality: {
      shortQuestions,
      shortAnswers,
      longAnswers,
      missingTags,
    },
    output: {
      trainPath,
      valPath,
      testPath,
      rawPath,
      reportPath,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
};

run()
  .catch((error) => {
    console.error('[chatbot:train:all] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
