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
import adminRoutes from './routes/admin.routes';
import path from 'path';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/admin', adminRoutes);

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
      admin: '/api/admin'
    }
  });
});

export default app;