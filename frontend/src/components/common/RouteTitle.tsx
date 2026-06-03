import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

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
  { prefix: '/pt/workspaces', title: 'PT Workspace' },
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

const VI_TITLE_MAP: Record<string, string> = {
  Scan: 'Quét món',
  Diary: 'Nhật ký',
  'Chat AI': 'Chat AI',
  Profile: 'Hồ sơ',
  Statistics: 'Thống kê',
  Foods: 'Món ăn',
  Recipes: 'Công thức',
  'Meal Plans': 'Kế hoạch bữa ăn',
  Library: 'Thư viện',
  Recommendations: 'Gợi ý',
  'Weekly Reports': 'Báo cáo tuần',
  'PT Workspace': 'Không gian PT',
  Onboarding: 'Khởi tạo',
  Users: 'Người dùng',
  Reviews: 'Đánh giá',
  Configs: 'Cấu hình',
  'Audit Logs': 'Nhật ký hệ thống',
  Notifications: 'Thông báo',
  'Settings DB': 'Thiết lập DB',
  'Meal Detail': 'Chi tiết bữa ăn',
  Dashboard: 'Tổng quan',
  Home: 'Trang chủ',
};

const localizeTitle = (title: string, isEn: boolean) => {
  if (isEn) return title;
  return VI_TITLE_MAP[title] || title;
};

const buildTitle = (pathname: string, isEn: boolean) => {
  if (pathname === '/login') return `${isEn ? 'Login' : 'Đăng nhập'} | FoodAI`;
  if (pathname === '/register') return `${isEn ? 'Register' : 'Đăng ký'} | FoodAI`;
  if (pathname === '/forgot-password') return `${isEn ? 'Forgot Password' : 'Quên mật khẩu'} | FoodAI`;
  if (pathname === '/reset-password') return `${isEn ? 'Reset Password' : 'Đặt lại mật khẩu'} | FoodAI`;

  if (pathname === '/' || pathname === '') return `${isEn ? 'Home' : 'Trang chủ'} - ${isEn ? 'User' : 'Người dùng'} | FoodAI`;

  if (pathname.startsWith('/admin')) {
    const matched = ADMIN_ROUTES.find((item) => pathname.startsWith(item.prefix));
    return `${localizeTitle(matched?.title || 'Dashboard', isEn)} - Admin | FoodAI`;
  }

  const matched = USER_ROUTES.find((item) => pathname.startsWith(item.prefix));
  return `${localizeTitle(matched?.title || 'Home', isEn)} - ${isEn ? 'User' : 'Người dùng'} | FoodAI`;
};

const RouteTitle = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    document.title = buildTitle(location.pathname, isEn);
  }, [isEn, location.pathname]);

  return null;
};

export default RouteTitle;
