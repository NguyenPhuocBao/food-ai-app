import { useEffect, useMemo, useState } from 'react';
import { Headset, Loader2, MessageSquare, Search, Send, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDate, formatAdminTime } from '../../utils/adminDateTime';
import {
  getSupportSession,
  getSupportSessions,
  sendSupportMessage,
  updateSupportSessionStatus,
  type SupportMessage,
  type SupportSession,
} from '../../services/support.service';

type SessionDetail = SupportSession & { messages: SupportMessage[] };

const getErrorMessage = (error: unknown, fallback: string) => {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
};

const statusLabel = (status: string) => {
  if (status === 'SUPPORT_PENDING') return 'Cho admin';
  if (status === 'SUPPORT_CLOSED') return 'Da dong';
  return 'Dang mo';
};

const statusClass = (status: string) => {
  if (status === 'SUPPORT_PENDING') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  if (status === 'SUPPORT_CLOSED') return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
};

const AdminChatHistoryV2 = () => {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadSessions = async () => {
    try {
      const data = await getSupportSessions();
      setSessions(data || []);
    } catch {
      // ignore list reload errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();

    const interval = setInterval(() => {
      void loadSessions();
      if (selectedSession?.id) {
        void viewSession(selectedSession.id, true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSession?.id]);

  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((s) => {
      const owner = `${s.user?.name || ''} ${s.user?.email || ''}`.toLowerCase();
      return s.title.toLowerCase().includes(keyword) || owner.includes(keyword) || statusLabel(s.status).toLowerCase().includes(keyword);
    });
  }, [search, sessions]);

  const viewSession = async (id: number, silent = false) => {
    try {
      const data = await getSupportSession(id);
      setSelectedSession(data);
      setMessages(data.messages || []);
    } catch (error) {
      if (!silent) {
        toast.error(getErrorMessage(error, 'Khong th? tai cuoc tro chuyen CSKH'));
      }
    }
  };

  const handleSendReply = async () => {
    const content = reply.trim();
    if (!selectedSession || !content) return;

    setSendingReply(true);
    try {
      await sendSupportMessage(selectedSession.id, content);
      setReply('');
      await Promise.all([viewSession(selectedSession.id, true), loadSessions()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gui phan hoi that bai'));
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (status: 'SUPPORT_OPEN' | 'SUPPORT_CLOSED') => {
    if (!selectedSession) return;

    try {
      await updateSupportSessionStatus(selectedSession.id, status);
      await Promise.all([viewSession(selectedSession.id, true), loadSessions()]);
      if (status === 'SUPPORT_CLOSED') {
        toast.success('Da dong ticket');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cap nhat trang thai that bai'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return <EmptyState icon={MessageSquare} title="Chua co ticket CSKH" description="Chua co user nao gui tin nhan ho tro." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Ho tro khach hang</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Admin co the tra loi song song cho nhieu nguoi dung</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
            <h2 className="font-semibold text-gray-800 dark:text-white">Danh sach ticket</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tim theo user, email, trang thai..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[70vh] overflow-y-auto">
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => void viewSession(s.id)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedSession?.id === s.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 dark:text-white truncate">{s.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {s.user?.name || 'Unknown user'} - {s.user?.email || 'No email'}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">{formatAdminDate(s.updatedAt)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusClass(s.status)}`}>{statusLabel(s.status)}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">Tin nhan: {s._count?.messages || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {selectedSession ? selectedSession.title : 'Chon ticket de tra loi'}
              </h2>
              {selectedSession?.user && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  User: {selectedSession.user.name} ({selectedSession.user.email})
                </p>
              )}
            </div>
            {selectedSession && (
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${statusClass(selectedSession.status)}`}>
                  {statusLabel(selectedSession.status)}
                </span>
                {selectedSession.status !== 'SUPPORT_CLOSED' ? (
                  <button
                    type="button"
                    onClick={() => void handleStatusChange('SUPPORT_CLOSED')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-white"
                  >
                    Dong ticket
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleStatusChange('SUPPORT_OPEN')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
                  >
                    Mo lai
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 p-4 space-y-4 max-h-[60vh] overflow-y-auto bg-gray-50/40 dark:bg-slate-900/30">
            {selectedSession && messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">Ticket nay chua co tin nhan.</div>
            )}
            {!selectedSession && <div className="text-center text-gray-500 py-12">Chon mot ticket ben trai de tra loi.</div>}

            {messages.map((m) => {
              const isAdminMessage = m.role === 'ADMIN';
              const isUserMessage = m.role === 'USER';

              return (
                <div key={m.id} className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[78%] ${isAdminMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      {isAdminMessage ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-300" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User size={16} className="text-blue-600 dark:text-blue-300" />
                        </div>
                      )}
                    </div>

                    <div
                      className={`rounded-3xl px-4 py-2 shadow-sm ${
                        isAdminMessage
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                          : isUserMessage
                          ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <div className="text-[11px] font-semibold mb-1 opacity-90">{isAdminMessage ? 'Admin CSKH' : isUserMessage ? 'User' : 'System'}</div>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                      <div className={`text-xs mt-1 ${isAdminMessage ? 'text-emerald-100' : 'text-gray-400'}`}>{formatAdminTime(m.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-900">
            {selectedSession ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendReply();
                }}
                className="flex items-end gap-3"
              >
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder={selectedSession.status === 'SUPPORT_CLOSED' ? 'Ticket da dong. Hay mo lai de tiep tuc.' : 'Nhap noi dung phan hoi cho user...'}
                  disabled={selectedSession.status === 'SUPPORT_CLOSED'}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !reply.trim() || selectedSession.status === 'SUPPORT_CLOSED'}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white inline-flex items-center gap-2 text-sm"
                >
                  {sendingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Gui
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500">Chon mot ticket de bat dau phan hoi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatHistoryV2;
