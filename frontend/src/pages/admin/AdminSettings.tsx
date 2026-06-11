import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Database, Plus, RefreshCw, Save, Search, Trash2 } from 'lucide-react';
import {
  createDbRow,
  deleteDbRow,
  executeDbQuery,
  getDbTableRows,
  getDbTableSchema,
  getDbTables,
  updateDbRow,
  type DbQueryResult,
  type DbTableColumn,
  type DbTableRowsResponse,
  type DbTableSummary,
} from '../../services/admin-db.service';
import { useConfirm } from '../../contexts/ConfirmContext';

type SortOrder = 'asc' | 'desc';
type EditorMode = 'create' | 'edit' | null;
type SchemaState = {
  table: string;
  rowEstimate: number;
  columns: DbTableColumn[];
  hasSinglePrimaryKey: boolean;
  primaryKeyColumn: string | null;
};

const NUMERIC = new Set(['int2', 'int4', 'int8', 'float4', 'float8', 'numeric']);
const BOOLEAN = new Set(['bool']);
const JSON_TYPES = new Set(['json', 'jsonb']);
const SKIP = Symbol('skip');

const errMsg = (error: unknown, fallback: string) => {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
};

const isAuto = (col: DbTableColumn) => {
  if (col.isIdentity) return true;
  const lower = (col.columnDefault || '').toLowerCase();
  return lower.includes('nextval(') || lower.includes('generated');
};

const asInput = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const asText = (value: unknown) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const parseValue = (raw: string, col: DbTableColumn) => {
  const trimmed = raw.trim();
  if (!trimmed) return col.isNullable ? null : SKIP;

  if (NUMERIC.has(col.udtName)) {
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : trimmed;
  }
  if (BOOLEAN.has(col.udtName)) {
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
  }
  if (JSON_TYPES.has(col.udtName)) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return raw;
};

