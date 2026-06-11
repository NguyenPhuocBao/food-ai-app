"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./load-env");
const app_1 = __importDefault(require("./app"));
const meal_reminder_service_1 = require("./services/meal-reminder.service");
const review_retention_service_1 = require("./services/review-retention.service");
const env_1 = require("./config/env");
const runtimeEnv = (0, env_1.getRuntimeEnv)();
const port = runtimeEnv.port;
(0, meal_reminder_service_1.startMealReminderScheduler)();
(0, review_retention_service_1.startReviewReplyRetentionScheduler)();
const shutdownSchedulers = () => {
    (0, meal_reminder_service_1.stopMealReminderScheduler)();
    (0, review_retention_service_1.stopReviewReplyRetentionScheduler)();
    process.exit(0);
};
process.on('unhandledRejection', (reason) => {
    console.error('[process] Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('[process] Uncaught Exception:', error);
});
process.on('SIGINT', shutdownSchedulers);
process.on('SIGTERM', shutdownSchedulers);
app_1.default.listen(port, () => {
    console.log(`[server] Food AI API running on http://localhost:${port}`);
    console.log('[server] Endpoints: auth, foods, meals, statistics, chat, admin');
    console.log('[server] Health: /health, /health/live, /health/ready');
    console.log('[server] Error response logger enabled for all 4xx/5xx responses');
});
