import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatAdminDateTime } from '../../utils/adminDateTime';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = () => {
  const { logoutAdmin, admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=5&unreadOnly=false');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch {
        // ignore background notification errors
      }
    };

    void fetchNotifications();
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    const res = await api.get('/notifications?limit=5&unreadOnly=false');
    setNotifications(res.data.data);
    setUnreadCount(res.data.unreadCount);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          {isEn ? 'Hello' : 'Chào'}, {admin?.name || 'Admin'}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50"
                >
                  <div className="p-3 border-b font-semibold text-gray-900 dark:text-slate-100">
                    {isEn ? 'Notifications' : 'Thông báo'}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                        {isEn ? 'No notifications' : 'Không có thông báo'}
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => void markAsRead(notif.id)}
                        >
                          <div className="font-medium text-gray-900 dark:text-slate-100">{notif.title}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">{notif.message}</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            {formatAdminDateTime(notif.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all"
          >
            <LogOut size={18} />
            <span>{isEn ? 'Log out' : 'Đăng xuất'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

