import api from './api';

export type DbTableSummary = {
  name: string;
  rowEstimate: number;
};

export type DbTableColumn = {
  columnName: string;
  dataType: string;
  udtName: string;
  isNullable: boolean;
  columnDefault: string | null;
  ordinal: number;
  isIdentity: boolean;
  isPrimaryKey: boolean;
};

export type DbTableRowsResponse = {
  table: string;
  rowEstimate: number;
  columns: DbTableColumn[];
  hasSinglePrimaryKey: boolean;
  primaryKeyColumn: string | null;
  rows: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DbQueryResult = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  limit: number;
  durationMs: number;
};

export const getDbTables = async () => {
  const response = await api.get('/admin/db/tables');
  return (response.data.data || []) as DbTableSummary[];
};

export const getDbTableSchema = async (table: string) => {
  const response = await api.get(`/admin/db/tables/${encodeURIComponent(table)}/schema`);
  return response.data.data as {
    table: string;
    rowEstimate: number;
    columns: DbTableColumn[];
    hasSinglePrimaryKey: boolean;
    primaryKeyColumn: string | null;
  };
};

export const getDbTableRows = async (params: {
  table: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const query = new URLSearchParams();
  query.set('page', String(params.page || 1));
  query.set('limit', String(params.limit || 30));
  if (params.search) query.set('search', params.search);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const response = await api.get(
    `/admin/db/tables/${encodeURIComponent(params.table)}/rows?${query.toString()}`,
  );
  return response.data.data as DbTableRowsResponse;
};

export const createDbRow = async (table: string, values: Record<string, unknown>) => {
  const response = await api.post(`/admin/db/tables/${encodeURIComponent(table)}/rows`, { values });
  return response.data.data as Record<string, unknown>;
};

export const updateDbRow = async (
  table: string,
  rowId: string,
  values: Record<string, unknown>,
) => {
  const response = await api.put(
    `/admin/db/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(rowId)}`,
    { values },
  );
  return response.data.data as Record<string, unknown>;
};

export const deleteDbRow = async (table: string, rowId: string) => {
  const response = await api.delete(
    `/admin/db/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(rowId)}`,
  );
  return response.data.data as Record<string, unknown>;
};

export const executeDbQuery = async (query: string, limit = 100) => {
  const response = await api.post('/admin/db/query', { query, limit });
  return response.data.data as DbQueryResult;
};
