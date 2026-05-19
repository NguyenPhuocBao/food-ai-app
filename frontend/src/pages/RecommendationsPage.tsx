import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Loader2, PlusCircle, RefreshCcw, Sparkles, ThumbsDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Recommendation } from '../types';
import {
  generateRecommendations,
  getRecommendations,
  markRecommendationViewed,
  respondRecommendation,
} from '../services/recommendation.service';
import { getAssetUrl } from '../services/api';

const MEAL_TYPE_OPTIONS = [
  { value: 'BREAKFAST', label: 'Bữa sáng' },
  { value: 'LUNCH', label: 'Bữa trưa' },
  { value: 'DINNER', label: 'Bữa tối' },
  { value: 'SNACK', label: 'Bữa phụ' },
];

const STATUS_TABS: Array<{ label: string; value: 'all' | 'new' | 'accepted' | 'rejected' }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Mới', value: 'new' },
  { label: 'Đã chọn', value: 'accepted' },
  { label: 'Đã bỏ qua', value: 'rejected' },
];

const RecommendationsPage = () => {
  const [status, setStatus] = useState<'all' | 'new' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [addTarget, setAddTarget] = useState<Recommendation | null>(null);
  const [selectedMealType, setSelectedMealType] = useState('LUNCH');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [pendingWarning, setPendingWarning] = useState<Awaited<ReturnType<typeof respondRecommendation>> | null>(null);
  const hasGeneratedOnMount = useRef(false);

  const inferMealType = (reason: string) => {
    const text = reason.toLowerCase();
    if (text.includes('bua sang')) return 'BREAKFAST';
    if (text.includes('bua trua')) return 'LUNCH';
    if (text.includes('bua toi')) return 'DINNER';
    if (text.includes('bua phu') || text.includes('an nhe')) return 'SNACK';
    return 'LUNCH';
  };

  const inferQuantity = (reason: string) => {
    const match = reason.match(/khau phan\s+([0-9]+(?:\.[0-9]+)?)x/i);
    const value = match ? Number(match[1]) : 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
  };

  const loadData = async (nextStatus = status) => {
    setLoading(true);
    try {
      const data = await getRecommendations(nextStatus);
      setItems(data);
    } catch {
      toast.error('Không thể tải gợi ý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(status);
  }, [status]);

  useEffect(() => {
    if (hasGeneratedOnMount.current) return;
    hasGeneratedOnMount.current = true;

    const generateFreshBatch = async () => {
      setLoading(true);
      try {
        await generateRecommendations(7);
        setStatus('new');
        const data = await getRecommendations('new');
        setItems(data);
      } catch {
        await loadData(status);
      } finally {
        setLoading(false);
      }
    };

    void generateFreshBatch();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRecommendations(7);
      toast.success('Đã tạo gợi ý theo khẩu phần thực tế');
      setStatus('new');
      await loadData('new');
    } catch {
      toast.error('Không tạo được gợi ý');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewed = async (item: Recommendation) => {
    if (item.isViewed) return;
    setItems((prev) => prev.map((entry) => (
      entry.id === item.id ? { ...entry, isViewed: true } : entry
    )));
    try {
      await markRecommendationViewed(item.id);
    } catch {
      // keep optimistic state
    }
  };

  const handleRespond = async (id: number, accepted: boolean) => {
    setItems((prev) => prev.map((entry) => (
      entry.id === id ? { ...entry, isAccepted: accepted, isViewed: true } : entry
    )));

    try {
      const result = await respondRecommendation(id, accepted);
      if (accepted) {
        if (result.warning?.type === 'OVER_DAILY_TARGET') {
          toast.error(`${result.warning.message} Món vẫn đã được thêm vào nhật ký.`);
        } else if (result.warning?.type === 'NEAR_DAILY_TARGET') {
          toast(`${result.warning.message} Món đã được thêm vào nhật ký.`);
        } else {
          toast.success('Đã thêm món gợi ý vào nhật ký hôm nay');
        }
      } else {
        toast.success('Đã bỏ qua gợi ý');
      }
    } catch {
      toast.error('Không cập nhật được trạng thái');
      await loadData(status);
    }
  };

  const openAddDialog = (item: Recommendation) => {
    setAddTarget(item);
    setSelectedMealType(inferMealType(item.reason));
    setSelectedQuantity(inferQuantity(item.reason));
    setPendingWarning(null);
  };

  const closeAddDialog = () => {
    if (adding) return;
    setAddTarget(null);
    setPendingWarning(null);
  };

  const confirmAdd = async (skipPreview = false) => {
    if (!addTarget) return;
    setAdding(true);
    try {
      const previewResult = await respondRecommendation(addTarget.id, true, {
        mealType: selectedMealType,
        quantity: selectedQuantity,
        dryRun: !skipPreview,
      });

      if (!skipPreview && previewResult.warning) {
        setPendingWarning(previewResult);
        return;
      }

      const result = skipPreview
        ? previewResult
        : await respondRecommendation(addTarget.id, true, {
            mealType: selectedMealType,
            quantity: selectedQuantity,
            dryRun: false,
          });

      setItems((prev) => prev.map((entry) => (
        entry.id === addTarget.id ? { ...entry, isAccepted: true, isViewed: true } : entry
      )));

      if (result.warning?.type === 'OVER_DAILY_TARGET') {
        toast.error(`${result.warning.message} Đã thêm vào nhật ký${result.mealPlanDetail ? ' và meal plan.' : '.'}`);
      } else if (result.warning?.type === 'NEAR_DAILY_TARGET') {
        toast(`${result.warning.message} Đã thêm vào nhật ký${result.mealPlanDetail ? ' và meal plan.' : '.'}`);
      } else {
        toast.success(result.mealPlanDetail ? 'Đã thêm món vào nhật ký và meal plan hôm nay' : 'Đã thêm món vào nhật ký hôm nay');
      }
      setAddTarget(null);
      setPendingWarning(null);
    } catch {
      toast.error('Không thêm được món vào nhật ký');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">Recommendations</p>
            <h1 className="mt-2 text-3xl font-black">Gợi ý món ăn theo mục tiêu của bạn</h1>
            <p className="mt-2 text-sm text-emerald-100">
              Mỗi lần tạo chỉ ưu tiên các bữa cần thiết trong ngày, có kiểm tra calo, khẩu phần, cân nặng, chiều cao và dị ứng.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Tạo gợi ý mới
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              status === tab.value
                ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => loadData(status)}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCcw size={14} />
          Tải lại
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-3xl bg-gray-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-semibold text-gray-800 dark:text-slate-200">Chưa có gợi ý nào</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Nhấn "Tạo gợi ý mới" để hệ thống chọn món theo ngân sách calo từng bữa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const imageUrl = getAssetUrl(item.food.imageUrl);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="h-44 bg-gray-100 dark:bg-slate-800">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.food.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-black text-gray-300 dark:text-slate-600">
                      {item.food.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <Link
                      to={`/foods/${item.food.id}`}
                      onClick={() => handleViewed(item)}
                      className="text-lg font-black text-gray-900 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400"
                    >
                      {item.food.name}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{item.food.category}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-amber-50 px-2 py-2 font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                      {item.food.calories}kcal
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-2 py-2 font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                      {Math.round(item.food.protein)}P
                    </div>
                    <div className="rounded-xl bg-sky-50 px-2 py-2 font-bold text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                      {Math.round(item.food.fat)}F
                    </div>
                    <div className="rounded-xl bg-purple-50 px-2 py-2 font-bold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                      {Math.round(item.food.carbs)}C
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                    Lý do: <span className="font-semibold">{item.reason}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 dark:text-slate-500">Score {item.score.toFixed(1)}</span>
                    {item.isAccepted === true ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Check size={12} /> Đã chọn
                      </span>
                    ) : item.isAccepted === false ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                        Đã bỏ qua
                      </span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2 py-1 font-semibold ${item.isViewed ? 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {item.isViewed ? 'Đã xem' : 'Mới'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openAddDialog(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                    >
                      <PlusCircle size={14} />
                      Add
                    </button>
                    <button
                      onClick={() => handleRespond(item.id, false)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ThumbsDown size={14} />
                      Bỏ qua
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 px-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-500">Thêm vào nhật ký</p>
                <h2 className="mt-2 text-2xl font-black text-gray-900 dark:text-slate-100">{addTarget.food.name}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Chọn đúng bữa ăn và khẩu phần trước khi lưu vào hôm nay.
                </p>
              </div>
              <button
                onClick={closeAddDialog}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-200">Bữa ăn</span>
                <select
                  value={selectedMealType}
                  onChange={(event) => setSelectedMealType(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {MEAL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-200">Khẩu phần</span>
                <input
                  type="number"
                  min="0.25"
                  max="3"
                  step="0.25"
                  value={selectedQuantity}
                  onChange={(event) => setSelectedQuantity(Number(event.target.value))}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
              Ước tính thêm khoảng <span className="font-black text-gray-900 dark:text-slate-100">{Math.round(addTarget.food.calories * selectedQuantity)} kcal</span> vào nhật ký hôm nay.
            </div>

            {pendingWarning?.warning && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-black">Cảnh báo calo</p>
                    <p className="mt-1">{pendingWarning.warning.message}</p>
                    {pendingWarning.preview && (
                      <p className="mt-2 text-xs">
                        Hiện tại {Math.round(pendingWarning.preview.currentCalories)} kcal, thêm {Math.round(pendingWarning.preview.addedCalories)} kcal, dự kiến {Math.round(pendingWarning.preview.projectedCalories)}/{Math.round(pendingWarning.preview.dailyCalorieTarget)} kcal.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={closeAddDialog}
                disabled={adding}
                className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmAdd(Boolean(pendingWarning?.warning))}
                disabled={adding || !selectedQuantity || selectedQuantity <= 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                {pendingWarning?.warning ? 'Vẫn thêm' : 'Add vào nhật ký'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
