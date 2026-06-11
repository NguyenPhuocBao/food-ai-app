import './load-env';
import app from './app';
import { startMealReminderScheduler, stopMealReminderScheduler } from './services/meal-reminder.service';
import {
  startReviewReplyRetentionScheduler,
  stopReviewReplyRetentionScheduler,
} from './services/review-retention.service';
import { getRuntimeEnv } from './config/env';

const runtimeEnv = getRuntimeEnv();
const port = runtimeEnv.port;

startMealReminderScheduler();
startReviewReplyRetentionScheduler();

const shutdownSchedulers = () => {
  stopMealReminderScheduler();
  stopReviewReplyRetentionScheduler();
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

app.listen(port, () => {
  console.log(`[server] Food AI API running on http://localhost:${port}`);
  console.log('[server] Endpoints: auth, foods, meals, statistics, chat, admin');
  console.log('[server] Health: /health, /health/live, /health/ready');
  console.log('[server] Error response logger enabled for all 4xx/5xx responses');
});
