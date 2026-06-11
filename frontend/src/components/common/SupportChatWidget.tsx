import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Headset, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  createSupportSession,
  getSupportSession,
  getSupportSessions,
  sendSupportMessage,
  type SupportMessage,
  type SupportSession,
} from '../../services/support.service';

type SessionDetail = SupportSession & { messages: SupportMessage[] };

const getErrorMessage = (error: unknown, fallback: string) => {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
};

const getSupportSeenStorageKey = (userId: number) => `support_seen_user_${userId}`;

const readSeenMap = (userId?: number | null) => {
  if (!userId || typeof window === 'undefined') return {} as Record<number, number>;
  try {
    const raw = window.localStorage.getItem(getSupportSeenStorageKey(userId));
    return raw ? JSON.parse(raw) as Record<number, number> : {};
  } catch {
    return {};
  }
};

const writeSeenMap = (userId: number, next: Record<number, number>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getSupportSeenStorageKey(userId), JSON.stringify(next));
};

const SupportChatWidget = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [activeSession, setActiveSession] = useState<SessionDetail | null>(null);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName = (user?.name || (isEn ? 'you' : 'bạn')).split(' ').pop() || (isEn ? 'you' : 'bạn');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  useEffect(() => {
    if (!user) return;
    void loadChatState(open && !activeSession, !open);
  }, [open, user]);

  useEffect(() => {
    if (!user) {
      setOpen(false);
      setSessions([]);
      setActiveSession(null);
      setMessage('');
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (open && activeSession?.id) {
        void syncActiveSession(activeSession.id);
      } else {
        void loadChatState(false, true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, user, activeSession?.id]);

  const markSessionSeen = (session: SessionDetail) => {
    if (!user?.id) return;
    const latestAdminMessage = [...(session.messages || [])]
      .reverse()
      .find((item) => item.role === 'ADMIN');
    if (!latestAdminMessage) return;
    const current = readSeenMap(user.id);
    if ((current[session.id] || 0) >= latestAdminMessage.id) return;
    const next = { ...current, [session.id]: latestAdminMessage.id };
    writeSeenMap(user.id, next);
  };

  const updateUnreadCount = async (list: SupportSession[]) => {
    if (!user?.id || list.length === 0) {
      setUnreadCount(0);
      return;
    }

    const seenMap = readSeenMap(user.id);
    const details = await Promise.all(
      list.map((session) => getSupportSession(session.id).catch(() => null))
    );

    const nextUnreadCount = details.reduce((sum, detail) => {
      if (!detail) return sum;
      const seenId = seenMap[detail.id] || 0;
      return sum + detail.messages.filter((item) => item.role === 'ADMIN' && item.id > seenId).length;
    }, 0);

    setUnreadCount(nextUnreadCount);
  };

  const loadChatState = async (autoOpenLatest: boolean, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const list = await getSupportSessions();
      setSessions(list);

      if (autoOpenLatest && list.length > 0) {
        const full = await getSupportSession(list[0].id);
        setActiveSession(full);
        markSessionSeen(full);
      }

      if (list.length === 0) {
        setActiveSession(null);
      }

      await updateUnreadCount(list);

    } catch (error) {
      if (!silent) {
        toast.error(getErrorMessage(error, isEn ? 'Cannot load support chat data' : 'Không thể tải dữ liệu chat CSKH'));
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const syncActiveSession = async (sessionId: number) => {
    try {
      const full = await getSupportSession(sessionId);
      setActiveSession(full);
       if (open) {
        markSessionSeen(full);
      }
      setSessions((prev) => {
        const without = prev.filter((item) => item.id !== full.id);
        return [full, ...without];
      });
      await updateUnreadCount(
        sessions.some((item) => item.id === full.id)
          ? sessions.map((item) => (item.id === full.id ? full : item))
          : [full, ...sessions]
      );
    } catch {
      // ignore background polling errors
    }
  };

  const createNewSession = async () => {
    const created = await createSupportSession({ title: isEn ? 'Customer support' : 'Hỗ trợ khách hàng' });
    setSessions((prev) => [created, ...prev]);
      const full = await getSupportSession(created.id);
      setActiveSession(full);
      markSessionSeen(full);
      return full;
  };

  const handleSend = async () => {
    const text = message.trim();
    if (!text || isSending) return;

    setMessage('');
    setIsSending(true);

    let session = activeSession;
    const optimisticId = Date.now();

    try {
      if (!session) {
        session = await createNewSession();
      }

      const optimisticUserMessage: SupportMessage = {
        id: optimisticId,
        sessionId: session.id,
        role: 'USER',
        content: text,
        createdAt: new Date().toISOString(),
      };

      setActiveSession((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, optimisticUserMessage] };
      });

      const saved = await sendSupportMessage(session.id, text);
      setActiveSession((prev) => {
        if (!prev) return prev;
        const removedOptimistic = prev.messages.filter((item) => item.id !== optimisticId);
        return { ...prev, messages: [...removedOptimistic, saved] };
      });

      await syncActiveSession(session.id);
    } catch (error) {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((item) => item.id !== optimisticId),
        };
      });
      toast.error(getErrorMessage(error, isEn ? 'Failed to send message' : 'Gửi tin nhắn thất bại'));
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !user || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="support-chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-[370px] max-w-[calc(100vw-1.5rem)] h-[540px] rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Headset size={18} />
                  <div>
                    <p className="text-sm font-bold">{isEn ? 'Customer Support' : 'Chăm sóc khách hàng'}</p>
                    <p className="text-[11px] text-emerald-100">
                      {isEn ? 'Admin staff will reply as soon as possible' : 'Nhân viên admin sẽ phản hồi sớm nhất'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 inline-flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 text-xs text-gray-600 dark:text-slate-300">
              {isEn ? 'This channel is for messaging support admins only.' : 'Kênh này chỉ dùng để nhắn với admin CSKH.'}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/40 dark:bg-slate-950/40">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <>
                  {!activeSession || activeSession.messages.length === 0 ? (
                    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 text-sm text-gray-700 dark:text-slate-200">
                      {isEn
                        ? `Hi ${displayName}, what do you need help with? Please describe briefly so admin can respond faster.`
                        : `Xin chào ${displayName}, bạn cần hỗ trợ vấn đề gì? Hãy mô tả ngắn gọn để admin phản hồi nhanh hơn.`}
                    </div>
                  ) : (
                    activeSession.messages.map((item) => {
                      const isUser = item.role === 'USER';
                      const isAdmin = item.role === 'ADMIN';
                      return (
                        <div key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                              isUser
                                ? 'bg-emerald-600 text-white rounded-br-sm'
                                : isAdmin
                                ? 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-sm'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-sm'
                            }`}
                          >
                            {!isUser && isAdmin && (
                              <div className="text-[11px] font-semibold mb-1 text-cyan-600 dark:text-cyan-300">
                                {isEn ? 'Support Admin' : 'Admin CSKH'}
                              </div>
                            )}
                            {item.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
              className="p-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  placeholder={isEn ? 'Type your support message...' : 'Nhập nội dung cần hỗ trợ...'}
                  className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white inline-flex items-center justify-center"
                >
                  {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="support-chat-button"
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900"
            title={isEn ? 'Customer support chat' : 'Chat chăm sóc khách hàng'}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {!open && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default SupportChatWidget;
