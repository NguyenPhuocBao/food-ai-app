"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./load-env");
const app_1 = __importDefault(require("./app"));
const meal_reminder_service_1 = require("./services/meal-reminder.service");
const review_retention_service_1 = require("./services/review-retention.service");
const PORT = process.env.PORT || 5000;
(0, meal_reminder_service_1.startMealReminderScheduler)();
(0, review_retention_service_1.startReviewReplyRetentionScheduler)();
process.on('SIGINT', () => {
    (0, meal_reminder_service_1.stopMealReminderScheduler)();
    (0, review_retention_service_1.stopReviewReplyRetentionScheduler)();
    process.exit(0);
});
process.on('SIGTERM', () => {
    (0, meal_reminder_service_1.stopMealReminderScheduler)();
    (0, review_retention_service_1.stopReviewReplyRetentionScheduler)();
    process.exit(0);
});
app_1.default.listen(PORT, () => {
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
