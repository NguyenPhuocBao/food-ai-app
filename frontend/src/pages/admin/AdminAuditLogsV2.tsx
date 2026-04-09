import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { getAuditLogs } from '../../services/admin.service';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDateTime } from '../../utils/adminDateTime';

const ACTION_OPTIONS = [
  'LOGIN',
  'REGISTER',
  'UPDATE_ROLE',
  'DELETE_USER',
  'CREATE_FOOD',
  'UPDATE_FOOD',
  'DELETE_FOOD',
  'RESET_PASSWORD',
  'TOGGLE_BAN',
];

const ENTITY_OPTIONS = ['User', 'FoodItem', 'UserProfile', 'Notification', 'Recipe', 'MealPlan'];

const toPreview = (value: unknown) => {
  if (!value) return '-';
  try {
    return JSON.stringify(value).slice(0, 140);
  } catch {
    return String(value).slice(0, 140);
  }
};

const AdminAuditLogsV2 = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await getAuditLogs(page, 30, actionFilter, entityFilter);
      setLogs(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, entityFilter]);

  if (loading && page === 1) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-56 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-12 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  if (!loading && logs.length === 0) {
    return (
      <EmptyState
        icon={Filter}
        title="Khong co audit log"
        description="Chua co du lieu phu hop voi bo loc hien tai."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Audit Logs
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Theo doi hanh dong quan tri va thay doi du lieu tren he thong.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Tat ca hanh dong</option>
            {ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={entityFilter}
            onChange={(event) => setEntityFilter(event.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Tat ca doi tuong</option>
            {ENTITY_OPTIONS.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setActionFilter('');
            setEntityFilter('');
            setPage(1);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-2xl hover:bg-gray-300 dark:hover:bg-slate-600 transition text-gray-700 dark:text-slate-200"
        >
          <X size={16} /> Xoa bo loc
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/70 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 text-left">Thoi gian</th>
                <th className="px-6 py-4 text-left">Nguoi dung</th>
                <th className="px-6 py-4 text-left">Hanh dong</th>
                <th className="px-6 py-4 text-left">Doi tuong</th>
                <th className="px-6 py-4 text-left">Chi tiet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">
                    {formatAdminDateTime(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-200">
                    {log.user?.name || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">{log.entity}</td>
                  <td className="px-6 py-4 text-sm space-y-1">
                    <p className="text-amber-700 dark:text-amber-300">Old: {toPreview(log.oldData)}</p>
                    <p className="text-emerald-700 dark:text-emerald-300">New: {toPreview(log.newData)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
        >
          Truoc
        </button>
        <span className="text-gray-600 dark:text-slate-400">
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default AdminAuditLogsV2;
