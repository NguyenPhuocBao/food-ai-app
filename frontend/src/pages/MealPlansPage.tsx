import { useEffect, useState } from 'react';
import { CalendarDays, Eye, Loader2, Plus, Sparkles, Trash2, X, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFoods } from '../services/food.service';
import {
  addDetailToMealPlan,
  applyActiveMealPlanToday,
  createMealPlan,
  deleteMealPlan,
  deleteDetailFromMealPlan,
  generateAutoMealPlan,
  getMealPlanById,
  getMealPlanInsights,
  getMealPlans,
  setActiveMealPlan,
  updateMealPlanDetail,
  type MealPlan,
  type MealPlanDetail,
  type MealPlanInsights,
} from '../services/mealplan.service';
import type { FoodItem } from '../types';

const DAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
type MealTypeKey = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

const MEAL_LABELS: Record<MealTypeKey, string> = {
  BREAKFAST: 'Sáng',
  LUNCH: 'Trưa',
  DINNER: 'Tối',
  SNACK: 'Phụ',
};
const MEAL_COLORS: Record<MealTypeKey, string> = {
  BREAKFAST: 'bg-amber-50 text-amber-700 border-amber-100',
  LUNCH: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  DINNER: 'bg-sky-50 text-sky-700 border-sky-100',
  SNACK: 'bg-rose-50 text-rose-700 border-rose-100',
};

type DraftDetail = {
  foodId: number;
  mealType: MealTypeKey;
  dayOfWeek: number;
  quantity: number;
};

