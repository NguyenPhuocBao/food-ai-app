import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquareMore } from 'lucide-react';
import { getSupportSessions } from '../../services/support.service';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminSupportFab = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadPendingSupport = async () => {
      try {
        const sessions = await getSupportSessions();
        if (!active) return;
        const pending = sessions.filter((session) => session.status === 'SUPPORT_PENDING').length;
        setPendingCount(pending);
      } catch {
        if (!active) return;
        setPendingCount(0);
      }
    };

    void loadPendingSupport();
    const interval = setInterval(() => {
      void loadPendingSupport();
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (location.pathname.startsWith('/admin/chat-ai')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
        <Link
          to="/admin/chat-ai"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-2xl border-2 border-white dark:border-slate-900 inline-flex items-center justify-center"
          title={isEn ? 'Open support inbox' : 'Mở CSKH Inbox'}
        >
          <MessageSquareMore size={24} />
        </Link>
      </motion.div>

      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
    </div>
  );
};

export default AdminSupportFab;
