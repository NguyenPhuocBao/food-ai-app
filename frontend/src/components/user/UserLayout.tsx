import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  type LucideIcon,
  Home, 
  Scan, 
  CalendarDays,
  UtensilsCrossed,
  BookOpen,
  Heart,
  BookText, 
  MessageSquare, 
  User as UserIcon,
  Bot,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  BarChart2,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from '../../services/notification.service';

const TYPE_CONFIG = {
  INFO:    { color: 'bg-blue-100 text-blue-600',    dot: 'bg-blue-500' },
  SUCCESS: { color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
  WARNING: { color: 'bg-amber-100 text-amber-600',  dot: 'bg-amber-500' },
  ERROR:   { color: 'bg-red-100 text-red-600',      dot: 'bg-red-500' },
};

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

const DIRECT_LINKS: NavItem[] = [
  { label: 'Trang chu', path: '/', icon: Home, description: 'Tong quan hom nay va cac goi y nhanh.' },
  { label: 'AI Coach', path: '/chat-ai', icon: MessageSquare, description: 'Tro chuyen voi AI ve bua an va dinh duong.' },
];

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'discover',
    label: 'Kham pha',
    icon: UtensilsCrossed,
    items: [
      { label: 'Mon an', path: '/foods', icon: UtensilsCrossed, description: 'Thu vien mon an va thong tin dinh duong.' },
      { label: 'Cong thuc', path: '/recipes', icon: BookOpen, description: 'Xem cong thuc va cach che bien chi tiet.' },
      { label: 'Thu vien', path: '/library', icon: Heart, description: 'Mon yeu thich va cong thuc da luu.' },
    ],
  },
  {
    id: 'tracking',
    label: 'Theo doi',
    icon: BarChart2,
    items: [
      { label: 'Quet mon an', path: '/scan', icon: Scan, description: 'Tai anh mon an va nhan dien bang AI.' },
      { label: 'Nhat ky', path: '/diary', icon: BookText, description: 'Theo doi cac bua an da an trong ngay.' },
      { label: 'Thong ke', path: '/statistics', icon: BarChart2, description: 'Xem tien do calo va macros.' },
    ],
  },
  {
    id: 'planning',
    label: 'Ke hoach',
    icon: CalendarDays,
    items: [
      { label: 'Meal plan', path: '/meal-plans', icon: CalendarDays, description: 'Tao va quan ly ke hoach an uong.' },
    ],
  },
];

const MOBILE_SECTIONS = [
  { title: 'Tong quan', items: DIRECT_LINKS },
  { title: 'Kham pha', items: NAV_GROUPS[0].items },
  { title: 'Theo doi', items: NAV_GROUPS[1].items },
  { title: 'Ke hoach', items: NAV_GROUPS[2].items },
];

const isPathActive = (pathname: string, path: string) => {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};

const UserLayout = () => {
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOpenGroupId(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

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

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // silent
    }
  };

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const navItems = [
    { label: 'Món Ăn', path: '/foods', icon: UtensilsCrossed },
    { label: 'Công Thức', path: '/recipes', icon: BookOpen },
    { label: 'Meal Plan', path: '/meal-plans', icon: CalendarDays },
    { label: 'Thu vien', path: '/library', icon: Heart },
    { label: 'Trang Chủ', path: '/', icon: Home },
    { label: 'Quét Món Ăn', path: '/scan', icon: Scan },
    { label: 'Nhật Ký', path: '/diary', icon: BookText },
    { label: 'Thống Kê', path: '/statistics', icon: BarChart2 },
    { label: 'Trợ Lý AI', path: '/chat-ai', icon: MessageSquare },
  ];

  const isGroupActive = (group: NavGroup) => group.items.some((item) => isPathActive(location.pathname, item.path));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left: Logo & Mobile Toggle */}
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
                <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block">
                  Food<span className="text-emerald-500">AI</span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Nav */}
            <div ref={navRef} className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {DIRECT_LINKS.map((item) => {
                const isActive = isPathActive(location.pathname, item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}

              {NAV_GROUPS.map((group) => {
                const isActive = isGroupActive(group);
                const isOpen = openGroupId === group.id;

                return (
                  <div key={group.id} className="relative">
                    <button
                      onClick={() => setOpenGroupId((current) => current === group.id ? null : group.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                        isActive || isOpen
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <group.icon size={17} strokeWidth={isActive || isOpen ? 2.5 : 2} />
                      {group.label}
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
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

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-2 lg:gap-3">

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(o => !o)}
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
                      className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      {/* Notif Header */}
                      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-900">Thông báo</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCheck size={14} /> Đọc tất cả
                          </button>
                        )}
                      </div>

                      {/* Notif List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center text-gray-400">
                            <Bell size={32} className="mx-auto mb-2 text-gray-200" />
                            <p className="text-sm">Không có thông báo nào</p>
                          </div>
                        ) : (
                          notifications.map(notif => {
                            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.INFO;
                            return (
                              <button
                                key={notif.id}
                                onClick={() => handleMarkRead(notif.id)}
                                className={`w-full text-left px-5 py-4 hover:bg-gray-50/80 transition-colors flex items-start gap-3 group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                              >
                                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${notif.isRead ? 'bg-gray-200' : cfg.dot}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                </div>
                                <button
                                  onClick={(e) => handleDelete(e, notif.id)}
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
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left mr-1">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Người dùng'}</p>
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
                        <p className="text-sm text-gray-500">Đăng nhập dưới tên</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
                        <UserIcon size={16} className="mr-3 text-gray-400" /> Hồ sơ cá nhân
                      </Link>
                      <Link to="/statistics" onClick={() => setProfileDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
                        <BarChart2 size={16} className="mr-3 text-gray-400" /> Thống kê
                      </Link>
                      <button 
                        onClick={() => { setProfileDropdownOpen(false); logoutUser(); }}
                        className="w-full flex items-center px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600"
                      >
                        <LogOut size={16} className="mr-3" /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
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
               className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                    <Bot size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-xl font-black text-gray-900 tracking-tight">FoodAI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl font-bold ${
                      location.pathname === item.path 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={20} className="mr-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 mb-2">
                  <UserIcon size={20} className="mr-3" /> Hồ sơ cá nhân
                </Link>
                <button onClick={() => { logoutUser(); setMobileMenuOpen(false); }} className="w-full flex items-center px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50">
                  <LogOut size={20} className="mr-3" /> Đăng xuất
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      
    </div>
  );
};

export default UserLayout;
