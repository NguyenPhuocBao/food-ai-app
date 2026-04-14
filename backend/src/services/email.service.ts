type MailTransporter = {
  sendMail: (options: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

let transporter: MailTransporter | null = null;
let transporterInitialized = false;
let nodemailerWarningShown = false;
let smtpWarningShown = false;

const getEnv = (key: string) => (process.env[key] || '').trim();

const getTransporter = (): MailTransporter | null => {
  if (transporterInitialized) return transporter;
  transporterInitialized = true;

  const host = getEnv('SMTP_HOST');
  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASS');
  const port = Number(getEnv('SMTP_PORT') || 587);
  const secure = getEnv('SMTP_SECURE') === 'true';

  if (!host || !user || !pass || !Number.isFinite(port)) {
    if (!smtpWarningShown) {
      smtpWarningShown = true;
      console.warn('[meal-reminder] SMTP is not configured. Email reminder is disabled.');
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = (() => {
    try {
      return require('nodemailer');
    } catch {
      if (!nodemailerWarningShown) {
        nodemailerWarningShown = true;
        console.warn('[meal-reminder] nodemailer is not installed. Run `npm i nodemailer` in backend to enable email.');
      }
      return null;
    }
  })();

  if (!nodemailer?.createTransport) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return transporter;
};

export const sendNoMealReminderEmail = async (params: {
  toEmail: string;
  userName: string;
  dateKey: string;
}) => {
  const from = getEnv('SMTP_FROM');
  const mailer = getTransporter();
  if (!mailer || !from) return false;

  const subject = `[FoodAI] Nhac ghi bua an ngay ${params.dateKey}`;
  const text = [
    `Xin chao ${params.userName || 'ban'},`,
    '',
    `Hom nay (${params.dateKey}) he thong chua ghi nhan bua an nao trong nhat ky cua ban.`,
    'Hay them bua an de theo doi dinh duong chinh xac hon.',
    '',
    'FoodAI',
  ].join('\n');

  const html = [
    `<p>Xin chao <strong>${params.userName || 'ban'}</strong>,</p>`,
    `<p>Hom nay (<strong>${params.dateKey}</strong>) he thong chua ghi nhan bua an nao trong nhat ky cua ban.</p>`,
    '<p>Hay them bua an de theo doi dinh duong chinh xac hon.</p>',
    '<p>FoodAI</p>',
  ].join('');

  try {
    await mailer.sendMail({
      from,
      to: params.toEmail,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('[meal-reminder] Failed to send email reminder:', error);
    return false;
  }
};

