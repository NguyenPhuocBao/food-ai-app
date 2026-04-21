import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import foodRoutes from './routes/food.routes';
import mealRoutes from './routes/meal.routes';
import statisticsRoutes from './routes/statistics.routes';
import favoriteRoutes from './routes/favorite.routes';
import reviewRoutes from './routes/review.routes';
import notificationRoutes from './routes/notification.routes';
import recipeRoutes from './routes/recipe.routes';
import chatbotRoutes from './routes/chatbot.routes';
import supportRoutes from './routes/support.routes';
import adminRoutes from './routes/admin.routes';
import analyzeRoutes from './routes/analyze.routes';
import mealPlanRoutes from './routes/mealplan.routes';
import recommendationRoutes from './routes/recommendation.routes';
import weeklyReportRoutes from './routes/weekly-report.routes';
import { errorHandler } from './middlewares/error.middleware';
import settingsRoutes from './routes/settings.routes';
import healthRoutes from './routes/health.routes';
import { auditMutationMiddleware } from './middlewares/audit.middleware';
import path from 'path';
import prisma from './lib/prisma';

const app = express();

const parseAllowedOrigins = () => {
  const raw = String(process.env.CORS_ORIGIN || 'http://localhost:5173');
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const isOriginAllowed = (origin?: string) => {
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
};

// Middleware
app.use(helmet());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(auditMutationMiddleware);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/weekly-reports', weeklyReportRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/health', healthRoutes);

app.use(errorHandler);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      checks: { db: 'UP' },
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  } catch {
    res.status(503).json({
      status: 'DEGRADED',
      checks: { db: 'DOWN' },
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  }
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

export default app;
