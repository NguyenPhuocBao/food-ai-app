import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  type LucideIcon,
  BarChart2,
  Bell,
  BookOpen,
  BookText,
  Bot,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Scan,
  Sparkles,
  Trash2,
  User as UserIcon,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
  type Notification,
} from '../../services/notification.service';

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
};

type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const TYPE_CONFIG = {
  INFO: { dot: 'bg-blue-500' },
  SUCCESS: { dot: 'bg-emerald-500' },
  WARNING: { dot: 'bg-amber-500' },
  ERROR: { dot: 'bg-red-500' },
};

const buildNavData = (isEn: boolean) => {
  const directLinks: NavItem[] = [
    { label: isEn ? 'Home' : 'Trang chủ', path: '/', icon: Home, description: isEn ? 'Daily overview and quick actions.' : 'Tổng quan trong ngày và thao tác nhanh.' },
    { label: 'AI Coach', path: '/chat-ai', icon: MessageSquare, description: isEn ? 'Chat with AI for meal suggestions.' : 'Trò chuyện với AI để xin gợi ý bữa ăn.' },
  ];

  const navGroups: NavGroup[] = [
    {
      id: 'discover',
      label: isEn ? 'Discover' : 'Khám phá',
      icon: UtensilsCrossed,
      items: [
        { label: isEn ? 'Foods' : 'Món ăn', path: '/foods', icon: UtensilsCrossed, description: isEn ? 'Food library and nutrition details.' : 'Thư viện món ăn và thông tin dinh dưỡng.' },
        { label: isEn ? 'Recipes' : 'Công thức', path: '/recipes', icon: BookOpen, description: isEn ? 'Recipes and cooking instructions.' : 'Công thức, cách nấu và chi tiết món.' },
        { label: isEn ? 'AI Suggestions' : 'Gợi ý AI', path: '/recommendations', icon: Sparkles, description: isEn ? 'Recommendations based on your goal.' : 'Gợi ý món ăn dựa trên lịch sử và mục tiêu của bạn.' },
        { label: isEn ? 'Library' : 'Thư viện', path: '/library', icon: Heart, description: isEn ? 'Saved favorites and recipes.' : 'Món yêu thích và công thức đã lưu.' },
      ],
    },
    {
      id: 'tracking',
      label: isEn ? 'Tracking' : 'Theo dõi',
      icon: BarChart2,
      items: [
        { label: isEn ? 'Scan Food' : 'Quét món ăn', path: '/scan', icon: Scan, description: isEn ? 'Upload image and scan by AI.' : 'Tải ảnh và nhận diện món bằng AI.' },
        { label: isEn ? 'Diary' : 'Nhật ký', path: '/diary', icon: BookText, description: isEn ? 'Track your meals.' : 'Theo dõi các bữa ăn đã ăn.' },
        { label: isEn ? 'Statistics' : 'Thống kê', path: '/statistics', icon: BarChart2, description: isEn ? 'Calories and macro progress.' : 'Tiến độ calo, protein, carbs, fat.' },
        { label: isEn ? 'Weekly Reports' : 'Báo cáo tuần', path: '/weekly-reports', icon: CalendarDays, description: isEn ? 'Weekly summaries and reports.' : 'Tổng hợp dữ liệu theo tuần và lưu báo cáo.' },
      ],
    },
    {
      id: 'planning',
      label: isEn ? 'Planning' : 'Kế hoạch',
      icon: CalendarDays,
      items: [
        { label: 'Meal Plan', path: '/meal-plans', icon: CalendarDays, description: isEn ? 'Plan meals by day and meal type.' : 'Lập kế hoạch ăn uống theo ngày và bữa.' },
      ],
    },
  ];

  const mobileSections = [
    { title: isEn ? 'Overview' : 'Tổng quan', items: directLinks },
    { title: navGroups[0].label, items: navGroups[0].items },
    { title: navGroups[1].label, items: navGroups[1].items },
    { title: navGroups[2].label, items: navGroups[2].items },
  ];

  return { directLinks, navGroups, mobileSections };
};

const isPathActive = (pathname: string, path: string) => {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
};

const timeAgo = (dateStr: string, isEn: boolean) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return isEn ? 'Just now' : 'Vừa xong';
  if (mins < 60) return isEn ? `${mins} min ago` : `${mins} phút trước`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return isEn ? `${hours} h ago` : `${hours} giờ trước`;

  return isEn ? `${Math.floor(hours / 24)} d ago` : `${Math.floor(hours / 24)} ngày trước`;
};

