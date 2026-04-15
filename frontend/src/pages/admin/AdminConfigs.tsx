import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Activity, Bot, RefreshCw, Save, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getChatbotHealth, type ChatbotProviderHealth } from '../../services/chatbot-admin.service';
import { getSettingsMap, saveSettingsBatch } from '../../services/settings-admin.service';

const DEFAULT_CONFIGS: Record<string, string> = {
  week_start_day: 'Monday',
  date_format: 'DD/MM/YYYY',
  timezone: 'Asia/Ho_Chi_Minh',
  default_stats_days: '7',
  calorie_warning_threshold: '110',
  bmr_formula: 'Mifflin-St Jeor',
  macro_ratio_protein: '30',
  macro_ratio_fat: '25',
  macro_ratio_carbs: '45',
  ai_recommendation_model: 'gpt-4o-mini',
  ai_temperature: '0.6',
  ai_max_suggestions: '4',
  ai_min_confidence: '0.7',
  ai_system_prompt: 'Ban la AI health coach chuyen ve dinh duong. Tra loi ngan gon, de ap dung va an toan.',
  max_meals_per_day: '20',
  max_scans_per_day_free: '10',
  max_scans_per_day_premium: '50',
  chat_history_retention_days: '90',
  auto_approve_reviews: 'false',
  banned_keywords: 'spam, scam',
  enable_meal_plan_ai: 'true',
};

const AI_PRESETS: Record<string, Partial<Record<string, string>>> = {
  conservative: {
    ai_temperature: '0.3',
    ai_max_suggestions: '3',
    ai_min_confidence: '0.8',
  },
  balanced: {
    ai_temperature: '0.6',
    ai_max_suggestions: '4',
    ai_min_confidence: '0.7',
  },
  creative: {
    ai_temperature: '0.9',
    ai_max_suggestions: '6',
    ai_min_confidence: '0.6',
  },
};

const boolFromString = (value: string | undefined) => value === 'true';

type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean';
  options?: string[];
  hint?: string;
};

