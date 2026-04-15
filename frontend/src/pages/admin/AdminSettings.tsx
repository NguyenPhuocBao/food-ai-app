import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Database,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  getSettingsRows,
  removeSetting,
  saveSetting,
  saveSettingRowsBatch,
  type SystemSettingRow,
} from '../../services/settings-admin.service';

const PROTECTED_PREFIXES = ['active_user:', 'hydration:', 'routine:', 'shopping_list:', 'meal_reminder:'];

type SortMode = 'updated_desc' | 'updated_asc' | 'key_asc' | 'key_desc' | 'group_asc';

type ImportRow = {
  key: string;
  value: string;
  group?: string;
};

const isProtectedSetting = (key: string) => PROTECTED_PREFIXES.some((prefix) => key.startsWith(prefix));

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
};

const parseImportRows = (raw: string, fallbackGroup: string): ImportRow[] => {
  const parsed = JSON.parse(raw);

  const normalizeValue = (value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value));

  if (Array.isArray(parsed)) {
    return parsed
      .map((item: any) => ({
        key: String(item?.key || '').trim(),
        value: normalizeValue(item?.value),
        group: typeof item?.group === 'string' && item.group.trim() ? item.group.trim() : fallbackGroup,
      }))
      .filter((row) => row.key && row.value !== undefined);
  }

  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).rows)) {
    return (parsed as any).rows
      .map((item: any) => ({
        key: String(item?.key || '').trim(),
        value: normalizeValue(item?.value),
        group: typeof item?.group === 'string' && item.group.trim() ? item.group.trim() : fallbackGroup,
      }))
      .filter((row: ImportRow) => row.key && row.value !== undefined);
  }

  if (parsed && typeof parsed === 'object') {
    return Object.entries(parsed).map(([key, value]) => ({
      key: key.trim(),
      value: normalizeValue(value),
      group: fallbackGroup,
    }));
  }

  return [];
};