const AdminSettings = () => {
  const confirm = useConfirm();
  const [tables, setTables] = useState<DbTableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [loadingTables, setLoadingTables] = useState(true);

  const [schema, setSchema] = useState<SchemaState | null>(null);
  const [rowsRes, setRowsRes] = useState<DbTableRowsResponse | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);

  const [rowSearch, setRowSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [sql, setSql] = useState('');
  const [sqlLimit, setSqlLimit] = useState('100');
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlResult, setSqlResult] = useState<DbQueryResult | null>(null);

  const loadTables = async () => {
    setLoadingTables(true);
    try {
      const data = await getDbTables();
      setTables(data);
      if (!selectedTable && data.length > 0) setSelectedTable(data[0].name);
    } catch (error) {
      toast.error(errMsg(error, 'Khong tai duoc danh sach bang'));
    } finally {
      setLoadingTables(false);
    }
  };

  const loadSchema = async (tableName: string) => {
    try {
      const data = await getDbTableSchema(tableName);
      setSchema(data);
      const fallback = data.primaryKeyColumn || data.columns[0]?.columnName || '';
      if (!sortBy || !data.columns.some((c) => c.columnName === sortBy)) setSortBy(fallback);
    } catch (error) {
      setSchema(null);
      toast.error(errMsg(error, 'Khong tai duoc schema bang'));
    }
  };

  const loadRows = async (tableName: string) => {
    setLoadingRows(true);
    try {
      const data = await getDbTableRows({
        table: tableName,
        page,
        limit,
        search: rowSearch.trim() || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
      });
      setRowsRes(data);
    } catch (error) {
      toast.error(errMsg(error, 'Khong tai duoc du lieu bang'));
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    void loadTables();
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    setPage(1);
    setRowSearch('');
    setSortBy('');
    setSortOrder('desc');
    setEditorMode(null);
    setEditingRowId(null);
    setDraft({});
    setBaseline({});
    setSqlResult(null);
    setSql(`SELECT * FROM "public"."${selectedTable}" ORDER BY 1 DESC`);
    void loadSchema(selectedTable);
  }, [selectedTable]);

  useEffect(() => {
    if (!selectedTable) return;
    void loadRows(selectedTable);
  }, [selectedTable, page, limit, rowSearch, sortBy, sortOrder]);

  const filteredTables = useMemo(() => {
    const k = tableSearch.trim().toLowerCase();
    if (!k) return tables;
    return tables.filter((t) => t.name.toLowerCase().includes(k));
  }, [tables, tableSearch]);

  const writableCols = useMemo(() => (schema ? schema.columns.filter((c) => !isAuto(c)) : []), [schema]);
  const editableCols = useMemo(() => {
    if (!schema) return [];
    return writableCols.filter((c) => c.columnName !== schema.primaryKeyColumn);
  }, [schema, writableCols]);

  const editorCols = editorMode === 'edit' ? editableCols : writableCols;

  const openCreate = () => {
    const values = Object.fromEntries(editorCols.map((c) => [c.columnName, '']));
    setEditorMode('create');
    setEditingRowId(null);
    setDraft(values);
    setBaseline({});
  };

  const openEdit = (row: Record<string, unknown>) => {
    if (!schema?.hasSinglePrimaryKey || !schema.primaryKeyColumn) return toast.error('Bang nay khong th? edit an toan');
    const pk = row[schema.primaryKeyColumn];
    if (pk === undefined || pk === null) return toast.error('Khong t?m th?y primary key cua row');

    const values = Object.fromEntries(editableCols.map((c) => [c.columnName, asInput(row[c.columnName])]));
    setEditorMode('edit');
    setEditingRowId(String(pk));
    setDraft(values);
    setBaseline(values);
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};
    for (const col of editorCols) {
      const value = draft[col.columnName] ?? '';
      if (editorMode === 'edit' && value === (baseline[col.columnName] ?? '')) continue;
      const parsed = parseValue(value, col);
      if (parsed === SKIP) continue;
      payload[col.columnName] = parsed;
    }
    return payload;
  };

  const saveEditor = async () => {
    if (!selectedTable || !editorMode) return;
    const payload = buildPayload();
    if (editorMode === 'edit' && Object.keys(payload).length === 0) return toast('Khong c? thay doi de luu');

    setSaving(true);
    try {
      if (editorMode === 'create') {
        await createDbRow(selectedTable, payload);
        toast.success('Da tao row moi');
      } else {
        if (!editingRowId) return toast.error('Thieu row id');
        await updateDbRow(selectedTable, editingRowId, payload);
        toast.success('Da cap nhat row');
      }
      setEditorMode(null);
      setEditingRowId(null);
      await Promise.all([loadSchema(selectedTable), loadRows(selectedTable)]);
    } catch (error) {
      toast.error(errMsg(error, 'Luu row that bai'));
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (row: Record<string, unknown>) => {
    if (!selectedTable || !schema?.hasSinglePrimaryKey || !schema.primaryKeyColumn) return toast.error('Bang nay khong th? xoa an toan');
    const pk = row[schema.primaryKeyColumn];
    if (pk === undefined || pk === null) return toast.error('Khong t?m th?y primary key cua row');
    const confirmed = await confirm({
      title: 'Xóa dữ liệu',
      message: `Xoa row ${schema.primaryKeyColumn}=${pk}?`,
      confirmText: 'Xóa row',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteDbRow(selectedTable, String(pk));
      toast.success('Da xoa row');
      await Promise.all([loadSchema(selectedTable), loadRows(selectedTable)]);
    } catch (error) {
      toast.error(errMsg(error, 'Xoa row that bai'));
    }
  };

  const runQuery = async () => {
    if (!sql.trim()) return toast.error('Nhap query');
    const parsed = Number.parseInt(sqlLimit, 10);
    const lim = Number.isFinite(parsed) ? Math.min(300, Math.max(1, parsed)) : 100;

    setSqlRunning(true);
    try {
      const data = await executeDbQuery(sql, lim);
      setSqlResult(data);
      toast.success(`Query xong: ${data.rowCount} rows`);
    } catch (error) {
      toast.error(errMsg(error, 'Query that bai'));
    } finally {
      setSqlRunning(false);
    }
  };

  const rows = rowsRes?.rows || [];
  const paging = rowsRes?.pagination;

  return (
    <div className="space-y-5 p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Admin Data Explorer</p>
            <h1 className="mt-2 text-3xl font-black">Settings DB</h1>
            <p className="mt-2 text-cyan-100">Xem schema, xem du lieu, CRUD row va chay SELECT query an toan.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadTables();
              if (selectedTable) {
                void loadSchema(selectedTable);
                void loadRows(selectedTable);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2"
          >
            <RefreshCw size={15} />
            Reload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            <Database size={15} className="text-cyan-500" />
            Tables ({tables.length})
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Tim bang"
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {loadingTables && <div className="text-sm text-gray-500">?ang tai danh sach bang...</div>}
            {!loadingTables && filteredTables.length === 0 && <div className="text-sm text-gray-500">Khong c? bang</div>}
            {!loadingTables && filteredTables.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelectedTable(t.name)}
                className={`w-full rounded-xl border px-3 py-2 text-left ${
                  selectedTable === t.name
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                    : 'border-gray-200 text-gray-700 hover:border-cyan-400 dark:border-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="truncate text-sm font-semibold">{t.name}</div>
                <div className="text-[11px] opacity-80">rows ~ {t.rowEstimate.toLocaleString('vi-VN')}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            {selectedTable ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">{selectedTable}</h2>
                    <p className="text-xs text-gray-500">PK: {schema?.primaryKeyColumn || 'Khong c? single primary key'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreate}
                    disabled={writableCols.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white disabled:bg-emerald-300"
                  >
                    <Plus size={14} />
                    New row
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_170px_120px]">
                  <input
                    value={rowSearch}
                    onChange={(e) => {
                      setPage(1);
                      setRowSearch(e.target.value);
                    }}
                    placeholder="Search rows"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <select
                    value={String(limit)}
                    onChange={(e) => {
                      setPage(1);
                      setLimit(Number(e.target.value));
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {[20, 30, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setPage(1);
                      setSortBy(e.target.value);
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Default</option>
                    {(schema?.columns || []).map((c) => <option key={c.columnName} value={c.columnName}>{c.columnName}</option>)}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      setPage(1);
                      setSortOrder(e.target.value as SortOrder);
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="desc">DESC</option>
                    <option value="asc">ASC</option>
                  </select>
                </div>

                <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-slate-700">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        {(schema?.columns || []).map((c) => (
                          <th key={c.columnName} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300">
                            {c.columnName}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingRows && (
                        <tr><td colSpan={(schema?.columns.length || 0) + 1} className="px-3 py-6 text-center text-sm text-gray-500">?ang tai du lieu...</td></tr>
                      )}
                      {!loadingRows && rows.length === 0 && (
                        <tr><td colSpan={(schema?.columns.length || 0) + 1} className="px-3 py-6 text-center text-sm text-gray-500">Khong c? du lieu</td></tr>
                      )}
                      {!loadingRows && rows.map((row, i) => {
                        const key = schema?.primaryKeyColumn ? `${row[schema.primaryKeyColumn] ?? i}` : String(i);
                        return (
                          <tr key={key} className="border-t border-gray-100 align-top dark:border-slate-800">
                            {(schema?.columns || []).map((c) => (
                              <td key={`${key}-${c.columnName}`} className="max-w-[260px] whitespace-pre-wrap px-3 py-2 font-mono text-[11px] text-gray-800 dark:text-slate-200">
                                {asText(row[c.columnName])}
                              </td>
                            ))}
                            <td className="whitespace-nowrap px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => openEdit(row)} disabled={!schema?.hasSinglePrimaryKey} className="rounded-lg border border-blue-200 px-2 py-1 text-[11px] text-blue-700 disabled:opacity-50">Edit</button>
                                <button type="button" onClick={() => { void removeRow(row); }} disabled={!schema?.hasSinglePrimaryKey} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[11px] text-red-700 disabled:opacity-50"><Trash2 size={11} />Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>Page {paging?.page || 1} / {paging?.totalPages || 1} ({paging?.total || 0} rows)</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={(paging?.page || 1) <= 1} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">Prev</button>
                    <button type="button" onClick={() => setPage((p) => Math.min(p + 1, paging?.totalPages || 1))} disabled={(paging?.page || 1) >= (paging?.totalPages || 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">Next</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Chon bang de bat dau.</div>
            )}
          </div>

          {editorMode && (
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{editorMode === 'create' ? 'Create row' : `Edit row ${editingRowId}`}</h3>
                <button type="button" onClick={() => setEditorMode(null)} className="text-sm text-gray-500">Close</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {editorCols.map((c) => (
                  <div key={c.columnName}>
                    <label className="mb-1 block text-xs text-gray-500">{c.columnName} ({c.udtName})</label>
                    <textarea
                      value={draft[c.columnName] ?? ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [c.columnName]: e.target.value }))}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => { void saveEditor(); }} disabled={saving || editorCols.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white disabled:bg-blue-300"><Save size={14} />{saving ? 'Saving...' : 'Save row'}</button>
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">SQL Console</h3>
              <p className="text-xs text-gray-500">Chi cho phep SELECT/WITH/EXPLAIN SELECT.</p>
            </div>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-slate-100"
            />
            <div className="flex items-center gap-3">
              <input value={sqlLimit} onChange={(e) => setSqlLimit(e.target.value)} className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <button type="button" onClick={() => { void runQuery(); }} disabled={sqlRunning} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white disabled:bg-emerald-300"><Save size={14} />{sqlRunning ? 'Running...' : 'Run query'}</button>
            </div>
            {sqlResult && (
              <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800"><tr>{sqlResult.columns.map((c) => <th key={c} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300">{c}</th>)}</tr></thead>
                  <tbody>
                    {sqlResult.rows.map((row, i) => (
                      <tr key={`q-${i}`} className="border-t border-gray-100 dark:border-slate-800">{sqlResult.columns.map((c) => <td key={`q-${i}-${c}`} className="px-3 py-2 font-mono text-[11px] text-gray-800 dark:text-slate-200">{asText(row[c])}</td>)}</tr>
                    ))}
                    {sqlResult.rows.length === 0 && <tr><td colSpan={sqlResult.columns.length || 1} className="px-3 py-6 text-center text-sm text-gray-500">Query khong tra ve du lieu</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
