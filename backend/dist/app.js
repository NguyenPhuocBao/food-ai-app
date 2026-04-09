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
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const analyze_routes_1 = __importDefault(require("./routes/analyze.routes"));
const mealplan_routes_1 = __importDefault(require("./routes/mealplan.routes"));
const recommendation_routes_1 = __importDefault(require("./routes/recommendation.routes"));
const weekly_report_routes_1 = __importDefault(require("./routes/weekly-report.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/api/admin', admin_routes_1.default);
app.use('/api/analyze', analyze_routes_1.default);
app.use('/api/meal-plans', mealplan_routes_1.default);
app.use('/api/recommendations', recommendation_routes_1.default);
app.use('/api/weekly-reports', weekly_report_routes_1.default);
app.use('/api/admin/settings', settings_routes_1.default);
app.use(error_middleware_1.errorHandler);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() });
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
            recommendations: '/api/recommendations',
            weeklyReports: '/api/weekly-reports',
            admin: '/api/admin'
        }
    });
});
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
exports.default = app;
