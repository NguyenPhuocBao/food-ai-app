import { useEffect, useState } from 'react';
import api from '../../services/api';
import { MessageSquare, Bot, User } from 'lucide-react';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDate, formatAdminTime } from '../../utils/adminDateTime';

const AdminChatHistory = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/sessions')
      .then(res => { setSessions(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const viewSession = async (id: number) => {
    const res = await api.get(`/chat/sessions/${id}`);
    setSelectedSession(res.data.data);
    setMessages(res.data.data.messages);
  };

  if (loading) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div><div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div></div>;
  }

  if (!loading && sessions.length === 0) {
    return <EmptyState icon={MessageSquare} title="Chưa có phiên chat" description="Chưa có người dùng nào chat với AI." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Lịch sử Chat AI</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Xem lại các cuộc trò chuyện giữa người dùng và AI</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar danh sách phiên */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white">Các phiên chat</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[70vh] overflow-y-auto">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => viewSession(s.id)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedSession?.id === s.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-blue-500" />
                    <span className="font-medium text-gray-800 dark:text-white truncate">{s.title}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{formatAdminDate(s.updatedAt)}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Tin nhắn: {s._count?.messages || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Khu vực hiển thị tin nhắn */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {selectedSession ? selectedSession.title : 'Chọn phiên chat để xem'}
            </h2>
          </div>
          <div className="flex-1 p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedSession && messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">Chưa có tin nhắn nào trong phiên này.</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[75%] ${m.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    {m.role === 'USER' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><User size={16} className="text-blue-600" /></div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Bot size={16} className="text-green-600" /></div>
                    )}
                  </div>
                  <div className={`rounded-3xl px-4 py-2 shadow-sm ${
                    m.role === 'USER' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    <div className="text-sm">{m.content}</div>
                    <div className={`text-xs mt-1 ${m.role === 'USER' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatAdminTime(m.createdAt)}
                    </div>
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

export default AdminChatHistory;
