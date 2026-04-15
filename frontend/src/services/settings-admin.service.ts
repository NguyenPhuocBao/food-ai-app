import api from './api';

export interface SystemSettingRow {
  id?: number;
  key: string;
  value: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export type SystemSettingsMap = Record<string, string>;

export const getSettingsMap = async (): Promise<SystemSettingsMap> => {
  const response = await api.get('/admin/settings');
  return response.data.data || {};
};

export const getSettingsRows = async (group?: string): Promise<SystemSettingRow[]> => {
  try {
    const url = group ? `/admin/settings/rows?group=${encodeURIComponent(group)}` : '/admin/settings/rows';
    const response = await api.get(url);
    return response.data.data || [];
  } catch {
    // Backward-compatible fallback when backend has not exposed /rows yet.
    const mapResponse = await api.get('/admin/settings');
    const settingsMap: Record<string, string> = mapResponse.data.data || {};
    const nowIso = new Date().toISOString();
    const rows = Object.entries(settingsMap).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      group: 'general',
      createdAt: nowIso,
      updatedAt: nowIso,
    }));
    if (!group) return rows;
    return rows.filter((row) => row.group === group);
  }
};

export const saveSettingsBatch = async (updates: Record<string, string>, group?: string) => {
  const payload = group ? { updates, group } : { updates };
  const response = await api.post('/admin/settings/batch', payload);
  return response.data;
};

export const saveSettingRowsBatch = async (rows: Array<{ key: string; value: string; group?: string }>, group?: string) => {
  const payload = group ? { rows, group } : { rows };
  const response = await api.post('/admin/settings/batch', payload);
  return response.data;
};

export const saveSetting = async (key: string, value: string, group?: string) => {
  const response = await api.put(`/admin/settings/${encodeURIComponent(key)}`, { value, group });
  return response.data.data;
};

export const removeSetting = async (key: string) => {
  const response = await api.delete(`/admin/settings/${encodeURIComponent(key)}`);
  return response.data;
};
