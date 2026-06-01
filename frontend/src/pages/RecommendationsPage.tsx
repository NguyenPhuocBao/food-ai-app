import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Loader2, PlusCircle, RefreshCcw, Sparkles, ThumbsDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Recommendation } from '../types';
import {
  applyRecommendationToMealPlanDays,
  generateRecommendations,
  generateRecommendationsByMealPlan,
  getRecommendations,
  markRecommendationViewed,
  type MealPlanRecommendationItem,
  rollbackMealPlanApply,
  respondRecommendation,
} from '../services/recommendation.service';
import { getAssetUrl } from '../services/api';
import { getMealPlans, type MealPlan } from '../services/mealplan.service';
import { getFoods } from '../services/food.service';

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
const DAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
type ApplyResultEntry = { applied: number; skipped: number; reason?: string; mode: 'SELECTED_DAYS' | 'FILL_EMPTY' | 'ALL_DAYS' };
type RollbackOperation = { detailId: number; mutation: 'CREATED' | 'UPDATED'; previousQuantity?: number; appliedQuantity?: number };
const LAST_APPLY_BATCH_KEY = 'foodai:last_apply_batch';
type LastApplySnapshot = { mealPlanId: number; operations: RollbackOperation[] };

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
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [foodLookup, setFoodLookup] = useState<Record<number, { id: number; name: string; imageUrl?: string; category?: string; calories?: number }>>({});
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<number>(0);
  const [mealPlanSuggestions, setMealPlanSuggestions] = useState<MealPlanRecommendationItem[]>([]);
  const [generatingByPlan, setGeneratingByPlan] = useState(false);
  const [applyingSuggestionKey, setApplyingSuggestionKey] = useState<string | null>(null);
  const [selectedApplyDays, setSelectedApplyDays] = useState<number[]>([]);
  const [applyingAllVisible, setApplyingAllVisible] = useState(false);
  const [applyResults, setApplyResults] = useState<Record<string, ApplyResultEntry>>({});
  const [onlyUnapplied, setOnlyUnapplied] = useState(false);
  const [lastApplyBatch, setLastApplyBatch] = useState<LastApplySnapshot | null>(null);
  const [rollingBack, setRollingBack] = useState(false);
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
    try {
      const raw = sessionStorage.getItem(LAST_APPLY_BATCH_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastApplySnapshot;
      if (parsed && Number(parsed.mealPlanId) > 0 && Array.isArray(parsed.operations) && parsed.operations.length) {
        setLastApplyBatch(parsed);
      }
    } catch {
      // ignore invalid cache
    }
  }, []);

  useEffect(() => {
    try {
      if (lastApplyBatch?.operations?.length) {
        sessionStorage.setItem(LAST_APPLY_BATCH_KEY, JSON.stringify(lastApplyBatch));
      } else {
        sessionStorage.removeItem(LAST_APPLY_BATCH_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [lastApplyBatch]);

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

  useEffect(() => {
    const loadFoodLookup = async () => {
      try {
        const response = await getFoods(1, 1000);
        const map: Record<number, { id: number; name: string; imageUrl?: string; category?: string; calories?: number }> = {};
        response.items.forEach((food) => {
          map[food.id] = {
            id: food.id,
            name: food.name,
            imageUrl: food.imageUrl,
            category: food.category,
            calories: food.calories,
          };
        });
        setFoodLookup(map);
      } catch {
        // keep empty; UI still has id fallback
      }
    };
    void loadFoodLookup();
  }, []);

  useEffect(() => {
    const loadMealPlans = async () => {
      try {
        const plans = await getMealPlans();
        setMealPlans(plans);
        const active = plans.find((plan) => plan.isActive) || plans[0];
        if (active) setSelectedMealPlanId(active.id);
      } catch {
        // ignore; recommendations page still works with old flow
      }
    };
    void loadMealPlans();
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

  const handleGenerateByMealPlan = async () => {
    if (!selectedMealPlanId) {
      toast.error('Chưa có meal plan để tạo gợi ý theo tuần');
      return;
    }
    setGeneratingByPlan(true);
    try {
      const result = await generateRecommendationsByMealPlan({ mealPlanId: selectedMealPlanId });
      setMealPlanSuggestions(result.recommendations || []);
      toast.success(`Đã tạo ${result.recommendations.length} gợi ý theo meal plan`);
    } catch {
      toast.error('Không tạo được gợi ý theo meal plan');
    } finally {
      setGeneratingByPlan(false);
    }
  };

  const handleApplySuggestion = async (
    suggestion: MealPlanRecommendationItem,
    applyMode: 'SELECTED_DAYS' | 'FILL_EMPTY' | 'ALL_DAYS' = 'SELECTED_DAYS',
  ) => {
    if (!selectedMealPlanId) return;
    const keyBase = `${suggestion.dayOfWeek}-${suggestion.mealType}-${suggestion.suggestedFoodId}`;
    const key = `${suggestion.dayOfWeek}-${suggestion.mealType}-${suggestion.suggestedFoodId}-${applyMode}`;
    setApplyingSuggestionKey(key);
    try {
      const result = await applyRecommendationToMealPlanDays({
        mealPlanId: selectedMealPlanId,
        foodId: suggestion.suggestedFoodId,
        mealType: suggestion.mealType,
        quantity: suggestion.suggestedQuantity,
        applyMode,
        dayOfWeeks: applyMode === 'SELECTED_DAYS' ? (selectedApplyDays.length ? selectedApplyDays : [suggestion.dayOfWeek]) : undefined,
      });
      const applied = result.results.filter((item) => item.status === 'APPLIED').length;
      const skipped = result.results.filter((item) => item.status === 'SKIPPED').length;
      const firstSkipReason = result.results.find((item) => item.status === 'SKIPPED')?.reason;
      const rollbackOps: RollbackOperation[] = result.results
        .filter((item) => item.status === 'APPLIED' && item.detailId && item.mutation)
        .map((item) => ({
          detailId: item.detailId as number,
          mutation: item.mutation as 'CREATED' | 'UPDATED',
          previousQuantity: item.previousQuantity,
          appliedQuantity: item.appliedQuantity,
        }));
      if (rollbackOps.length) setLastApplyBatch({ mealPlanId: selectedMealPlanId, operations: rollbackOps });
      setApplyResults((prev) => ({
        ...prev,
        [keyBase]: { applied, skipped, reason: firstSkipReason, mode: applyMode },
      }));
      if (applied > 0 && skipped > 0) {
        toast.success(`Đã áp dụng ${applied} ngày, bỏ qua ${skipped} ngày`);
      } else if (applied > 0) {
        toast.success(`Đã áp dụng ${applied} ngày`);
      } else {
        toast.error(result.results[0]?.reason || 'Không thể áp dụng đề xuất');
      }
      const refreshed = await generateRecommendationsByMealPlan({ mealPlanId: selectedMealPlanId });
      setMealPlanSuggestions(refreshed.recommendations || []);
    } catch {
      toast.error('Không thể áp dụng đề xuất');
    } finally {
      setApplyingSuggestionKey(null);
    }
  };

  const toggleApplyDay = (day: number) => {
    setSelectedApplyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)));
  };
  const setQuickApplyDays = (days: number[]) => {
    const uniqueDays = Array.from(new Set(days)).filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
    setSelectedApplyDays(uniqueDays);
  };

  const handleApplyAllVisible = async () => {
    if (!selectedMealPlanId || mealPlanSuggestions.length === 0) return;
    setApplyingAllVisible(true);
    let totalApplied = 0;
    let totalSkipped = 0;
    const collectedOps: RollbackOperation[] = [];
    try {
      for (const suggestion of mealPlanSuggestions) {
        const keyBase = `${suggestion.dayOfWeek}-${suggestion.mealType}-${suggestion.suggestedFoodId}`;
        const result = await applyRecommendationToMealPlanDays({
          mealPlanId: selectedMealPlanId,
          foodId: suggestion.suggestedFoodId,
          mealType: suggestion.mealType,
          quantity: suggestion.suggestedQuantity,
          applyMode: 'SELECTED_DAYS',
          dayOfWeeks: selectedApplyDays.length ? selectedApplyDays : [suggestion.dayOfWeek],
        });
        const applied = result.results.filter((item) => item.status === 'APPLIED').length;
        const skipped = result.results.filter((item) => item.status === 'SKIPPED').length;
        const firstSkipReason = result.results.find((item) => item.status === 'SKIPPED')?.reason;
        result.results.forEach((item) => {
          if (item.status === 'APPLIED' && item.detailId && item.mutation) {
            collectedOps.push({
              detailId: item.detailId,
              mutation: item.mutation,
              previousQuantity: item.previousQuantity,
              appliedQuantity: item.appliedQuantity,
            });
          }
        });
        totalApplied += applied;
        totalSkipped += skipped;
        setApplyResults((prev) => ({
          ...prev,
          [keyBase]: { applied, skipped, reason: firstSkipReason, mode: 'SELECTED_DAYS' },
        }));
      }
      if (totalApplied > 0) {
        if (collectedOps.length) setLastApplyBatch({ mealPlanId: selectedMealPlanId, operations: collectedOps });
        toast.success(`Áp dụng hàng loạt xong: ${totalApplied} ngày, bỏ qua ${totalSkipped} ngày`);
      } else {
        toast.error('Không có mục nào được áp dụng');
      }
      const refreshed = await generateRecommendationsByMealPlan({ mealPlanId: selectedMealPlanId });
      setMealPlanSuggestions(refreshed.recommendations || []);
    } catch {
      toast.error('Áp dụng hàng loạt thất bại');
    } finally {
      setApplyingAllVisible(false);
    }
  };

  const handleRollbackLastApply = async () => {
    if (!lastApplyBatch?.operations?.length || !lastApplyBatch.mealPlanId) {
      toast('Chưa có lần áp dụng nào để hoàn tác trong phiên hiện tại');
      return;
    }
    setRollingBack(true);
    try {
      const result = await rollbackMealPlanApply({
        mealPlanId: lastApplyBatch.mealPlanId,
        operations: lastApplyBatch.operations,
      });
      const rolledBackCount = result.results.filter((item) => item.status === 'ROLLED_BACK').length;
      const skippedCount = result.results.filter((item) => item.status === 'SKIPPED').length;
      if (rolledBackCount > 0) {
        toast.success(`Đã hoàn tác ${rolledBackCount} mục${skippedCount ? `, bỏ qua ${skippedCount}` : ''}`);
      } else {
        toast.error('Không có mục nào được hoàn tác');
      }
      setLastApplyBatch(null);
      setApplyResults({});
      sessionStorage.removeItem(LAST_APPLY_BATCH_KEY);
      if (!selectedMealPlanId || selectedMealPlanId !== lastApplyBatch.mealPlanId) {
        setSelectedMealPlanId(lastApplyBatch.mealPlanId);
      }
      const refreshed = await generateRecommendationsByMealPlan({ mealPlanId: lastApplyBatch.mealPlanId });
      setMealPlanSuggestions(refreshed.recommendations || []);
    } catch {
      toast.error('Hoàn tác thất bại');
    } finally {
      setRollingBack(false);
    }
  };

  const visibleMealPlanSuggestions = mealPlanSuggestions.filter((item) => {
    if (!onlyUnapplied) return true;
    const keyBase = `${item.dayOfWeek}-${item.mealType}-${item.suggestedFoodId}`;
    const summary = applyResults[keyBase];
    return !summary || summary.applied === 0;
  });
  const totalSuggestions = mealPlanSuggestions.length;
  const visibleSuggestions = visibleMealPlanSuggestions.length;

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

      if (result.mealPlanApplyOperation) {
        setLastApplyBatch({
          mealPlanId: result.mealPlanApplyOperation.mealPlanId,
          operations: [{
            detailId: result.mealPlanApplyOperation.detailId,
            mutation: result.mealPlanApplyOperation.mutation,
            previousQuantity: result.mealPlanApplyOperation.previousQuantity,
            appliedQuantity: result.mealPlanApplyOperation.appliedQuantity,
          }],
        });
      }

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

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Meal Plan Aware</p>
            <h2 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Gợi ý theo từng ô meal plan trong tuần</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Ưu tiên ô trống, tôn trọng ngân sách calo từng bữa và hard cap theo ngày.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedMealPlanId || 0}
              onChange={(event) => setSelectedMealPlanId(Number(event.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value={0}>Chọn meal plan</option>
              {mealPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
            <button
              onClick={handleGenerateByMealPlan}
              disabled={generatingByPlan || !selectedMealPlanId}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {generatingByPlan ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Tạo theo meal plan
            </button>
            <button
              onClick={handleRollbackLastApply}
              disabled={rollingBack}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-200 disabled:opacity-60 dark:bg-rose-900/30 dark:text-rose-300"
            >
              {rollingBack ? 'Đang hoàn tác...' : 'Rollback lần áp dụng gần nhất'}
            </button>
          </div>
        </div>

        {mealPlanSuggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-gray-100 p-3 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">Chọn ngày áp dụng</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAY_LABELS.map((label, index) => {
                  const active = selectedApplyDays.includes(index);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleApplyDay(index)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                        active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickApplyDays([1, 2, 3, 4, 5])}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  T2-T6
                </button>
                <button
                  onClick={() => setQuickApplyDays([0, 6])}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cuối tuần
                </button>
                <button
                  onClick={() => setQuickApplyDays([0, 1, 2, 3, 4, 5, 6])}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setQuickApplyDays([])}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  Xóa chọn
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Không chọn ngày nào thì mỗi card sẽ áp dụng theo ngày gợi ý của card đó.
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-600 dark:text-slate-300">
                Hiển thị {visibleSuggestions}/{totalSuggestions} gợi ý
              </p>
              <button
                onClick={handleApplyAllVisible}
                disabled={!!applyingSuggestionKey || applyingAllVisible || visibleSuggestions === 0}
                className="mt-3 rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
              >
                {applyingAllVisible ? 'Đang áp dụng hàng loạt...' : 'Áp dụng tất cả gợi ý đang hiển thị'}
              </button>
              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyUnapplied}
                  onChange={(event) => setOnlyUnapplied(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Chỉ hiện gợi ý chưa áp dụng thành công
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleMealPlanSuggestions.map((item) => {
              const keyBase = `${item.dayOfWeek}-${item.mealType}-${item.suggestedFoodId}`;
              const isApplyingSingle = applyingSuggestionKey === `${keyBase}-SELECTED_DAYS`;
              const isApplyingFill = applyingSuggestionKey === `${keyBase}-FILL_EMPTY`;
              const suggestedFood = item.suggestedFood || foodLookup[item.suggestedFoodId];
              const imageUrl = getAssetUrl(suggestedFood?.imageUrl);
              const applySummary = applyResults[keyBase];
              return (
                <div key={keyBase} className="rounded-2xl border border-gray-100 p-3 dark:border-slate-700">
                  <div className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {imageUrl ? <img src={imageUrl} alt={suggestedFood?.name || `food-${item.suggestedFoodId}`} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-gray-900 dark:text-slate-100">
                        {suggestedFood?.name || `Món #${item.suggestedFoodId}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{DAY_LABELS[item.dayOfWeek]} • {MEAL_TYPE_OPTIONS.find((m) => m.value === item.mealType)?.label}</p>
                      <p className="text-xs font-semibold text-emerald-700">
                        {item.estimatedCalories || suggestedFood?.calories || 0} kcal • {item.suggestedQuantity}x
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">{item.reason}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApplySuggestion(item, 'SELECTED_DAYS')}
                      disabled={!!applyingSuggestionKey}
                      className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {isApplyingSingle ? 'Đang áp dụng...' : 'Áp dụng ngày này'}
                    </button>
                    <button
                      onClick={() => handleApplySuggestion(item, 'FILL_EMPTY')}
                      disabled={!!applyingSuggestionKey}
                      className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {isApplyingFill ? 'Đang áp dụng...' : 'Fill các ngày trống'}
                    </button>
                  </div>
                  {applySummary && (
                    <div className="mt-2 rounded-xl bg-gray-50 px-2 py-1.5 text-xs text-gray-700 dark:bg-slate-800 dark:text-slate-300">
                      {applySummary.mode === 'FILL_EMPTY' ? 'Fill ngày trống' : 'Theo ngày chọn'}: áp dụng {applySummary.applied}, bỏ qua {applySummary.skipped}
                      {applySummary.reason ? ` • ${applySummary.reason}` : ''}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            {visibleSuggestions === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-500 dark:border-slate-700 dark:text-slate-400">
                Không còn gợi ý phù hợp theo bộ lọc hiện tại.
              </div>
            )}
          </div>
        )}
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
