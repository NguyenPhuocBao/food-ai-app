import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFoods } from '../services/food.service';
import {
  addDetailToMealPlan,
  createMealPlan,
  deleteMealPlan,
  getMealPlans,
  setActiveMealPlan,
  type MealPlan,
} from '../services/mealplan.service';
import type { FoodItem } from '../types';

const DAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

type DraftDetail = {
  foodId: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  dayOfWeek: number;
  quantity: number;
};

const MealPlansPage = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    activateAfterCreate: true,
  });
  const [details, setDetails] = useState<DraftDetail[]>([
    { foodId: 0, mealType: 'BREAKFAST', dayOfWeek: 1, quantity: 1 },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planData, foodResult] = await Promise.all([
        getMealPlans(),
        getFoods(1, 100),
      ]);
      setPlans(planData);
      setFoods(foodResult.items);
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

  const handleActivate = async (planId: number) => {
    try {
      await setActiveMealPlan(planId);
      toast.success('Đã kích hoạt meal plan');
      await loadData();
    } catch {
      toast.error('Không thể kích hoạt meal plan');
    }
  };

  const handleDelete = async (planId: number) => {
    try {
      await deleteMealPlan(planId);
      toast.success('Đã xóa meal plan');
      await loadData();
    } catch {
      toast.error('Không thể xóa meal plan');
    }
  };

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
                    </div>
                    <div className="flex gap-3">
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
    </div>
  );
};

export default MealPlansPage;