const AdminSettings = () => {
  const [rows, setRows] = useState<SystemSettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('updated_desc');
  const [prefixFilter, setPrefixFilter] = useState('');

  const [draftValueByKey, setDraftValueByKey] = useState<Record<string, string>>({});
  const [draftGroupByKey, setDraftGroupByKey] = useState<Record<string, string>>({});

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newGroup, setNewGroup] = useState('general');

  const [importText, setImportText] = useState('');
  const [importGroup, setImportGroup] = useState('general');
  const [includeProtectedInBulkDelete, setIncludeProtectedInBulkDelete] = useState(false);

  const loadRows = async () => {
    setLoading(true);
    try {
      const data = await getSettingsRows();
      setRows(data);
      setDraftValueByKey(Object.fromEntries(data.map((row) => [row.key, row.value])));
      setDraftGroupByKey(Object.fromEntries(data.map((row) => [row.key, row.group])));
    } catch {
      toast.error('Khong tai duoc danh sach settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, []);

  const groups = useMemo(() => {
    const uniqueGroups = Array.from(new Set(rows.map((row) => row.group))).sort();
    return ['all', ...uniqueGroups];
  }, [rows]);

  const groupStats = useMemo(() => {
    const stats: Record<string, number> = {};
    rows.forEach((row) => {
      stats[row.group] = (stats[row.group] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const prefix = prefixFilter.trim().toLowerCase();

    const base = rows.filter((row) => {
      if (groupFilter !== 'all' && row.group !== groupFilter) return false;
      if (prefix && !row.key.toLowerCase().startsWith(prefix)) return false;
      if (!keyword) return true;
      return row.key.toLowerCase().includes(keyword) || row.value.toLowerCase().includes(keyword);
    });

    return [...base].sort((a, b) => {
      if (sortMode === 'updated_desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortMode === 'updated_asc') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortMode === 'key_desc') return b.key.localeCompare(a.key);
      if (sortMode === 'group_asc') {
        const groupDiff = a.group.localeCompare(b.group);
        if (groupDiff !== 0) return groupDiff;
        return a.key.localeCompare(b.key);
      }
      return a.key.localeCompare(b.key);
    });
  }, [rows, query, groupFilter, sortMode, prefixFilter]);

  const changedCount = useMemo(
    () =>
      rows.filter(
        (row) => row.value !== (draftValueByKey[row.key] ?? '') || row.group !== (draftGroupByKey[row.key] ?? row.group),
      ).length,
    [rows, draftValueByKey, draftGroupByKey],
  );

  const protectedCount = useMemo(() => rows.filter((row) => isProtectedSetting(row.key)).length, [rows]);

  const onSaveRow = async (key: string) => {
    const value = draftValueByKey[key] ?? '';
    const group = (draftGroupByKey[key] || 'general').trim() || 'general';

    setSavingKey(key);
    try {
      await saveSetting(key, value, group);
      setRows((prev) =>
        prev.map((row) =>
          row.key === key
            ? {
                ...row,
                value,
                group,
                updatedAt: new Date().toISOString(),
              }
            : row,
        ),
      );
      toast.success(`Da luu row: ${key}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Luu row that bai');
    } finally {
      setSavingKey(null);
    }
  };

  const onDeleteRow = async (key: string) => {
    const protectedKey = isProtectedSetting(key);
    const message = protectedKey
      ? `Row ${key} la runtime key. Ban chac chan muon xoa?`
      : `Xoa row ${key}?`;
    if (!window.confirm(message)) return;

    setDeletingKey(key);
    try {
      await removeSetting(key);
      setRows((prev) => prev.filter((row) => row.key !== key));
      setDraftValueByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setDraftGroupByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success(`Da xoa row: ${key}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Xoa row that bai');
    } finally {
      setDeletingKey(null);
    }
  };

  const onBulkDeleteFiltered = async () => {
    const targets = filteredRows.filter((row) => includeProtectedInBulkDelete || !isProtectedSetting(row.key));
    if (targets.length === 0) {
      toast('Khong co row hop le de xoa');
      return;
    }

    if (!window.confirm(`Xoa ${targets.length} rows theo filter hien tai?`)) return;

    setBulkDeleting(true);
    let deleted = 0;
    try {
      for (const row of targets) {
        await removeSetting(row.key);
        deleted += 1;
      }
      toast.success(`Da xoa ${deleted} rows`);
      await loadRows();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || `Da xoa ${deleted} rows, sau do gap loi`);
      await loadRows();
    } finally {
      setBulkDeleting(false);
    }
  };

  const onCreateSetting = async () => {
    const key = newKey.trim();
    if (!key) {
      toast.error('Nhap key');
      return;
    }

    try {
      const group = newGroup.trim() || 'general';
      const value = newValue;
      await saveSetting(key, value, group);

      const nowIso = new Date().toISOString();
      const existing = rows.find((row) => row.key === key);
      const newRow: SystemSettingRow = {
        id: existing?.id,
        key,
        value,
        group,
        createdAt: existing?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      setRows((prev) => [newRow, ...prev.filter((row) => row.key !== key)]);
      setDraftValueByKey((prev) => ({ ...prev, [key]: value }));
      setDraftGroupByKey((prev) => ({ ...prev, [key]: group }));
      setNewKey('');
      setNewValue('');
      setNewGroup('general');
      toast.success(`Da upsert key: ${key}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Khong tao duoc row');
    }
  };

  const onExportFiltered = () => {
    const payload = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `system-settings-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onImportRows = async () => {
    if (!importText.trim()) {
      toast.error('Nhap JSON import');
      return;
    }

    setImporting(true);
    try {
      const rowsToImport = parseImportRows(importText, importGroup.trim() || 'general');
      if (rowsToImport.length === 0) {
        toast.error('JSON khong hop le hoac khong co rows');
        return;
      }

      await saveSettingRowsBatch(rowsToImport, importGroup.trim() || 'general');
      toast.success(`Da import ${rowsToImport.length} rows`);
      setImportText('');
      await loadRows();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Import that bai');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Dang tai settings table...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 text-white p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">System Settings Table</p>
            <h1 className="text-3xl font-black mt-2">Settings DB</h1>
            <p className="text-cyan-100 mt-2">
              Quan tri truc tiep du lieu trong bang system_settings: loc, sap xep, import/export JSON, cap nhat row-level va xoa theo filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadRows()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/20"
          >
            <RefreshCw size={16} />
            Reload Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-gray-500">Total rows</div>
          <div className="text-2xl font-black text-gray-900 dark:text-slate-100">{rows.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-gray-500">Filtered rows</div>
          <div className="text-2xl font-black text-gray-900 dark:text-slate-100">{filteredRows.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-gray-500">Changed rows</div>
          <div className="text-2xl font-black text-gray-900 dark:text-slate-100">{changedCount}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-gray-500">Protected rows</div>
          <div className="text-2xl font-black text-gray-900 dark:text-slate-100">{protectedCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Row Upsert</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="key"
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
            />
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="group"
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={onCreateSetting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2"
            >
              <Plus size={16} />
              Upsert Row
            </button>
          </div>
          <textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            rows={3}
            placeholder="value"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-mono"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Database size={18} className="text-cyan-500" />
            Group Distribution
          </h2>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {groupStats.map(([group, count]) => (
              <div key={group} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-gray-600 dark:text-slate-300">{group}</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Data Operations (JSON)</h2>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportFiltered}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              >
                <Download size={16} />
                Export filtered rows
              </button>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
              placeholder='Paste JSON: [{"key":"...","value":"...","group":"..."}] or {"key":"value"}'
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-mono"
            />
            <div className="flex gap-2">
              <input
                value={importGroup}
                onChange={(e) => setImportGroup(e.target.value)}
                placeholder="default group"
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void onImportRows()}
                disabled={importing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              >
                <Upload size={16} />
                {importing ? 'Importing...' : 'Import + Upsert'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-slate-300">
              Tips:
              <div className="text-xs mt-1">1. JSON object se duoc map thanh key-value.</div>
              <div className="text-xs">2. JSON array rows se giu duoc group theo tung row.</div>
              <div className="text-xs">3. Import la upsert, khong xoa row cu.</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-300">
              Runtime keys co prefix {PROTECTED_PREFIXES.join(', ')}. Can can nhac truoc khi xoa hoac thay doi.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by key/value"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm"
            />
          </div>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <input
            value={prefixFilter}
            onChange={(e) => setPrefixFilter(e.target.value)}
            placeholder="Key prefix (vd: hydration:)"
            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
          />

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
          >
            <option value="updated_desc">Sort: updated desc</option>
            <option value="updated_asc">Sort: updated asc</option>
            <option value="key_asc">Sort: key asc</option>
            <option value="key_desc">Sort: key desc</option>
            <option value="group_asc">Sort: group asc</option>
          </select>

          <button
            type="button"
            onClick={() => void onBulkDeleteFiltered()}
            disabled={bulkDeleting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            <Trash2 size={15} />
            {bulkDeleting ? 'Deleting...' : 'Delete filtered'}
          </button>

          <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={includeProtectedInBulkDelete}
              onChange={(e) => setIncludeProtectedInBulkDelete(e.target.checked)}
            />
            include protected rows
          </label>

          <div className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Filter size={12} />
            {filteredRows.length} rows
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-left text-gray-500">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Key</th>
                <th className="py-2 pr-3">Group</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Updated</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const key = row.key;
                const protectedKey = isProtectedSetting(key);
                return (
                  <tr key={key} className="border-b border-gray-100 dark:border-slate-800 align-top">
                    <td className="py-3 pr-3 text-xs text-gray-500">{row.id ?? '-'}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-gray-800 dark:text-slate-200">{key}</td>
                    <td className="py-3 pr-3">
                      <input
                        value={draftGroupByKey[key] ?? row.group}
                        onChange={(e) => setDraftGroupByKey((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-36 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <textarea
                        value={draftValueByKey[key] ?? row.value}
                        onChange={(e) => setDraftValueByKey((prev) => ({ ...prev, [key]: e.target.value }))}
                        rows={2}
                        className="w-[360px] max-w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                      />
                    </td>
                    <td className="py-3 pr-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="py-3 pr-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void onSaveRow(key)}
                          disabled={savingKey === key}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-xs"
                        >
                          <Save size={12} />
                          {savingKey === key ? 'Saving' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDeleteRow(key)}
                          disabled={deletingKey === key}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs"
                          title={protectedKey ? 'Runtime key - can nhac truoc khi xoa' : 'Delete key'}
                        >
                          <Trash2 size={12} />
                          {deletingKey === key ? 'Deleting' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