const NUTRITION_FIELDS: FieldDef[] = [
  { key: 'week_start_day', label: 'Ngay bat dau tuan', type: 'select', options: ['Monday', 'Sunday'] },
  { key: 'date_format', label: 'Dinh dang ngay', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
  { key: 'timezone', label: 'Mui gio', type: 'text' },
  { key: 'default_stats_days', label: 'So ngay thong ke mac dinh', type: 'number' },
  { key: 'calorie_warning_threshold', label: 'Nguong canh bao calorie (%)', type: 'number' },
  { key: 'bmr_formula', label: 'Cong thuc BMR', type: 'select', options: ['Mifflin-St Jeor', 'Harris-Benedict'] },
  { key: 'macro_ratio_protein', label: 'Ti le protein (%)', type: 'number' },
  { key: 'macro_ratio_fat', label: 'Ti le fat (%)', type: 'number' },
  { key: 'macro_ratio_carbs', label: 'Ti le carbs (%)', type: 'number' },
];

const AI_FIELDS: FieldDef[] = [
  { key: 'ai_recommendation_model', label: 'Model goi y', type: 'text' },
  { key: 'ai_temperature', label: 'Temperature', type: 'number' },
  { key: 'ai_max_suggestions', label: 'So goi y moi lan', type: 'number' },
  { key: 'ai_min_confidence', label: 'Nguong tu tin toi thieu', type: 'number' },
  { key: 'ai_system_prompt', label: 'System prompt', type: 'textarea' },
  { key: 'enable_meal_plan_ai', label: 'Bat AI meal plan', type: 'boolean' },
];

const POLICY_FIELDS: FieldDef[] = [
  { key: 'max_meals_per_day', label: 'Gioi han so bua an/ngay', type: 'number' },
  { key: 'max_scans_per_day_free', label: 'Gioi han scan free/ngay', type: 'number' },
  { key: 'max_scans_per_day_premium', label: 'Gioi han scan premium/ngay', type: 'number' },
  { key: 'chat_history_retention_days', label: 'So ngay luu lich su chat', type: 'number' },
  { key: 'auto_approve_reviews', label: 'Tu dong duyet review', type: 'boolean' },
  { key: 'banned_keywords', label: 'Tu khoa cam (phan tach boi dau phay)', type: 'textarea' },
];

const AdminConfigs = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [health, setHealth] = useState<ChatbotProviderHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const map = await getSettingsMap();
      const merged = { ...DEFAULT_CONFIGS, ...map };
      setSettings(merged);
      setDraft(merged);
    } catch {
      toast.error('Khong tai duoc config he thong');
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const result = await getChatbotHealth();
      setHealth(result);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadData(), loadHealth()]);
  }, []);

  const changedKeys = useMemo(
    () => Object.keys(draft).filter((key) => String(draft[key] ?? '') !== String(settings[key] ?? '')),
    [draft, settings],
  );

  const onFieldChange = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSaveAll = async () => {
    const updates: Record<string, string> = {};
    changedKeys.forEach((key) => {
      updates[key] = draft[key] ?? '';
    });

    if (Object.keys(updates).length === 0) {
      toast('Khong co thay doi de luu');
      return;
    }

    setSaving(true);
    try {
      await saveSettingsBatch(updates);
      toast.success(`Da luu ${Object.keys(updates).length} config`);
      setSettings((prev) => ({ ...prev, ...updates }));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Luu config that bai');
    } finally {
      setSaving(false);
    }
  };

  const onApplyDefaults = () => {
    setDraft((prev) => ({ ...prev, ...DEFAULT_CONFIGS }));
    toast.success('Da nap bo mac dinh de chinh sua');
  };

  const onApplyAIPreset = (preset: keyof typeof AI_PRESETS) => {
    setDraft((prev) => ({ ...prev, ...AI_PRESETS[preset] }));
    toast.success(`Da ap dung preset AI: ${preset}`);
  };

  const renderField = (field: FieldDef) => {
    const value = draft[field.key] ?? '';

    if (field.type === 'textarea') {
      return (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onFieldChange(field.key, e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onFieldChange(field.key, e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'boolean') {
      return (
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={boolFromString(value)}
            onChange={(e) => onFieldChange(field.key, e.target.checked ? 'true' : 'false')}
          />
          {boolFromString(value) ? 'Enabled' : 'Disabled'}
        </label>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onFieldChange(field.key, e.target.value)}
        className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
      />
    );
  };

  const Section = ({ title, fields }: { title: string; fields: FieldDef[] }) => (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <div className="text-sm font-medium text-gray-700 dark:text-slate-300">{field.label}</div>
          {renderField(field)}
          {field.hint ? <div className="text-xs text-gray-500">{field.hint}</div> : null}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Dang tai config...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-200">Config Center</p>
            <h1 className="text-3xl font-black mt-2">Cau hinh van hanh</h1>
            <p className="text-blue-100 mt-2 max-w-3xl">
              Chinh cac config quan trong cho thong ke, AI recommendation va gioi han he thong. Luu theo batch de tranh sai sot.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void Promise.all([loadData(), loadHealth()])}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/20"
            >
              <RefreshCw size={16} className={healthLoading ? 'animate-spin' : ''} />
              Reload
            </button>
            <button
              type="button"
              onClick={onSaveAll}
              disabled={saving || changedKeys.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
            >
              <Save size={16} className={saving ? 'animate-spin' : ''} />
              Luu {changedKeys.length > 0 ? `(${changedKeys.length})` : ''}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Bot size={18} className="text-indigo-500" />
            Chatbot runtime status
          </h2>
          <div className="text-sm text-gray-600 dark:text-slate-300">
            Provider mode: <span className="font-semibold">{health?.providerMode || 'unknown'}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300">
            Provider chain: {health?.providerChain?.join(' -> ') || 'unknown'}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300">
            Training examples: {health?.training?.totalExamples ?? '--'} (source: {health?.training?.source || '--'})
          </div>
          <Link
            to="/admin/chatbot-ops"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            <Activity size={16} />
            Mo Chatbot Ops
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Preset nhanh
          </h2>
          <button type="button" onClick={onApplyDefaults} className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-left text-sm">
            Ap dung bo config mac dinh de tham khao
          </button>
          <button type="button" onClick={() => onApplyAIPreset('conservative')} className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-left text-sm">
            AI preset: conservative
          </button>
          <button type="button" onClick={() => onApplyAIPreset('balanced')} className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-left text-sm">
            AI preset: balanced
          </button>
          <button type="button" onClick={() => onApplyAIPreset('creative')} className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-left text-sm">
            AI preset: creative
          </button>
          <div className="text-xs text-gray-500">
            Preset chi thay doi du lieu nhap tren form. Bam "Luu" de ghi vao DB.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Section title="Thong ke & Dinh duong" fields={NUTRITION_FIELDS} />
        <Section title="AI Recommendation" fields={AI_FIELDS} />
        <Section title="Policy & Limits" fields={POLICY_FIELDS} />
      </div>

      <div className="inline-flex items-center gap-2 text-sm text-gray-500">
        <SlidersHorizontal size={16} />
        Config hien co trong DB: {Object.keys(settings).length} keys
      </div>
    </div>
  );
};

export default AdminConfigs;
