import { FormEvent, useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, Send, Trash, Users, XCircle, Mail, MailOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatAdminDateTime } from '../../utils/adminDateTime';

const TYPE_CONFIG = {
  INFO: { icon: Info, badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  WARNING: { icon: AlertTriangle, badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  SUCCESS: { icon: CheckCircle, badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  ERROR: { icon: XCircle, badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
} as const;

type NotificationType = keyof typeof TYPE_CONFIG;

const AdminNotificationsV2 = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'INFO' as NotificationType,
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/notifications?page=${page}&limit=20`);
      setNotifications(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Khong th? tai thong bao');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users?limit=1000');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBroadcast = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/admin/notifications/broadcast', form);
      toast.success('Da gui thong bao den tat ca nguoi dung');
      setForm({ title: '', message: '', type: 'INFO' });
      loadNotifications();
    } catch (error) {
      toast.error('Gui thong bao that bai');
    }
  };

  const handleSendToSelected = async () => {
    if (!selectedUsers.length) {
      toast.error('Can chon it nhat 1 nguoi dung');
      return;
    }

    try {
      await api.post('/admin/notifications/send-to-multiple', {
        userIds: selectedUsers,
        ...form,
      });
      toast.success(`Da gui thong bao den ${selectedUsers.length} nguoi dung`);
      setForm({ title: '', message: '', type: 'INFO' });
      setSelectedUsers([]);
      setShowUserSelector(false);
      loadNotifications();
    } catch (error) {
      toast.error('Gui thong bao that bai');
    }
  };

  const handleDelete = async (notificationId: number) => {
    const confirmed = window.confirm('Xoa thong bao nay?');
    if (!confirmed) return;

    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      toast.success('Da xoa thong bao');
      loadNotifications();
    } catch (error) {
      toast.error('Xoa thong bao that bai');
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => (
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    ));
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-12 w-64 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-48 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Quan ly thong bao</h1>
        <p className="text-gray-500 dark:text-slate-400">Gui thong bao va theo doi lich su gui thong bao</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-slate-100">
          <Bell size={20} /> Tao thong bao
        </h2>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <input
            type="text"
            placeholder="Tieu de"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            required
          />
          <textarea
            placeholder="Noi dung"
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            rows={4}
            required
          />
          <select
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value as NotificationType })}
            className="border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          >
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ERROR">ERROR</option>
          </select>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              <Send size={18} /> Gui toi tat ca
            </button>
            <button
              type="button"
              onClick={() => setShowUserSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              <Users size={18} /> Gui toi user ?? chon
            </button>
          </div>
        </form>
      </div>

      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Chon nguoi dung nhan thong bao</h2>
              <button
                onClick={() => setShowUserSelector(false)}
                className="text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
              >
                Dong
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                  <span className="text-gray-700 dark:text-slate-200">{user.name} ({user.email})</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUserSelector(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl"
              >
                Huy
              </button>
              <button
                onClick={handleSendToSelected}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Xac nhan gui
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/70 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Nguoi nhan</th>
                <th className="px-6 py-3 text-left">Tieu de</th>
                <th className="px-6 py-3 text-left">Loai</th>
                <th className="px-6 py-3 text-center">Da doc</th>
                <th className="px-6 py-3 text-left">Thoi gian</th>
                <th className="px-6 py-3 text-left">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {notifications.map((notification) => {
                const config = TYPE_CONFIG[notification.type as NotificationType] || TYPE_CONFIG.INFO;
                const TypeIcon = config.icon;

                return (
                  <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200">{notification.id}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200">{notification.user?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200">{notification.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${config.badge}`}>
                        <TypeIcon size={12} />
                        {notification.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {notification.isRead ? (
                        <MailOpen size={16} className="text-emerald-600 dark:text-emerald-400" title="Da doc" />
                      ) : (
                        <Mail size={16} className="text-amber-600 dark:text-amber-400" title="Chua doc" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{formatAdminDateTime(notification.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 dark:text-red-400"
                        title="Xoa thong bao"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 disabled:opacity-50"
        >
          Truoc
        </button>
        <span className="text-gray-600 dark:text-slate-400">
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default AdminNotificationsV2;
