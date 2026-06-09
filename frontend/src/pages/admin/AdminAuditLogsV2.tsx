import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Loader2, Search, X } from 'lucide-react';
import { getAuditLogs } from '../../services/admin.service';
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

const toPreview = (value: unknown, max = 140) => {
  if (!value) return '-';
  try {
    const text = JSON.stringify(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
  } catch {
    const text = String(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
  }
};

const toPrettyJson = (value: unknown) => {
  if (!value) return '-';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const AdminAuditLogsV2 = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const requestIdRef = useRef(0);

  const loadLogs = async () => {
    setFetching(true);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    try {
      const response = await getAuditLogs(page, 30, actionFilter, entityFilter, debouncedSearchKeyword);
      if (requestId !== requestIdRef.current) return;
      setLogs(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      if (requestId === requestIdRef.current) {
        setFetching(false);
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword.trim());
      setPage(1);
    }, 120);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    void loadLogs();
  }, [page, actionFilter, entityFilter, debouncedSearchKeyword]);

  const normalizedSearch = searchKeyword.trim().toLowerCase();
  const displayLogs = useMemo(() => {
    if (!normalizedSearch) return logs;
    return logs.filter((log) => {
      const text = [
        log?.action,
        log?.entity,
        log?.user?.name,
        log?.user?.email,
        log?.ipAddress,
        log?.userAgent,
        log?.entityId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return text.includes(normalizedSearch);
    });
  }, [logs, normalizedSearch]);

  if (initialLoading && page === 1) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-56 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-12 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Audit Logs
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Theo doi hanh dong quan tri va thay doi du lieu tren he thong.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={searchKeyword}
            onChange={(event) => {
              setSearchKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Tim user, email, action, entity, IP..."
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-900 dark:text-slate-100 min-w-[280px]"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value);
              setPage(1);
            }}
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
            onChange={(event) => {
              setEntityFilter(event.target.value);
              setPage(1);
            }}
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
            setSearchKeyword('');
            setDebouncedSearchKeyword('');
            setPage(1);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-2xl hover:bg-gray-300 dark:hover:bg-slate-600 transition text-gray-700 dark:text-slate-200"
        >
          <X size={16} /> Xoa bo loc
        </button>

        {fetching && (
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Dang tim...
          </div>
        )}
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
              {displayLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Khong t?m th?y du lieu phu hop voi bo loc hien tai.
                  </td>
                </tr>
              ) : (
                displayLogs.map((log) => (
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
                      <details className="rounded-xl bg-amber-50/60 p-2 dark:bg-amber-900/20">
                        <summary className="cursor-pointer text-amber-700 dark:text-amber-300">
                          Old: {toPreview(log.oldData, 180)}
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-amber-900 dark:text-amber-200">
                          {toPrettyJson(log.oldData)}
                        </pre>
                      </details>
                      <details className="rounded-xl bg-emerald-50/60 p-2 dark:bg-emerald-900/20">
                        <summary className="cursor-pointer text-emerald-700 dark:text-emerald-300">
                          New: {toPreview(log.newData, 180)}
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-emerald-900 dark:text-emerald-200">
                          {toPrettyJson(log.newData)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))
              )}
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
