import { useEffect, useMemo, useState } from 'react';
import { Bot, MessageSquare, Search, User } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDate, formatAdminTime } from '../../utils/adminDateTime';
import type { ChatMessage, ChatSession } from '../../services/chatbot.service';

type SessionDetail = ChatSession & { messages: ChatMessage[] };

const AdminChatHistoryV2 = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/chat/sessions')
      .then((res) => {
        setSessions(res.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((s) => {
      const owner = `${s.user?.name || ''} ${s.user?.email || ''}`.toLowerCase();
      return s.title.toLowerCase().includes(keyword) || owner.includes(keyword);
    });
  }, [search, sessions]);

  const viewSession = async (id: number) => {
    const res = await api.get(`/chat/sessions/${id}`);
    const data = res.data.data as SessionDetail;
    setSelectedSession(data);
    setMessages(data.messages || []);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return <EmptyState icon={MessageSquare} title="Chua co phien chat" description="Chua co nguoi dung nao chat voi AI." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Lich su Chat AI</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Theo doi noi dung hoi thoai giua nguoi dung va AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
            <h2 className="font-semibold text-gray-800 dark:text-white">Danh sach phien</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tim theo tieu de, ten, email..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[70vh] overflow-y-auto">
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => void viewSession(s.id)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedSession?.id === s.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
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
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Tin nhan: {s._count?.messages || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {selectedSession ? selectedSession.title : 'Chon phien chat de xem'}
            </h2>
            {selectedSession?.user && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                User: {selectedSession.user.name} ({selectedSession.user.email})
              </p>
            )}
          </div>

          <div className="flex-1 p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedSession && messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">Phien nay chua co tin nhan.</div>
            )}
            {!selectedSession && <div className="text-center text-gray-500 py-12">Chon mot phien chat ben trai de xem chi tiet.</div>}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[78%] ${m.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    {m.role === 'USER' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User size={16} className="text-blue-600 dark:text-blue-300" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Bot size={16} className="text-emerald-600 dark:text-emerald-300" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-3xl px-4 py-2 shadow-sm ${
                      m.role === 'USER'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={`text-xs mt-1 ${m.role === 'USER' ? 'text-blue-100' : 'text-gray-400'}`}>{formatAdminTime(m.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatHistoryV2;
