const APP_TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Ho_Chi_Minh';
const APP_UTC_OFFSET_HOURS = Number(process.env.APP_UTC_OFFSET_HOURS || 7);

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const getAppTimeZone = () => APP_TIME_ZONE;
export const getAppUtcOffsetHours = () => APP_UTC_OFFSET_HOURS;

export const toAppDateKey = (value: Date | string | number) => {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
};

export const toAppDayStart = (value: Date | string | number) => {
  const [year, month, day] = toAppDateKey(value).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, -APP_UTC_OFFSET_HOURS, 0, 0, 0));
};

export const toAppDayRange = (value: Date | string | number) => {
  const start = toAppDayStart(value);
  const endExclusive = new Date(start.getTime() + ONE_DAY_MS);
  return { start, endExclusive };
};

export const shiftAppDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * ONE_DAY_MS);

