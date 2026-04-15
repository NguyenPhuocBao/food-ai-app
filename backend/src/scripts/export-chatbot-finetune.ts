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
  metadata: {
    id: string;
    tags: string[];
    source: 'custom' | 'default' | 'fallback';
  };
};

const SETTINGS_KEY = 'chatbot_training_examples';
const DEFAULT_OUT_DIR = path.resolve(process.cwd(), 'exports', 'fine-tune');
const valRatioArg = process.argv.find((arg) => arg.startsWith('--val-ratio='));
const outDirArg = process.argv.find((arg) => arg.startsWith('--out-dir='));
const requestedValRatio = Number(valRatioArg?.split('=')[1] || '0.05');
const valRatio = Number.isFinite(requestedValRatio) && requestedValRatio > 0 && requestedValRatio < 0.5
  ? requestedValRatio
  : 0.05;
const outDir = outDirArg?.split('=')[1]
  ? path.resolve(process.cwd(), outDirArg.split('=')[1])
  : DEFAULT_OUT_DIR;

const SYSTEM_PROMPT =
  'Ban la AI health coach chuyen ve dinh duong. Tra loi ngan gon, an toan, khong chan doan y khoa.';

const normalize = (raw: unknown): TrainingExample[] => {
  if (!Array.isArray(raw)) return [];

  const dedupe = new Set<string>();
  const normalized: TrainingExample[] = [];

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

    const id = String((item as any)?.id || `ex-${index + 1}`);
    normalized.push({ id, question, answer, tags });
  }

  return normalized;
};

const hash32 = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
};

const toRow = (example: TrainingExample, source: 'custom' | 'default' | 'fallback'): FineTuneRow => ({
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: example.question },
    { role: 'assistant', content: example.answer },
  ],
  metadata: {
    id: example.id,
    tags: example.tags,
    source,
  },
});

const writeJsonl = (filePath: string, rows: FineTuneRow[]) => {
  const lines = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.writeFileSync(filePath, `${lines}\n`, 'utf8');
};

const run = async () => {
  let source: 'custom' | 'default' | 'fallback' = 'default';
  let rawExamples: TrainingExample[] = [];
  let dbError: string | null = null;

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTINGS_KEY },
      select: { value: true },
    });

    if (setting?.value) {
      rawExamples = normalize(JSON.parse(setting.value));
      if (rawExamples.length > 0) source = 'custom';
    }
  } catch (error: any) {
    dbError = error?.message || 'unknown db error';
  }

  if (rawExamples.length === 0) {
    rawExamples = normalize(DEFAULT_CHATBOT_TRAINING_EXAMPLES);
    source = dbError ? 'fallback' : 'default';
  }

  const rows = rawExamples.map((item) => toRow(item, source));
  const trainRows: FineTuneRow[] = [];
  const valRows: FineTuneRow[] = [];

  rows.forEach((row) => {
    const bucket = hash32(row.metadata.id + row.messages[1].content) % 1000;
    if (bucket < Math.floor(valRatio * 1000)) {
      valRows.push(row);
    } else {
      trainRows.push(row);
    }
  });

  const shortQuestions = rawExamples.filter((x) => x.question.length < 12).length;
  const shortAnswers = rawExamples.filter((x) => x.answer.length < 40).length;
  const longAnswers = rawExamples.filter((x) => x.answer.length > 800).length;
  const missingTags = rawExamples.filter((x) => x.tags.length === 0).length;
  const potentialMedicalClaims = rawExamples.filter((x) =>
    /(chan doan|ke don|thuoc|chua khoi|dieu tri)$/i.test(x.answer.trim())
  ).length;

  fs.mkdirSync(outDir, { recursive: true });

  const trainPath = path.join(outDir, 'chatbot-finetune.train.jsonl');
  const valPath = path.join(outDir, 'chatbot-finetune.val.jsonl');
  const reportPath = path.join(outDir, 'chatbot-finetune.report.json');

  writeJsonl(trainPath, trainRows);
  writeJsonl(valPath, valRows);

  const report = {
    generatedAt: new Date().toISOString(),
    source,
    dbError,
    totals: {
      examples: rawExamples.length,
      train: trainRows.length,
      validation: valRows.length,
      validationRatio: Number((valRows.length / Math.max(rawExamples.length, 1)).toFixed(4)),
    },
    quality: {
      shortQuestions,
      shortAnswers,
      longAnswers,
      missingTags,
      potentialMedicalClaims,
    },
    output: {
      trainPath,
      valPath,
      reportPath,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(JSON.stringify(report, null, 2));
};

run()
  .catch((error) => {
    console.error('[export-chatbot-finetune] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
