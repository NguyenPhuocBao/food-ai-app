import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash, Send, Users, Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const typeConfig = {
  INFO: { icon: Info, color: 'blue', bg: 'bg-blue-100 text-blue-800' },
  WARNING: { icon: AlertTriangle, color: 'yellow', bg: 'bg-yellow-100 text-yellow-800' },
  SUCCESS: { icon: CheckCircle, color: 'green', bg: 'bg-green-100 text-green-800' },
  ERROR: { icon: XCircle, color: 'red', bg: 'bg-red-100 text-red-800' },
} as const;

type NotificationType = keyof typeof typeConfig;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'INFO' as NotificationType });
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, [page]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/notifications?page=${page}&limit=20`);
      setNotifications(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải thông báo'); } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users?limit=1000');
      setUsers(res.data.data);
    } catch (error) {}
  };

  const handleDelete = async (id: number) => {
    if (confirm('Xóa thông báo này?')) {
      await api.delete(`/admin/notifications/${id}`);
      toast.success('Đã xóa');
      loadNotifications();
    }
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

  const handleSendToSelected = async () => {
    if (selectedUsers.length === 0) return toast.error('Chọn ít nhất một người dùng');
    try {
      await api.post('/admin/notifications/send-to-multiple', {
        userIds: selectedUsers,
        title: broadcast.title,
        message: broadcast.message,
        type: broadcast.type,
      });
      toast.success(`Đã gửi đến ${selectedUsers.length} người dùng`);
      setShowUserSelector(false);
      setSelectedUsers([]);
      setBroadcast({ title: '', message: '', type: 'INFO' });
    } catch (error) { toast.error('Gửi thất bại'); }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (loading && page === 1) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý thông báo</h1>
        <p className="text-gray-500">Gửi thông báo đến người dùng và quản lý lịch sử</p>
      </div>

      {/* Broadcast form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell size={20} /> Gửi thông báo</h2>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <input
            type="text"
            placeholder="Tiêu đề"
            value={broadcast.title}
            onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
            className="w-full border rounded-xl px-4 py-2"
            required
          />
          <textarea
            placeholder="Nội dung"
            value={broadcast.message}
            onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
            className="w-full border rounded-xl px-4 py-2"
            rows={3}
            required
          />
          <select
            value={broadcast.type}
            onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value as NotificationType })}
            className="border rounded-xl px-4 py-2"
          >
            <option value="INFO">Thông tin</option>
            <option value="WARNING">Cảnh báo</option>
            <option value="SUCCESS">Thành công</option>
            <option value="ERROR">Lỗi</option>
          </select>
          <div className="flex gap-3">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl">
              <Send size={18} /> Gửi đến tất cả
            </button>
            <button
              type="button"
              onClick={() => setShowUserSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl"
            >
              <Users size={18} /> Gửi đến người dùng chọn
            </button>
          </div>
        </form>
      </div>

      {/* Modal chọn người dùng */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chọn người dùng nhận thông báo</h2>
              <button onClick={() => setShowUserSelector(false)} className="p-1 rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="space-y-2 mb-4">
              {users.map(user => (
                <label key={user.id} className="flex items-center gap-2 p-2 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                  <span>{user.name} ({user.email})</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowUserSelector(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Hủy</button>
              <button onClick={handleSendToSelected} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Gửi</button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách thông báo */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-6 py-3 text-left">ID</th><th className="px-6 py-3 text-left">Người nhận</th><th className="px-6 py-3 text-left">Tiêu đề</th><th className="px-6 py-3 text-left">Loại</th><th className="px-6 py-3 text-left">Đã đọc</th><th className="px-6 py-3 text-left">Ngày</th><th className="px-6 py-3 text-left">Hành động</th></tr>
            </thead>
            <tbody>
              {notifications.map(notif => {
                const type = notif.type as NotificationType;
                const config = typeConfig[type];
                const TypeIcon = config?.icon || Info;
                const badgeClass = config?.bg || 'bg-gray-100 text-gray-800';
                return (
                  <tr key={notif.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{notif.id}</td>
                    <td className="px-6 py-4">{notif.user?.name}</td>
                    <td className="px-6 py-4">{notif.title}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${badgeClass}`}><TypeIcon size={12} /> {notif.type}</span></td>
                    <td className="px-6 py-4 text-center">{notif.isRead ? '✅' : '❌'}</td>
                    <td className="px-6 py-4">{new Date(notif.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4"><button onClick={() => handleDelete(notif.id)} className="text-red-600"><Trash size={18} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 border rounded-xl">Trước</button>
        <span>Trang {page} / {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 border rounded-xl">Sau</button>
      </div>
    </div>
  );
};

export default AdminNotifications;