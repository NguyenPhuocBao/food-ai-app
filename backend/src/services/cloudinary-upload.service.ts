import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getRuntimeEnv } from '../config/env';

const buildSignature = (payload: string, apiSecret: string) => {
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
};

export const uploadImageToCloudinary = async (localPath: string, subFolder: string) => {
  const env = getRuntimeEnv();
  if (!env.cloudinary.enabled) {
    return null;
  }

  const folder = `${env.cloudinary.folder}/${subFolder}`.replace(/\/+/g, '/');
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `folder=${folder}&timestamp=${timestamp}`;
  const signature = buildSignature(signaturePayload, env.cloudinary.apiSecret);

  const form = new FormData();
  form.append('file', fs.createReadStream(localPath));
  form.append('api_key', env.cloudinary.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`;
  const response = await axios.post(url, form, { headers: form.getHeaders(), timeout: 30000 });
  const secureUrl = String(response.data?.secure_url || '');
  return secureUrl || null;
};

export const deleteLocalUploadIfExists = async (localPath?: string) => {
  if (!localPath) return;
  try {
    const absolute = path.resolve(localPath);
    await fs.promises.unlink(absolute);
  } catch {
    // ignore cleanup failures
  }
};

