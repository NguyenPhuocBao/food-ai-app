const FALLBACK_DEV_SECRET = 'food-ai-secret-key-2024';

let warnedInsecureSecret = false;

export const resolveJwtSecret = () => {
  const configured = String(process.env.JWT_SECRET || '').trim();
  const nodeEnv = String(process.env.NODE_ENV || 'development').trim().toLowerCase();
  const hasConfiguredSecret = configured.length > 0;
  const secret = hasConfiguredSecret ? configured : FALLBACK_DEV_SECRET;
  const insecure = !hasConfiguredSecret || secret === FALLBACK_DEV_SECRET;

  if (nodeEnv === 'production' && insecure) {
    throw new Error('Server auth misconfigured: set a strong JWT_SECRET in production.');
  }

  if (insecure && !warnedInsecureSecret) {
    warnedInsecureSecret = true;
    console.warn(
      '[auth] JWT_SECRET is missing or using a development fallback. Set JWT_SECRET before deployment.',
    );
  }

  return secret;
};

