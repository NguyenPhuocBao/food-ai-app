import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  Brain,
  Database,
  Download,
  FileUp,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  benchmarkChatbotTraining,
  bootstrapChatbotTrainingDefaults,
  getChatbotHealth,
  getChatbotTraining,
  runQuickChatAdmin,
  updateChatbotTraining,
  type ChatbotProviderHealth,
  type ChatbotQuickTestResult,
  type ChatbotTrainingBenchmark,
  type ChatbotTrainingExample,
} from '../../services/chatbot-admin.service';

const DEFAULT_TEST_QUESTION = 'Toi bi tieu duong type 2, bua toi nen an gi?';

const normalizeExamples = (raw: unknown): ChatbotTrainingExample[] => {
  if (!Array.isArray(raw)) return [];

  const dedupe = new Set<string>();
  const normalized: ChatbotTrainingExample[] = [];

  raw.forEach((item, index) => {
    const question = String((item as any)?.question || '').trim();
    const answer = String((item as any)?.answer || '').trim();
    if (!question || !answer) return;

    const tags = Array.isArray((item as any)?.tags)
      ? (item as any).tags.map((tag: unknown) => String(tag || '').trim()).filter(Boolean).slice(0, 8)
      : [];

    const dedupeKey = `${question.toLowerCase()}||${answer.toLowerCase()}`;
    if (dedupe.has(dedupeKey)) return;
    dedupe.add(dedupeKey);

    const id = String((item as any)?.id || `ex-${index + 1}`);
    normalized.push({ id, question, answer, tags });
  });

  return normalized;
};

const parseTrainingJson = (raw: string) => {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return normalizeExamples(parsed);
  if (Array.isArray((parsed as any)?.examples)) return normalizeExamples((parsed as any).examples);
  return [] as ChatbotTrainingExample[];
};

