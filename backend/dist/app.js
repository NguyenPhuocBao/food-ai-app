"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const food_routes_1 = __importDefault(require("./routes/food.routes"));
const meal_routes_1 = __importDefault(require("./routes/meal.routes"));
const statistics_routes_1 = __importDefault(require("./routes/statistics.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const recipe_routes_1 = __importDefault(require("./routes/recipe.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
const support_routes_1 = __importDefault(require("./routes/support.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const analyze_routes_1 = __importDefault(require("./routes/analyze.routes"));
const mealplan_routes_1 = __importDefault(require("./routes/mealplan.routes"));
const recommendation_routes_1 = __importDefault(require("./routes/recommendation.routes"));
const weekly_report_routes_1 = __importDefault(require("./routes/weekly-report.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const audit_middleware_1 = require("./middlewares/audit.middleware");
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
const runtimeEnv = (0, env_1.getRuntimeEnv)();
const isOriginAllowed = (origin) => {
    if (!origin)
        return true;
    if (runtimeEnv.corsOrigins.includes('*'))
        return true;
    return runtimeEnv.corsOrigins.includes(origin);
};
const getHealthPayload = (status, db) => ({
    status,
    checks: { db },
    timestamp: new Date(),
    uptime: process.uptime(),
});
const isDatabaseAvailable = async () => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        return true;
    }
    catch {
        return false;
    }
};
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS origin not allowed'));
    },
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(audit_middleware_1.auditMutationMiddleware);
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    setHeaders: (res) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/foods', food_routes_1.default);
app.use('/api/meals', meal_routes_1.default);
app.use('/api/statistics', statistics_routes_1.default);
app.use('/api/favorites', favorite_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/recipes', recipe_routes_1.default);
app.use('/api/chat', chatbot_routes_1.default);
app.use('/api/support', support_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/analyze', analyze_routes_1.default);
app.use('/api/meal-plans', mealplan_routes_1.default);
app.use('/api/recommendations', recommendation_routes_1.default);
app.use('/api/weekly-reports', weekly_report_routes_1.default);
app.use('/api/admin/settings', settings_routes_1.default);
app.use('/api/health', health_routes_1.default);
// Liveness check (process is alive, DB not required).
app.get('/health/live', (_req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});
// Readiness check (process + DB).
app.get('/health/ready', async (_req, res) => {
    const isReady = await isDatabaseAvailable();
    if (!isReady) {
        return res.status(503).json(getHealthPayload('DEGRADED', 'DOWN'));
    }
    return res.json(getHealthPayload('OK', 'UP'));
});
// Backward-compatible health check.
app.get('/health', async (_req, res) => {
    const hasDatabase = await isDatabaseAvailable();
    if (!hasDatabase) {
        return res.status(503).json(getHealthPayload('DEGRADED', 'DOWN'));
    }
    return res.json(getHealthPayload('OK', 'UP'));
});
// Root
app.get('/', (req, res) => {
    res.json({
        message: 'Food AI System API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            foods: '/api/foods',
            meals: '/api/meals',
            statistics: '/api/statistics',
            favorites: '/api/favorites',
            reviews: '/api/reviews',
            notifications: '/api/notifications',
            recipes: '/api/recipes',
            chat: '/api/chat',
            analyze: '/api/analyze',
            health: '/api/health',
            recommendations: '/api/recommendations',
            weeklyReports: '/api/weekly-reports',
            admin: '/api/admin'
        }
    });
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
