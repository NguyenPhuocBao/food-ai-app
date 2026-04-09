type AdminDateValue = string | number | Date;

const DEFAULT_LOCALE = 'vi-VN';
const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const toDate = (value: AdminDateValue) => (value instanceof Date ? value : new Date(value));

export const formatAdminDate = (value: AdminDateValue, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: DEFAULT_TIME_ZONE,
  }).format(toDate(value));

export const formatAdminTime = (value: AdminDateValue, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: DEFAULT_TIME_ZONE,
  }).format(toDate(value));

export const formatAdminDateTime = (value: AdminDateValue, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: DEFAULT_TIME_ZONE,
  }).format(toDate(value));