const AdminChatbotOps = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [health, setHealth] = useState<ChatbotProviderHealth | null>(null);
  const [trainingExamples, setTrainingExamples] = useState<ChatbotTrainingExample[]>([]);
  const [trainingSource, setTrainingSource] = useState<'custom' | 'default'>('default');
  const [benchmark, setBenchmark] = useState<ChatbotTrainingBenchmark | null>(null);
  const [quickQuestion, setQuickQuestion] = useState(DEFAULT_TEST_QUESTION);
  const [quickResult, setQuickResult] = useState<ChatbotQuickTestResult | null>(null);
  const [jsonEditor, setJsonEditor] = useState('[]');

  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [savingTraining, setSavingTraining] = useState(false);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [runningQuickTest, setRunningQuickTest] = useState(false);

  const loadHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await getChatbotHealth();
      setHealth(data);
    } catch {
      toast.error('Khong tai duoc chat health');
    } finally {
      setLoadingHealth(false);
    }
  };

  const loadTraining = async () => {
    setLoadingTraining(true);
    try {
      const data = await getChatbotTraining();
      setTrainingExamples(data.examples);
      setTrainingSource(data.source);
      setJsonEditor(JSON.stringify(data.examples, null, 2));
    } catch {
      toast.error('Khong tai duoc du lieu training');
    } finally {
      setLoadingTraining(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadHealth(), loadTraining()]);
  }, []);

  const providerCards = useMemo(() => {
    if (!health) return [];
    return [
      {
        name: 'Retrieval',
        configured: health.providers.retrieval.enabled,
        detail: health.providers.retrieval.active ? 'Dang active' : 'Dung lam fallback',
      },
      {
        name: 'Grok',
        configured: health.providers.grok.configured,
        detail: health.providers.grok.model,
      },
      {
        name: 'Gemini',
        configured: health.providers.gemini.configured,
        detail: health.providers.gemini.model,
      },
      {
        name: 'OpenAI',
        configured: health.providers.openai.configured,
        detail: health.providers.openai.model,
      },
    ];
  }, [health]);

  const handleBootstrapDefaults = async () => {
    if (!window.confirm('Ghi de training hien tai bang bo default?')) return;
    try {
      await bootstrapChatbotTrainingDefaults();
      toast.success('Da bootstrap default training');
      await Promise.all([loadHealth(), loadTraining()]);
    } catch {
      toast.error('Bootstrap training that bai');
    }
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      const data = await benchmarkChatbotTraining(160);
      setBenchmark(data);
      toast.success('Da benchmark training');
    } catch {
      toast.error('Benchmark that bai');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleSaveEditor = async () => {
    setSavingTraining(true);
    try {
      const examples = parseTrainingJson(jsonEditor);
      if (examples.length === 0) {
        toast.error('JSON khong hop le hoac khong co QA');
        return;
      }

      await updateChatbotTraining(examples);
      toast.success(`Da luu ${examples.length} QA`);
      await Promise.all([loadHealth(), loadTraining()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Khong luu duoc training');
    } finally {
      setSavingTraining(false);
    }
  };

  const handleExportTraining = () => {
    const payload = JSON.stringify(trainingExamples, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `chatbot-training-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsedExamples = parseTrainingJson(text);
      if (parsedExamples.length === 0) {
        toast.error('File JSON khong dung format QA');
        return;
      }
      setJsonEditor(JSON.stringify(parsedExamples, null, 2));
      toast.success(`Da nap file: ${parsedExamples.length} QA`);
    } catch {
      toast.error('Khong doc duoc file JSON');
    }
  };

  const handleQuickTest = async () => {
    const question = quickQuestion.trim();
    if (!question) {
      toast.error('Nhap cau hoi de test');
      return;
    }

    setRunningQuickTest(true);
    try {
      const data = await runQuickChatAdmin(question);
      setQuickResult(data);
      toast.success('Da test quick chat');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Quick test that bai');
    } finally {
      setRunningQuickTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="uppercase tracking-[0.2em] text-blue-200 text-xs font-bold">Chatbot Ops</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">Dieu hanh va train chatbot</h1>
            <p className="text-blue-100/90 mt-3 max-w-2xl">
              Quan ly provider, bo train, benchmark retrieval va test chat nhanh ngay tren admin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void Promise.all([loadHealth(), loadTraining()])}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/15 hover:bg-white/20 border border-white/20 text-sm font-semibold"
          >
            <RefreshCw size={16} className={loadingHealth || loadingTraining ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Provider mode</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-slate-100">{health?.providerMode || '--'}</p>
          <p className="text-xs text-gray-500 mt-1">{health?.providerChain?.join(' -> ') || '...'}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Training source</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-slate-100">{trainingSource}</p>
          <p className="text-xs text-gray-500 mt-1">{trainingExamples.length} QA</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Top-1 benchmark</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-slate-100">
            {benchmark ? `${benchmark.metrics.top1Rate}%` : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sample: {benchmark?.sampleSize || '--'}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Answer similarity</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-slate-100">
            {benchmark ? `${benchmark.metrics.avgAnswerSimilarity}%` : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Top-3: {benchmark ? `${benchmark.metrics.top3Rate}%` : '--'}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-6">
        <div className="rounded-3xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            Provider health
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {providerCards.map((provider) => (
              <div
                key={provider.name}
                className={`rounded-2xl border p-4 ${
                  provider.configured
                    ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/60'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-slate-100">{provider.name}</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-slate-400">{provider.detail}</p>
                <p className={`text-xs mt-2 font-bold ${provider.configured ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {provider.configured ? 'Configured' : 'Not configured'}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleRunBenchmark()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              disabled={runningBenchmark}
            >
              <Activity size={16} className={runningBenchmark ? 'animate-spin' : ''} />
              Benchmark
            </button>
            <button
              type="button"
              onClick={() => void handleBootstrapDefaults()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
            >
              <Database size={16} />
              Bootstrap defaults
            </button>
            <button
              type="button"
              onClick={handleExportTraining}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold"
              disabled={trainingExamples.length === 0}
            >
              <Download size={16} />
              Export JSON
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Zap size={20} className="text-indigo-500" />
            Quick chat test
          </h2>

          <textarea
            value={quickQuestion}
            onChange={(event) => setQuickQuestion(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhap cau hoi de test nhanh chatbot"
          />

          <button
            type="button"
            onClick={() => void handleQuickTest()}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            disabled={runningQuickTest}
          >
            <Send size={16} className={runningQuickTest ? 'animate-spin' : ''} />
            Test ngay
          </button>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4 min-h-[190px]">
            {!quickResult ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">Chua co ket qua test.</p>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500">
                  Provider: {quickResult.aiProvider} {quickResult.degraded ? '(degraded)' : ''}
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-100">{quickResult.answer}</p>
                {quickResult.degradedReason && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">Reason: {quickResult.degradedReason}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Brain size={20} className="text-violet-500" />
            Training dataset editor
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold"
            >
              <FileUp size={16} />
              Import JSON
            </button>
            <button
              type="button"
              onClick={() => void handleSaveEditor()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              disabled={savingTraining}
            >
              <Save size={16} className={savingTraining ? 'animate-spin' : ''} />
              Luu training
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(event) => void handleImportJsonFile(event.target.files?.[0])}
          />
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400">
          Format JSON: mang QA hoac object co truong examples. Tong hien tai: {trainingExamples.length} QA.
        </p>

        <textarea
          rows={18}
          value={jsonEditor}
          onChange={(event) => setJsonEditor(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </section>
    </div>
  );
};

export default AdminChatbotOps;
