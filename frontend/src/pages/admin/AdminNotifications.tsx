import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash, Send, Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

const typeConfig = {
  INFO: { icon: Info, color: 'blue', bg: 'bg-blue-100 text-blue-800' },
  WARNING: { icon: AlertTriangle, color: 'yellow', bg: 'bg-yellow-100 text-yellow-800' },
  SUCCESS: { icon: CheckCircle, color: 'green', bg: 'bg-green-100 text-green-800' },
  ERROR: { icon: XCircle, color: 'red', bg: 'bg-red-100 text-red-800' },
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'INFO' });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/notifications?page=${page}&limit=20`);
      setNotifications(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải thông báo'); } finally { setLoading(false); }
  };
  useEffect(() => { loadNotifications(); }, [page]);

  const handleDelete = async (id: number) => {
    if (confirm('Xóa thông báo này?')) { await api.delete(`/admin/notifications/${id}`); toast.success('Đã xóa'); loadNotifications(); }
  };
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications/broadcast', broadcast);
      toast.success('Đã gửi thông báo đến tất cả người dùng');
      setBroadcast({ title: '', message: '', type: 'INFO' });
      loadNotifications();
    } catch (error) { toast.error('Gửi thất bại'); }
  };

  if (loading && page===1) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Quản lý thông báo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gửi thông báo đến người dùng và quản lý lịch sử</p>
      </div>

      {/* Broadcast form */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Bell size={20} /> Gửi thông báo đến tất cả người dùng</h2>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <input
            type="text"
            placeholder="Tiêu đề"
            value={broadcast.title}
            onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
            required
          />
          <textarea
            placeholder="Nội dung"
            value={broadcast.message}
            onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
            rows={3}
            required
          />
          <select
            value={broadcast.type}
            onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800"
          >
            <option value="INFO">Thông tin</option><option value="WARNING">Cảnh báo</option><option value="SUCCESS">Thành công</option><option value="ERROR">Lỗi</option>
          </select>
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all">
            <Send size={18} /> Gửi
          </button>
        </form>
      </div>

      {/* Danh sách thông báo */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-left">Người nhận</th><th className="px-6 py-4 text-left">Tiêu đề</th><th className="px-6 py-4 text-left">Loại</th><th className="px-6 py-4 text-left">Đã đọc</th><th className="px-6 py-4 text-left">Ngày</th><th className="px-6 py-4 text-left">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif) => {
                const TypeIcon = typeConfig[notif.type as keyof typeof typeConfig]?.icon || Info;
                const badgeClass = typeConfig[notif.type as keyof typeof typeConfig]?.bg || 'bg-gray-100 text-gray-800';
                return (
                  <tr key={notif.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{notif.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{notif.user?.name}</td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white">{notif.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                        <TypeIcon size={12} /> {notif.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{notif.isRead ? '✅' : '❌'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(notif.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(notif.id)} className="text-red-600 hover:text-red-800" title="Xóa"><Trash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">← Trước</button>
        <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">Sau →</button>
      </div>
    </div>
  );
};

export default AdminNotifications;