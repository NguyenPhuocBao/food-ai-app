"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftAppDays = exports.toAppDayRange = exports.toAppDayStart = exports.toAppDateKey = exports.getAppUtcOffsetHours = exports.getAppTimeZone = exports.ONE_DAY_MS = void 0;
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Ho_Chi_Minh';
const APP_UTC_OFFSET_HOURS = Number(process.env.APP_UTC_OFFSET_HOURS || 7);
exports.ONE_DAY_MS = 24 * 60 * 60 * 1000;
const getAppTimeZone = () => APP_TIME_ZONE;
exports.getAppTimeZone = getAppTimeZone;
const getAppUtcOffsetHours = () => APP_UTC_OFFSET_HOURS;
exports.getAppUtcOffsetHours = getAppUtcOffsetHours;
const toAppDateKey = (value) => {
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
exports.toAppDateKey = toAppDateKey;
const toAppDayStart = (value) => {
    const [year, month, day] = (0, exports.toAppDateKey)(value).split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, -APP_UTC_OFFSET_HOURS, 0, 0, 0));
};
exports.toAppDayStart = toAppDayStart;
const toAppDayRange = (value) => {
    const start = (0, exports.toAppDayStart)(value);
    const endExclusive = new Date(start.getTime() + exports.ONE_DAY_MS);
    return { start, endExclusive };
};
exports.toAppDayRange = toAppDayRange;
const shiftAppDays = (date, days) => new Date(date.getTime() + days * exports.ONE_DAY_MS);
exports.shiftAppDays = shiftAppDays;