const UserShell = () => {
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { directLinks, navGroups, mobileSections } = buildNavData(isEn);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch {
        // ignore notification polling errors
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOpenGroupId(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }

      if (navRef.current && !navRef.current.contains(target)) {
        setOpenGroupId(null);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((notification) => (
      notification.id === id ? { ...notification, isRead: true } : notification
    )));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  const handleDelete = async (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const isGroupActive = (group: NavGroup) => group.items.some((item) => isPathActive(location.pathname, item.path));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 mr-2 text-gray-500 hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-emerald-500 p-1.5 rounded-lg text-white shadow-md group-hover:bg-emerald-600 transition-colors">
                  <Bot size={22} strokeWidth={2.5} />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-black text-gray-900 tracking-tight">
                    Food<span className="text-emerald-500">AI</span>
                  </span>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400 font-bold">
                    {isEn ? 'Nutrition Companion' : 'Trợ lý dinh dưỡng'}
                  </p>
                </div>
              </Link>
            </div>

            <div ref={navRef} className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {directLinks.map((item) => {
                const active = isPathActive(location.pathname, item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}

              {navGroups.map((group) => {
                const active = isGroupActive(group);
                const open = openGroupId === group.id;

                return (
                  <div key={group.id} className="relative">
                    <button
                      onClick={() => setOpenGroupId((current) => current === group.id ? null : group.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                        active || open
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <group.icon size={17} strokeWidth={active || open ? 2.5 : 2} />
                      {group.label}
                      <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-0 top-full mt-3 w-80 bg-white rounded-[24px] border border-gray-100 shadow-2xl overflow-hidden"
                        >
                          <div className="px-5 py-4 border-b border-gray-50">
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">{group.label}</p>
                            <p className="text-sm text-gray-600 mt-1">Mo nhanh cac chuc nang lien quan trong cung mot nhom.</p>
                          </div>

                          <div className="p-3">
                            {group.items.map((item) => {
                              const itemActive = isPathActive(location.pathname, item.path);

                              return (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  onClick={() => setOpenGroupId(null)}
                                  className={`flex items-start gap-3 rounded-2xl px-4 py-3 transition-colors ${
                                    itemActive ? 'bg-emerald-50' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                    itemActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    <item.icon size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`font-bold ${itemActive ? 'text-emerald-700' : 'text-gray-900'}`}>{item.label}</p>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((open) => !open)}
                  className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full relative transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-900">{isEn ? 'Notifications' : 'Thông báo'}</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCheck size={14} /> {isEn ? 'Mark all as read' : 'Đánh dấu tất cả'}
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center text-gray-400">
                            <Bell size={32} className="mx-auto mb-2 text-gray-200" />
                            <p className="text-sm">{isEn ? 'No notifications' : 'Không có thông báo nào'}</p>
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.INFO;

                            return (
                              <button
                                key={notification.id}
                                onClick={() => handleMarkRead(notification.id)}
                                className={`w-full text-left px-5 py-4 hover:bg-gray-50/80 transition-colors flex items-start gap-3 group ${
                                  !notification.isRead ? 'bg-blue-50/30' : ''
                                }`}
                              >
                                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${notification.isRead ? 'bg-gray-200' : cfg.dot}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{notification.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.createdAt, isEn)}</p>
                                </div>
                                <button
                                  onClick={(event) => handleDelete(event, notification.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all shrink-0"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left mr-1">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || (isEn ? 'User' : 'Người dùng')}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 hidden lg:block" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-2">
                        <p className="text-sm text-gray-500">{isEn ? 'Logged in as' : 'Đăng nhập với'}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
                        <UserIcon size={16} className="mr-3 text-gray-400" /> {isEn ? 'Profile' : 'Hồ sơ cá nhân'}
                      </Link>
                      <Link to="/statistics" onClick={() => setProfileDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
                        <BarChart2 size={16} className="mr-3 text-gray-400" /> {isEn ? 'Statistics' : 'Thống kê'}
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logoutUser();
                        }}
                        className="w-full flex items-center px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600"
                      >
                        <LogOut size={16} className="mr-3" /> {isEn ? 'Log out' : 'Đăng xuất'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[88vw] bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                    <Bot size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-xl font-black text-gray-900 tracking-tight">FoodAI</span>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400 font-bold">Navigation</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="px-4 py-5 space-y-6 overflow-y-auto flex-1">
                {mobileSections.map((section) => (
                  <div key={section.title}>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400 font-black px-2 mb-3">{section.title}</p>
                    <div className="space-y-2">
                      {section.items.map((item) => {
                        const active = isPathActive(location.pathname, item.path);

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-start gap-3 px-4 py-3 rounded-2xl transition-colors ${
                              active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                              active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <item.icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold">{item.label}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 mb-2"
                >
                  <UserIcon size={20} className="mr-3 text-gray-400" /> {isEn ? 'Profile' : 'Hồ sơ cá nhân'}
                </Link>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-2xl font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} className="mr-3" /> {isEn ? 'Log out' : 'Đăng xuất'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
    </div>
  );
};

export default UserShell;
