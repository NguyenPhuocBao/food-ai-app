import './load-env';
import app from './app';
import { startMealReminderScheduler, stopMealReminderScheduler } from './services/meal-reminder.service';
import {
  startReviewReplyRetentionScheduler,
  stopReviewReplyRetentionScheduler,
} from './services/review-retention.service';

const PORT = process.env.PORT || 5000;

startMealReminderScheduler();
startReviewReplyRetentionScheduler();

process.on('SIGINT', () => {
  stopMealReminderScheduler();
  stopReviewReplyRetentionScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopMealReminderScheduler();
  stopReviewReplyRetentionScheduler();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Food AI System API running on http://localhost:${PORT}`);
  console.log(`📊 Total endpoints: 60+`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`🍽️  Foods: http://localhost:${PORT}/api/foods`);
  console.log(`📝 Meals: http://localhost:${PORT}/api/meals`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/statistics`);
  console.log(`💬 Chatbot: http://localhost:${PORT}/api/chat`);
  console.log(`👑 Admin: http://localhost:${PORT}/api/admin`);
});
