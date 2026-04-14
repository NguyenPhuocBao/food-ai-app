import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  createSession,
  deleteSession,
  getSession,
  getSessions,
  sendMessage,
  type ChatMessage,
  type ChatSession,
} from '../services/chatbot.service';

const suggestions = [
  'Goi y bua toi duoi 500 calo',
  'Toi di ung hai san, hom nay an gi?',
  'Tao thuc don chay cho tuan nay',
  'Lam sao nau uc ga khong bi kho?',
];

const ChatPageV2 = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<(ChatSession & { messages: ChatMessage[] }) | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadSessions(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const loadSessions = async (autoOpenLatest: boolean) => {
    setIsLoadingSessions(true);
    try {
      const data = await getSessions();
      setSessions(data);

      if (autoOpenLatest && !activeSession && data.length > 0) {
        const latestSession = await getSession(data[0].id);
        setActiveSession(latestSession);
      }
    } catch {
      // User may not have any session yet.
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const session = await createSession();
      setSessions((prev) => [session, ...prev]);
      const fullSession = await getSession(session.id);
      setActiveSession(fullSession);
    } catch {
      toast.error('Khong the tao cuoc tro chuyen moi');
    }
  };

  const handleSelectSession = async (sessionId: number) => {
    setIsLoadingMessages(true);
    try {
      const fullSession = await getSession(sessionId);
      setActiveSession(fullSession);
    } catch {
      toast.error('Khong the tai cuoc tro chuyen');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      const nextSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(nextSessions);

      if (activeSession?.id === sessionId) {
        if (nextSessions.length > 0) {
          await handleSelectSession(nextSessions[0].id);
        } else {
          setActiveSession(null);
        }
      }

      toast.success('Da xoa cuoc tro chuyen');
    } catch {
      toast.error('Khong the xoa cuoc tro chuyen');
    }
  };

  const handleSend = async (content?: string) => {
    const text = (content || message).trim();
    if (!text) return;

    let sessionId = activeSession?.id;
    if (!sessionId) {
      try {
        const newSession = await createSession(text.slice(0, 50));
        setSessions((prev) => [newSession, ...prev]);
        const fullSession = await getSession(newSession.id);
        setActiveSession(fullSession);
        sessionId = newSession.id;
      } catch {
        toast.error('Khong the tao cuoc tro chuyen');
        return;
      }
    }

    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      sessionId,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setActiveSession((prev) => (prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev));
    setMessage('');
    setIsSending(true);

    try {
      await sendMessage(sessionId, text);
      const syncedSession = await getSession(sessionId);
      setActiveSession(syncedSession);
      void loadSessions(false);
    } catch {
      toast.error('Gui tin nhan that bai, vui long thu lai');
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => m.id !== optimisticMessage.id),
            }
          : prev,
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSend();
  };

  const filteredSessions = sessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hom nay';
    if (diffDays === 1) return 'Hom qua';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] min-h-[600px] flex gap-6">
      <div className="hidden lg:flex w-80 bg-white rounded-[32px] border border-gray-100 shadow-sm flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col gap-4">
          <button
            onClick={handleNewSession}
            type="button"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Cuoc Tro Chuyen Moi
          </button>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tim doan chat..."
              className="w-full bg-gray-50 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Chua co cuoc tro chuyen nao</p>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => void handleSelectSession(session.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void handleSelectSession(session.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`w-full text-left p-3 rounded-xl flex items-start justify-between gap-2 transition-colors group ${
                  activeSession?.id === session.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm truncate block">{session.title}</span>
                  <span className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {formatTime(session.updatedAt)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => void handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-gray-400 transition-all shrink-0"
                  title="Xoa cuoc tro chuyen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bot size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg leading-tight flex items-center gap-2">
                Food AI
                <Sparkles size={16} className="text-amber-500" />
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {activeSession ? activeSession.title : 'Tro ly dinh duong AI cho ban'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewSession}
              type="button"
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Chat moi
            </button>
            {isSending && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <Loader2 size={16} className="animate-spin" />
                Dang tra loi...
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          <div className="max-w-3xl mx-auto space-y-6 w-full">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
              </div>
            ) : !activeSession || activeSession.messages.length === 0 ? (
              <>
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center mt-1 bg-emerald-500 text-white shadow-sm border border-white">
                    <Bot size={20} strokeWidth={2.5} />
                  </div>
                  <div className="p-4 text-[15px] leading-relaxed shadow-sm bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm">
                    Chao {user?.name?.split(' ').pop() || 'ban'}! Toi la tro ly dinh duong Food AI. Hom nay toi co the giup gi cho
                    muc tieu suc khoe cua ban?
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                  {suggestions.map((text, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <button
                        onClick={() => void handleSend(text)}
                        type="button"
                        className="w-full text-left bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 text-gray-700 hover:text-emerald-700 text-sm px-5 py-3.5 rounded-[20px] transition-all shadow-sm font-medium flex items-center gap-3 group"
                      >
                        <MessageSquare size={16} className="text-gray-400 group-hover:text-emerald-500 shrink-0" />
                        {text}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {activeSession.messages.map((msg) => (
                  <AnimatePresence key={msg.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 max-w-[85%] ${msg.role === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center mt-1 border border-white shadow-sm ${
                          msg.role === 'USER'
                            ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {msg.role === 'USER' ? <User size={18} /> : <Bot size={20} strokeWidth={2.5} />}
                      </div>
                      <div
                        className={`p-4 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                          msg.role === 'USER'
                            ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ))}
              </>
            )}

            {isSending && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={20} strokeWidth={2.5} />
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-50 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex relative items-end bg-gray-50 rounded-[24px] p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all border border-gray-100 shadow-inner"
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Nhan tin cho Food AI..."
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-48 min-h-[52px] py-3.5 px-4 text-base text-gray-900 placeholder-gray-400 font-medium"
                rows={1}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className={`p-3.5 rounded-[16px] shrink-0 mb-1 mr-1 shadow-sm transition-all flex items-center justify-center ${
                  message.trim() && !isSending
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
            <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
              Food AI co the mac loi. Vui long kiem tra lai thong tin dinh duong quan trong.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPageV2;
