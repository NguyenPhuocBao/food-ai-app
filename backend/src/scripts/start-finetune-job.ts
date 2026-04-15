import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import '../load-env';

type Provider = 'openai' | 'xai';

const arg = (name: string) => process.argv.find((item) => item.startsWith(`--${name}=`))?.split('=')[1];
const provider = (arg('provider') || 'openai').toLowerCase() as Provider;
const trainPathArg = arg('train') || 'exports/fine-tune-all/chatbot-all.train.jsonl';
const valPathArg = arg('val') || 'exports/fine-tune-all/chatbot-all.val.jsonl';
const modelArg = arg('model');
const suffixArg = arg('suffix') || `food-ai-${provider}-${Date.now()}`;

const resolvedTrainPath = path.resolve(process.cwd(), trainPathArg);
const resolvedValPath = path.resolve(process.cwd(), valPathArg);

const openaiApiKey = process.env.OPENAI_API_KEY || '';
const xaiApiKey = process.env.XAI_API_KEY || '';
const xaiBaseUrl = (process.env.XAI_BASE_URL || 'https://api.x.ai/v1').replace(/\/+$/, '');

const defaultModelByProvider: Record<Provider, string> = {
  openai: process.env.OPENAI_FT_BASE_MODEL || 'gpt-4o-mini-2024-07-18',
  xai: process.env.XAI_FT_BASE_MODEL || process.env.XAI_MODEL || 'grok-4.20-beta-latest-non-reasoning',
};

const run = async () => {
  if (!fs.existsSync(resolvedTrainPath)) {
    throw new Error(`Train file not found: ${resolvedTrainPath}`);
  }
  if (!fs.existsSync(resolvedValPath)) {
    throw new Error(`Validation file not found: ${resolvedValPath}`);
  }

  const model = modelArg || defaultModelByProvider[provider];
  if (!model) throw new Error('Missing model. Pass --model=<model_name>.');

  let client: OpenAI;
  if (provider === 'openai') {
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY is missing.');
    client = new OpenAI({ apiKey: openaiApiKey });
  } else {
    if (!xaiApiKey) throw new Error('XAI_API_KEY is missing.');
    client = new OpenAI({ apiKey: xaiApiKey, baseURL: xaiBaseUrl });
  }

  const trainingFile = await client.files.create({
    file: fs.createReadStream(resolvedTrainPath),
    purpose: 'fine-tune',
  });

  const validationFile = await client.files.create({
    file: fs.createReadStream(resolvedValPath),
    purpose: 'fine-tune',
  });

  const job = await client.fineTuning.jobs.create({
    model,
    training_file: trainingFile.id,
    validation_file: validationFile.id,
    suffix: suffixArg,
  });

  console.log(
    JSON.stringify(
      {
        provider,
        model,
        trainingFileId: trainingFile.id,
        validationFileId: validationFile.id,
        fineTuneJobId: job.id,
        status: job.status,
      },
      null,
      2,
    ),
  );
};

run().catch((error: any) => {
  console.error(
    JSON.stringify(
      {
        provider,
        message: error?.message || 'unknown error',
        status: error?.status || null,
        code: error?.code || null,
        type: error?.type || null,
        raw: error?.error || null,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