const MealPlansPage = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [applyingToday, setApplyingToday] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    activateAfterCreate: true,
  });
  const [autoConfig, setAutoConfig] = useState({
    goalTemplate: 'AUTO' as 'AUTO' | 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN',
    macroStrategy: 'AUTO' as 'AUTO' | 'BALANCED' | 'HIGH_PROTEIN' | 'LOW_CARB',
    includeSnack: true,
    useCustomTargets: false,
    targetCalories: '',
    targetProtein: '',
    targetFat: '',
    targetCarbs: '',
  });
  const [details, setDetails] = useState<DraftDetail[]>([
    { foodId: 0, mealType: 'BREAKFAST', dayOfWeek: 1, quantity: 1 },
  ]);
  const [previewPlanId, setPreviewPlanId] = useState<number | null>(null);
  const [previewPlan, setPreviewPlan] = useState<MealPlan | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [addingDetailToPreview, setAddingDetailToPreview] = useState<{ dayOfWeek: number; mealType: MealTypeKey } | null>(null);
  const [previewDetailForm, setPreviewDetailForm] = useState({ foodId: 0, quantity: 1 });
  const [editingDetail, setEditingDetail] = useState<MealPlanDetail | null>(null);
  const [editDetailForm, setEditDetailForm] = useState({ foodId: 0, mealType: 'BREAKFAST' as MealTypeKey, dayOfWeek: 1, quantity: 1 });
  const [draggingDetailId, setDraggingDetailId] = useState<number | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ dayOfWeek: number; mealType: MealTypeKey } | null>(null);
  const [insightsByPlanId, setInsightsByPlanId] = useState<Record<number, MealPlanInsights>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [planData, foodResult] = await Promise.all([
        getMealPlans(),
        getFoods(1, 100),
      ]);
      setPlans(planData);
      setFoods(foodResult.items);

      const insightEntries = await Promise.all(
        planData.map(async (plan) => {
          try {
            const insight = await getMealPlanInsights(plan.id);
            return [plan.id, insight] as const;
          } catch {
            return [plan.id, null] as const;
          }
        })
      );

      const nextInsights: Record<number, MealPlanInsights> = {};
      insightEntries.forEach(([planId, insight]) => {
        if (insight) nextInsights[planId] = insight;
      });
      setInsightsByPlanId(nextInsights);
    } catch {
      toast.error('Không thể tải dữ liệu meal plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      startDate: '',
      endDate: '',
      activateAfterCreate: true,
    });
    setAutoConfig({
      goalTemplate: 'AUTO',
      macroStrategy: 'AUTO',
      includeSnack: true,
      useCustomTargets: false,
      targetCalories: '',
      targetProtein: '',
      targetFat: '',
      targetCarbs: '',
    });
    setDetails([{ foodId: 0, mealType: 'BREAKFAST', dayOfWeek: 1, quantity: 1 }]);
  };

  const handleCreatePlan = async (event: React.FormEvent) => {
    event.preventDefault();

    const validDetails = details.filter((detail) => detail.foodId > 0);
    if (!validDetails.length) {
      toast.error('Thêm ít nhất một món ăn vào kế hoạch');
      return;
    }

    setSubmitting(true);
    try {
      const plan = await createMealPlan({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      await Promise.all(
        validDetails.map((detail) =>
          addDetailToMealPlan(plan.id, {
            foodId: detail.foodId,
            mealType: detail.mealType,
            dayOfWeek: detail.dayOfWeek,
            quantity: detail.quantity,
          })
        )
      );

      if (form.activateAfterCreate) {
        await setActiveMealPlan(plan.id);
      }

      toast.success('Tạo meal plan thành công');
      resetForm();
      await loadData();
    } catch {
      toast.error('Không thể tạo meal plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoGeneratePlan = async () => {
    setAutoGenerating(true);
    try {
      const customTargets = autoConfig.useCustomTargets
        ? {
            targetCalories: autoConfig.targetCalories ? Number(autoConfig.targetCalories) : undefined,
            targetProtein: autoConfig.targetProtein ? Number(autoConfig.targetProtein) : undefined,
            targetFat: autoConfig.targetFat ? Number(autoConfig.targetFat) : undefined,
            targetCarbs: autoConfig.targetCarbs ? Number(autoConfig.targetCarbs) : undefined,
          }
        : {};

      const payload = {
        name: form.name || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        activate: form.activateAfterCreate,
        days: form.startDate || form.endDate ? undefined : 7,
        includeSnack: autoConfig.includeSnack,
        goalTemplate: autoConfig.goalTemplate,
        macroStrategy: autoConfig.macroStrategy,
        ...customTargets,
      };

      await generateAutoMealPlan(payload);
      toast.success('Đã tạo meal plan tự động theo mục tiêu');
      resetForm();
      await loadData();
    } catch {
      toast.error('Không thể tạo meal plan tự động');
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleActivate = async (planId: number) => {
    try {
      await setActiveMealPlan(planId);
      toast.success('Đã kích hoạt meal plan');
      await loadData();
    } catch {
      toast.error('Không thể kích hoạt meal plan');
    }
  };

  const handleApplyToday = async () => {
    setApplyingToday(true);
    try {
      const result = await applyActiveMealPlanToday();
      if (result.createdCount > 0 && result.skippedCount > 0) {
        toast.success(`Đã thêm ${result.createdCount} bữa, bỏ qua ${result.skippedCount} bữa đã tồn tại`);
      } else if (result.createdCount > 0) {
        toast.success(`Đã áp dụng ${result.createdCount} bữa ăn hôm nay`);
      } else {
        toast('Tất cả bữa hôm nay đã tồn tại, không tạo mới');
      }
      await loadData();
    } catch {
      toast.error('Không thể áp dụng meal plan cho hôm nay');
    } finally {
      setApplyingToday(false);
    }
  };

  const handleDelete = async (planId: number) => {
    try {
      await deleteMealPlan(planId);
      if (previewPlanId === planId) {
        setPreviewPlanId(null);
        setPreviewPlan(null);
      }
      toast.success('Đã xóa meal plan');
      await loadData();
    } catch {
      toast.error('Không thể xóa meal plan');
    }
  };

  const refreshPreviewPlan = async (planId: number) => {
    try {
      const updatedPlan = await getMealPlanById(planId);
      setPreviewPlan(updatedPlan);
      return updatedPlan;
    } catch {
      return null;
    }
  };

  const openPreviewPlan = (planId: number) => {
    setPreviewPlanId(planId);
    setPreviewPlan(null);
  };

  useEffect(() => {
    if (!previewPlanId) return;

    let disposed = false;
    const loadPreview = async () => {
      setPreviewLoading(true);
      const updatedPlan = await refreshPreviewPlan(previewPlanId);
      if (!updatedPlan && !disposed) {
        toast.error('Không thể tải dữ liệu preview mới nhất');
      }
      if (!disposed) setPreviewLoading(false);
    };

    void loadPreview();

    const handleFocus = () => {
      void refreshPreviewPlan(previewPlanId);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshPreviewPlan(previewPlanId);
      }
    };
    const intervalId = window.setInterval(() => {
      void refreshPreviewPlan(previewPlanId);
    }, 10000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [previewPlanId]);

  const handleDeletePreviewDetail = async (detailId: number) => {
    if (!previewPlan) return;
    try {
      await deleteDetailFromMealPlan(previewPlan.id, detailId);
      toast.success('Đã xóa món khỏi meal plan');
      await refreshPreviewPlan(previewPlan.id);
      loadData();
    } catch {
      toast.error('Không thể xóa món');
    }
  };

  const handleAddPreviewDetail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!previewPlan || !addingDetailToPreview || previewDetailForm.foodId === 0) return;

    try {
      await addDetailToMealPlan(previewPlan.id, {
        foodId: previewDetailForm.foodId,
        mealType: addingDetailToPreview.mealType,
        dayOfWeek: addingDetailToPreview.dayOfWeek,
        quantity: previewDetailForm.quantity,
      });

      toast.success('Đã thêm món vào meal plan');
      setAddingDetailToPreview(null);
      setPreviewDetailForm({ foodId: 0, quantity: 1 });

      await refreshPreviewPlan(previewPlan.id);
      loadData();
    } catch {
      toast.error('Không thể thêm món');
    }
  };

  const handleStartEditDetail = (detail: MealPlanDetail) => {
    setEditingDetail(detail);
    setEditDetailForm({
      foodId: detail.foodId,
      mealType: detail.mealType,
      dayOfWeek: detail.dayOfWeek,
      quantity: detail.quantity,
    });
  };

  const handleCancelEditDetail = () => {
    setEditingDetail(null);
  };

  const handleSaveEditDetail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!previewPlan || !editingDetail) return;

    try {
      const updated = await updateMealPlanDetail(previewPlan.id, editingDetail.id, {
        foodId: editDetailForm.foodId,
        mealType: editDetailForm.mealType,
        dayOfWeek: editDetailForm.dayOfWeek,
        quantity: editDetailForm.quantity,
      });

      toast.success('Cập nhật meal plan thành công');
      setEditingDetail(null);
      await refreshPreviewPlan(previewPlan.id);
      loadData();
    } catch {
      toast.error('Không thể cập nhật món');
    }
  };

  const handleDragStart = (detail: MealPlanDetail) => {
    setDraggingDetailId(detail.id);
  };

  const handleDragEnd = () => {
    setDraggingDetailId(null);
    setDragOverTarget(null);
  };

  const handleDragEnter = (dayOfWeek: number, mealType: MealTypeKey) => {
    if (!draggingDetailId) return;
    setDragOverTarget({ dayOfWeek, mealType });
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDropOnCell = async (dayOfWeek: number, mealType: MealTypeKey) => {
    if (!previewPlan || !draggingDetailId) return;

    const detail = previewPlan.details.find((item) => item.id === draggingDetailId);
    if (!detail) return;

    setDragOverTarget(null);
    setDraggingDetailId(null);
    if (detail.dayOfWeek === dayOfWeek && detail.mealType === mealType) return;

    try {
      const updated = await updateMealPlanDetail(previewPlan.id, detail.id, { dayOfWeek, mealType });
      toast.success(`Đã di chuyển ${detail.food.name} sang ${MEAL_LABELS[mealType]} ${DAY_LABELS[dayOfWeek]}`);
      await refreshPreviewPlan(previewPlan.id);
      loadData();
    } catch {
      toast.error('Không thể di chuyển món ăn');
    }
  };

  const getPreviewTotals = (dayOfWeek: number) => {
    const dayDetails = previewPlan?.details.filter((detail) => detail.dayOfWeek === dayOfWeek) ?? [];
    return dayDetails.reduce(
      (result, detail) => {
        result.calories += detail.food.calories * detail.quantity;
        result.protein += detail.food.protein * detail.quantity;
        result.fat += detail.food.fat * detail.quantity;
        result.carbs += detail.food.carbs * detail.quantity;
        return result;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  };

  const getWeekTotals = () => {
    if (!previewPlan) return { calories: 0, protein: 0, fat: 0, carbs: 0, meals: 0, emptyCells: 28 };

    const totals = previewPlan.details.reduce(
      (result, detail) => {
        result.calories += detail.food.calories * detail.quantity;
        result.protein += detail.food.protein * detail.quantity;
        result.fat += detail.food.fat * detail.quantity;
        result.carbs += detail.food.carbs * detail.quantity;
        result.meals += 1;
        return result;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0, meals: 0 }
    );

    const fullCells = DAY_LABELS.length * Object.keys(MEAL_LABELS).length;
    return {
      ...totals,
      emptyCells: fullCells - totals.meals,
    };
  };

  const formatNumber = (value: number) => Math.round(value);

  const updateDetail = (index: number, field: keyof DraftDetail, value: number | DraftDetail['mealType']) => {
    setDetails((current) =>
      current.map((detail, detailIndex) => (detailIndex === index ? { ...detail, [field]: value } : detail))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="bg-[linear-gradient(135deg,_#ecfeff,_#f0fdf4_45%,_#fef9c3)] border border-emerald-100 rounded-[32px] p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700 mb-4">Meal plan</p>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight max-w-3xl">
          Lên kế hoạch bữa ăn theo tuần cho riêng bạn
        </h1>
        <p className="text-gray-600 mt-4 max-w-2xl leading-relaxed">
          Tạo nhiều kế hoạch khác nhau, gán món ăn theo từng ngày và từng bữa, rồi kích hoạt kế hoạch bạn muốn áp dụng.
        </p>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5">
          <form onSubmit={handleCreatePlan} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-7 space-y-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Tạo kế hoạch mới</h2>
              <p className="text-sm text-gray-500 mt-1">Bạn có thể tạo trước khung thời gian rồi thêm từng món theo ngày.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên kế hoạch</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl bg-gray-50 border-0 px-4 py-3"
                placeholder="Ví dụ: Eat clean tuần này"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày bắt đầu</label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-2xl bg-gray-50 border-0 px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày kết thúc</label>
                <input
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                  className="w-full rounded-2xl bg-gray-50 border-0 px-4 py-3"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-gray-900">Chi tiết món ăn</p>
                <button
                  type="button"
                  onClick={() =>
                    setDetails((current) => [...current, { foodId: 0, mealType: 'DINNER', dayOfWeek: 1, quantity: 1 }])
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm font-bold"
                >
                  <Plus size={16} />
                  Thêm dòng
                </button>
              </div>

              {details.map((detail, index) => (
                <div key={`${detail.foodId}-${index}`} className="rounded-[24px] border border-gray-100 p-4 space-y-3">
                  <div className="flex gap-3">
                    <select
                      value={detail.foodId}
                      onChange={(event) => updateDetail(index, 'foodId', Number(event.target.value))}
                      className="flex-1 rounded-2xl bg-gray-50 border-0 px-4 py-3 text-sm"
                    >
                      <option value={0}>Chọn món ăn</option>
                      {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setDetails((current) => current.filter((_, detailIndex) => detailIndex !== index))}
                      className="rounded-2xl bg-red-50 text-red-600 px-3"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={detail.mealType}
                      onChange={(event) => updateDetail(index, 'mealType', event.target.value as DraftDetail['mealType'])}
                      className="rounded-2xl bg-gray-50 border-0 px-4 py-3 text-sm"
                    >
                      <option value="BREAKFAST">Bữa sáng</option>
                      <option value="LUNCH">Bữa trưa</option>
                      <option value="DINNER">Bữa tối</option>
                      <option value="SNACK">Bữa phụ</option>
                    </select>
                    <select
                      value={detail.dayOfWeek}
                      onChange={(event) => updateDetail(index, 'dayOfWeek', Number(event.target.value))}
                      className="rounded-2xl bg-gray-50 border-0 px-4 py-3 text-sm"
                    >
                      {DAY_LABELS.map((label, dayIndex) => (
                        <option key={label} value={dayIndex}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={detail.quantity}
                      onChange={(event) => updateDetail(index, 'quantity', Number(event.target.value))}
                      className="rounded-2xl bg-gray-50 border-0 px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <input
                type="checkbox"
                checked={form.activateAfterCreate}
                onChange={(event) => setForm((current) => ({ ...current, activateAfterCreate: event.target.checked }))}
              />
              Kích hoạt ngay sau khi tạo
            </label>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Auto Generate Nâng Cao</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Goal template</label>
                  <select
                    value={autoConfig.goalTemplate}
                    onChange={(event) =>
                      setAutoConfig((current) => ({
                        ...current,
                        goalTemplate: event.target.value as typeof current.goalTemplate,
                      }))
                    }
                    className="w-full rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm"
                  >
                    <option value="AUTO">Tự động theo profile</option>
                    <option value="WEIGHT_LOSS">Giảm cân</option>
                    <option value="WEIGHT_GAIN">Tăng cân</option>
                    <option value="MUSCLE_GAIN">Tăng cơ</option>
                    <option value="MAINTENANCE">Duy trì</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Macro strategy</label>
                  <select
                    value={autoConfig.macroStrategy}
                    onChange={(event) =>
                      setAutoConfig((current) => ({
                        ...current,
                        macroStrategy: event.target.value as typeof current.macroStrategy,
                      }))
                    }
                    className="w-full rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm"
                  >
                    <option value="AUTO">Tự động theo goal</option>
                    <option value="BALANCED">Balanced</option>
                    <option value="HIGH_PROTEIN">High protein</option>
                    <option value="LOW_CARB">Low carb</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={autoConfig.includeSnack}
                    onChange={(event) =>
                      setAutoConfig((current) => ({ ...current, includeSnack: event.target.checked }))
                    }
                  />
                  Bao gồm bữa phụ
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={autoConfig.useCustomTargets}
                    onChange={(event) =>
                      setAutoConfig((current) => ({ ...current, useCustomTargets: event.target.checked }))
                    }
                  />
                  Tự đặt macro/calories
                </label>
              </div>

              {autoConfig.useCustomTargets && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="800"
                    placeholder="Calories/ngày"
                    value={autoConfig.targetCalories}
                    onChange={(event) =>
                      setAutoConfig((current) => ({ ...current, targetCalories: event.target.value }))
                    }
                    className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="30"
                    placeholder="Protein (g)"
                    value={autoConfig.targetProtein}
                    onChange={(event) =>
                      setAutoConfig((current) => ({ ...current, targetProtein: event.target.value }))
                    }
                    className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="20"
                    placeholder="Fat (g)"
                    value={autoConfig.targetFat}
                    onChange={(event) =>
                      setAutoConfig((current) => ({ ...current, targetFat: event.target.value }))
                    }
                    className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="30"
                    placeholder="Carbs (g)"
                    value={autoConfig.targetCarbs}
                    onChange={(event) =>
                      setAutoConfig((current) => ({ ...current, targetCarbs: event.target.value }))
                    }
                    className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={autoGenerating}
              onClick={handleAutoGeneratePlan}
              className="w-full rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {autoGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {autoGenerating ? 'Đang tạo tự động...' : 'Tạo nhanh theo mục tiêu'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CalendarDays size={18} />}
              {submitting ? 'Đang tạo...' : 'Tạo meal plan'}
            </button>
          </form>
        </div>

        <div className="xl:col-span-7">
          {loading ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-16 flex items-center justify-center">
              <Loader2 size={36} className="animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="space-y-5">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-gray-900">{plan.name}</h2>
                        {plan.isActive && (
                          <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold">
                            Đang áp dụng
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(plan.startDate).toLocaleDateString('vi-VN')} đến {new Date(plan.endDate).toLocaleDateString('vi-VN')}
                      </p>
                      {insightsByPlanId[plan.id] && (
                        <p className="mt-2 text-xs font-bold text-blue-700">
                          Hôm nay: {insightsByPlanId[plan.id].completedMealsToday}/{insightsByPlanId[plan.id].plannedMealsToday} bữa
                          ({insightsByPlanId[plan.id].adherenceRateToday}%)
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => void openPreviewPlan(plan.id)}
                        className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 inline-flex items-center gap-2 hover:bg-blue-100"
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                      {plan.isActive && (
                        <button
                          onClick={handleApplyToday}
                          disabled={applyingToday}
                          className="rounded-2xl bg-emerald-500 text-white px-4 py-2 text-sm font-bold disabled:opacity-60"
                        >
                          {applyingToday ? 'Đang áp dụng...' : 'Áp dụng hôm nay'}
                        </button>
                      )}
                      {!plan.isActive && (
                        <button
                          onClick={() => handleActivate(plan.id)}
                          className="rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm font-bold"
                        >
                          Kích hoạt
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="rounded-2xl bg-red-50 text-red-600 px-4 py-2 text-sm font-bold"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.details.map((detail) => (
                      <div key={detail.id} className="rounded-[24px] border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500">
                          {DAY_LABELS[detail.dayOfWeek]}
                        </p>
                        <h3 className="font-black text-gray-900 mt-2">{detail.food.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {detail.mealType} • {detail.quantity} khẩu phần
                        </p>
                        <div className="flex gap-2 mt-3 text-xs font-bold">
                          <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1">{detail.food.calories} kcal</span>
                          <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">{Math.round(detail.food.protein)}g P</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {!plans.length && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-14 text-center">
                  <h2 className="text-2xl font-black text-gray-900">Bạn chưa có meal plan nào</h2>
                  <p className="text-gray-500 mt-3">Tạo kế hoạch đầu tiên ở khung bên trái để bắt đầu tổ chức bữa ăn trong tuần.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {previewPlanId && (
        <div className="fixed inset-0 z-50 bg-gray-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Weekly Preview</p>
                {previewPlan ? (
                  <>
                    <h2 className="mt-1 text-2xl font-black text-gray-900">{previewPlan.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(previewPlan.startDate).toLocaleDateString('vi-VN')} đến {new Date(previewPlan.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Đang tải dữ liệu preview mới nhất...
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {previewPlan && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <div className="rounded-2xl bg-gray-50 px-4 py-2">
                      <p className="text-gray-400">Món</p>
                      <p className="text-lg text-gray-900">{previewPlan.details.length}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-2">
                      <p className="text-amber-500">Kcal</p>
                      <p className="text-lg text-amber-800">
                        {Math.round(previewPlan.details.reduce((sum, detail) => sum + detail.food.calories * detail.quantity, 0))}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-2">
                      <p className="text-emerald-500">Protein</p>
                      <p className="text-lg text-emerald-800">
                        {Math.round(previewPlan.details.reduce((sum, detail) => sum + detail.food.protein * detail.quantity, 0))}g
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setPreviewPlanId(null);
                    setPreviewPlan(null);
                  }}
                  className="rounded-2xl bg-gray-100 p-3 text-gray-600 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {!previewPlan || previewLoading ? (
              <div className="flex flex-1 items-center justify-center bg-[linear-gradient(135deg,_#f8fafc,_#ecfeff)]">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm">
                  <Loader2 size={18} className="animate-spin text-emerald-500" />
                  Đang đồng bộ dữ liệu mới nhất...
                </div>
              </div>
            ) : (
              <>
            {editingDetail && (
              <div className="border-t border-gray-100 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">Sửa chi tiết</p>
                    <h3 className="text-lg font-black text-gray-900">{editingDetail.food.name}</h3>
                    <p className="text-sm text-gray-500">Điều chỉnh ngày, bữa và số khẩu phần cho mục đã chọn.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEditDetail}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-gray-700 border border-gray-200"
                  >
                    Hủy
                  </button>
                </div>

                <form onSubmit={handleSaveEditDetail} className="mt-4 grid gap-4 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Món ăn</label>
                    <select
                      value={editDetailForm.foodId}
                      onChange={(event) => setEditDetailForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                      className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm"
                    >
                      {editingDetail && !foods.some((food) => food.id === editingDetail.foodId) && (
                        <option value={editingDetail.foodId}>{editingDetail.food.name}</option>
                      )}
                      {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Ngày</label>
                    <select
                      value={editDetailForm.dayOfWeek}
                      onChange={(event) => setEditDetailForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                      className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm"
                    >
                      {DAY_LABELS.map((label, dayIndex) => (
                        <option key={label} value={dayIndex}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Bữa</label>
                    <select
                      value={editDetailForm.mealType}
                      onChange={(event) =>
                        setEditDetailForm((current) => ({ ...current, mealType: event.target.value as MealTypeKey }))
                      }
                      className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm"
                    >
                      {(Object.keys(MEAL_LABELS) as MealTypeKey[]).map((mealType) => (
                        <option key={mealType} value={mealType}>
                          {MEAL_LABELS[mealType]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Khẩu phần</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={editDetailForm.quantity}
                      onChange={(event) =>
                        setEditDetailForm((current) => ({ ...current, quantity: Number(event.target.value) }))
                      }
                      className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-emerald-500 text-white py-3 text-sm font-black hover:bg-emerald-600"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex-1 overflow-auto bg-[linear-gradient(135deg,_#f8fafc,_#ecfeff)] p-5">
              <div className="min-w-[1040px] overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="w-28 px-4 py-4 text-left text-sm font-black">Bữa</th>
                      {DAY_LABELS.map((dayLabel, dayIndex) => {
                        const dayDetails = previewPlan.details.filter((detail) => detail.dayOfWeek === dayIndex);
                        const dayCalories = dayDetails.reduce((sum, detail) => sum + detail.food.calories * detail.quantity, 0);

                        return (
                          <th key={dayLabel} className="px-3 py-4 text-left align-top">
                            <p className="text-sm font-black">{dayLabel}</p>
                            <p className="mt-1 text-xs font-semibold text-gray-300">{Math.round(dayCalories)} kcal</p>
                          </th>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50 text-gray-700 text-xs">
                      <td className="px-4 py-2 font-semibold">Tổng mỗi ngày</td>
                      {DAY_LABELS.map((_, dayIndex) => {
                        const totals = getPreviewTotals(dayIndex);
                        return (
                          <td key={dayIndex} className="px-3 py-2 align-top">
                            <div className="space-y-1">
                              <div className="rounded-full bg-slate-100 px-2 py-1 inline-block">{Math.round(totals.calories)} kcal</div>
                              <div className="rounded-full bg-emerald-50 px-2 py-1 inline-block text-emerald-700">{Math.round(totals.protein)}g P</div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(MEAL_LABELS) as MealTypeKey[]).map((mealType) => (
                      <tr key={mealType} className="border-t border-gray-100">
                        <td className="bg-gray-50 px-4 py-4 align-top">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${MEAL_COLORS[mealType]}`}>
                            {MEAL_LABELS[mealType]}
                          </span>
                        </td>
                        {DAY_LABELS.map((dayLabel, dayIndex) => {
                          const mealDetails = previewPlan.details.filter(
                            (detail) => detail.dayOfWeek === dayIndex && detail.mealType === mealType
                          );
                          const isTarget = dragOverTarget?.dayOfWeek === dayIndex && dragOverTarget?.mealType === mealType;

                          return (
                            <td
                              key={`${dayLabel}-${mealType}`}
                              className={`h-32 border-l border-gray-100 p-3 align-top group relative transition-colors ${isTarget ? 'ring-2 ring-emerald-300 bg-emerald-50/60' : 'hover:bg-gray-50/50'}`}
                              onDragOver={(event) => event.preventDefault()}
                              onDragEnter={() => handleDragEnter(dayIndex, mealType)}
                              onDragLeave={handleDragLeave}
                              onDrop={(event) => {
                                event.preventDefault();
                                handleDropOnCell(dayIndex, mealType);
                              }}
                            >
                              {addingDetailToPreview?.dayOfWeek === dayIndex && addingDetailToPreview?.mealType === mealType ? (
                                <form onSubmit={handleAddPreviewDetail} className="bg-white p-3 rounded-2xl shadow-lg border border-emerald-100 mb-2 relative z-20 animate-in fade-in slide-in-from-top-2">
                                  <button type="button" onClick={() => setAddingDetailToPreview(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={14}/></button>
                                  <p className="text-xs font-bold text-gray-900 mb-2 pr-4">Thêm món</p>
                                  <select 
                                    className="w-full text-xs p-2 rounded-xl bg-gray-50 border-0 mb-2"
                                    value={previewDetailForm.foodId}
                                    onChange={e => setPreviewDetailForm(c => ({...c, foodId: Number(e.target.value)}))}
                                    required
                                  >
                                    <option value={0}>Chọn món</option>
                                    {foods.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                  </select>
                                  <div className="flex gap-2">
                                    <input 
                                      type="number" min="0.5" step="0.5" required
                                      className="w-16 text-xs p-2 rounded-xl bg-gray-50 border-0"
                                      value={previewDetailForm.quantity}
                                      onChange={e => setPreviewDetailForm(c => ({...c, quantity: Number(e.target.value)}))}
                                    />
                                    <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors">Thêm</button>
                                  </div>
                                </form>
                              ) : null}

                              {mealDetails.length === 0 ? (
                                <div className="flex h-full min-h-[92px] items-center justify-center rounded-2xl border border-dashed border-gray-200 text-xs font-semibold text-gray-400">
                                  Trống
                                </div>
                              ) : (
                                <div className="space-y-2 relative z-10">
                                  {mealDetails.map((detail) => (
                                    <div
                                      key={detail.id}
                                      draggable
                                      onDragStart={() => handleDragStart(detail)}
                                      onDragEnd={handleDragEnd}
                                      className="group/item relative rounded-2xl border border-gray-100 bg-white p-3 shadow-sm hover:border-emerald-100 transition-colors"
                                    >
                                      <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all z-20">
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditDetail(detail)}
                                          className="rounded-full bg-white p-1.5 shadow-sm border border-gray-100 text-gray-400 hover:text-slate-900 hover:border-slate-200"
                                          title="Chỉnh sửa"
                                        >
                                          <Pencil size={12} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeletePreviewDetail(detail.id)}
                                          className="rounded-full bg-white p-1.5 shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100"
                                          title="Xóa"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <p className="line-clamp-2 text-sm font-black text-gray-900 pr-2">{detail.food.name}</p>
                                      <div className="mt-2 flex flex-wrap gap-1 text-[11px] font-bold">
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{detail.quantity}x</span>
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                                          {Math.round(detail.food.calories * detail.quantity)} kcal
                                        </span>
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                          {Math.round(detail.food.protein * detail.quantity)}g P
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {(!addingDetailToPreview || addingDetailToPreview.dayOfWeek !== dayIndex || addingDetailToPreview.mealType !== mealType) && (
                                <button 
                                  onClick={() => setAddingDetailToPreview({ dayOfWeek: dayIndex, mealType })}
                                  className="absolute bottom-1 right-1/2 translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition-all z-20"
                                  title="Thêm món"
                                >
                                  <Plus size={14} strokeWidth={3} />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlansPage;
