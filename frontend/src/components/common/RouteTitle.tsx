import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const USER_ROUTES: Array<{ prefix: string; title: string }> = [
  { prefix: '/scan', title: 'Scan' },
  { prefix: '/diary', title: 'Diary' },
  { prefix: '/chat-ai', title: 'Chat AI' },
  { prefix: '/profile', title: 'Profile' },
  { prefix: '/statistics', title: 'Statistics' },
  { prefix: '/foods', title: 'Foods' },
  { prefix: '/recipes', title: 'Recipes' },
  { prefix: '/meal-plans', title: 'Meal Plans' },
  { prefix: '/library', title: 'Library' },
  { prefix: '/recommendations', title: 'Recommendations' },
  { prefix: '/weekly-reports', title: 'Weekly Reports' },
  { prefix: '/onboarding', title: 'Onboarding' },
];

const ADMIN_ROUTES: Array<{ prefix: string; title: string }> = [
  { prefix: '/admin/users', title: 'Users' },
  { prefix: '/admin/foods', title: 'Foods' },
  { prefix: '/admin/recipes', title: 'Recipes' },
  { prefix: '/admin/reviews', title: 'Reviews' },
  { prefix: '/admin/chat-ai', title: 'Chat AI' },
  { prefix: '/admin/chatbot-ops', title: 'Chatbot Ops' },
  { prefix: '/admin/configs', title: 'Configs' },
  { prefix: '/admin/logs', title: 'Audit Logs' },
  { prefix: '/admin/notifications', title: 'Notifications' },
  { prefix: '/admin/settings', title: 'Settings DB' },
  { prefix: '/admin/meals', title: 'Meal Detail' },
];

const buildTitle = (pathname: string) => {
  if (pathname === '/login') return 'Login | FoodAI';
  if (pathname === '/register') return 'Register | FoodAI';
  if (pathname === '/forgot-password') return 'Forgot Password | FoodAI';
  if (pathname === '/reset-password') return 'Reset Password | FoodAI';

  if (pathname === '/' || pathname === '') return 'Home - User | FoodAI';

  if (pathname.startsWith('/admin')) {
    const matched = ADMIN_ROUTES.find((item) => pathname.startsWith(item.prefix));
    return `${matched?.title || 'Dashboard'} - Admin | FoodAI`;
  }

  const matched = USER_ROUTES.find((item) => pathname.startsWith(item.prefix));
  return `${matched?.title || 'Home'} - User | FoodAI`;
};

const RouteTitle = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = buildTitle(location.pathname);
  }, [location.pathname]);

  return null;
};

export default RouteTitle;
