import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/admin.service';
import { Filter, X } from 'lucide-react';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDateTime } from '../../utils/adminDateTime';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs(page, 30, actionFilter, entityFilter);
      setLogs(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  useEffect(() => { loadLogs(); }, [page, actionFilter, entityFilter]);

  if (loading && page===1) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  if (!loading && logs.length === 0) {
    return <EmptyState icon={Filter} title="Không có nhật ký" description="Chưa có hoạt động nào được ghi lại." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Nhật ký hệ thống</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi mọi hoạt động trong hệ thống</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800">
            <option value="">Tất cả hành động</option>
            <option value="LOGIN">Đăng nhập</option><option value="REGISTER">Đăng ký</option><option value="UPDATE_ROLE">Cập nhật vai trò</option>
            <option value="DELETE_USER">Xóa user</option><option value="CREATE_FOOD">Thêm món ăn</option><option value="UPDATE_FOOD">Sửa món ăn</option>
            <option value="DELETE_FOOD">Xóa món ăn</option><option value="RESET_PASSWORD">Đặt lại mật khẩu</option><option value="TOGGLE_BAN">Khóa/Mở khóa</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800">
            <option value="">Tất cả đối tượng</option>
            <option value="User">Người dùng</option><option value="FoodItem">Món ăn</option><option value="UserProfile">Hồ sơ</option>
          </select>
        </div>
        <button onClick={() => { setActionFilter(''); setEntityFilter(''); setPage(1); }} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <X size={16} /> Xóa bộ lọc
        </button>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr><th className="px-6 py-4 text-left">Thời gian</th><th className="px-6 py-4 text-left">Người dùng</th><th className="px-6 py-4 text-left">Hành động</th><th className="px-6 py-4 text-left">Đối tượng</th><th className="px-6 py-4 text-left">Chi tiết</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{formatAdminDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{log.user?.name || 'Hệ thống'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700">{log.action}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{log.entity}</td>
                  <td className="px-6 py-4">
                    {log.oldData && <span className="text-yellow-600 dark:text-yellow-400">Cũ: {JSON.stringify(log.oldData).slice(0, 100)}</span>}
                    {log.newData && <span className="text-green-600 dark:text-green-400 ml-2">Mới: {JSON.stringify(log.newData).slice(0, 100)}</span>}
                  </td>
                </tr>
              ))}
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

export default AdminAuditLogs;
