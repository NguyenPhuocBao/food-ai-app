import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, BarChart2, Calendar as CalendarIcon, Droplets, Target, Flame, Loader2, Trash2, Search, X, CheckCircle } from 'lucide-react';
import { getMealsByDate, addMeal, deleteMeal } from '../services/meal.service';
import { getDailyStats } from '../services/statistics.service';
import { searchFoods } from '../services/food.service';
import { useAuth } from '../contexts/AuthContext';
import type { Meal, FoodItem } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPES = [
  { id: 'BREAKFAST', name: 'Bữa Sáng' },
  { id: 'LUNCH', name: 'Bữa Trưa' },
  { id: 'DINNER', name: 'Bữa Tối' },
  { id: 'SNACK', name: 'Ăn Nhẹ' },
];

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// ── Add Meal Modal ──────────────────────────────────────────────────────────
const AddMealModal = ({
  mealType,
  date,
  onClose,
  onAdded,
}: {
  mealType: string;
  date: string;
  onClose: () => void;
  onAdded: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const foods = await searchFoods(q);
      setResults(foods);
    } catch {
      toast.error('Không thể tìm kiếm thức ăn');
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timeout);
  }, [query, doSearch]);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      await addMeal(selected.id, mealType, quantity, `${date}T12:00:00`);
      toast.success(`Đã thêm ${selected.name} vào nhật ký!`);
      onAdded();
      onClose();
    } catch {
      toast.error('Không thể thêm món ăn');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Thêm Món Ăn</h3>
            <p className="text-sm text-gray-500">{MEAL_TYPES.find(m => m.id === mealType)?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm món ăn... (VD: Phở, Cơm, Salad)"
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm border-0 focus:ring-2 focus:ring-emerald-500/20"
            />
            {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
          {results.length === 0 && query && !searching && (
            <p className="text-center text-sm text-gray-400 py-8">Không tìm thấy kết quả</p>
          )}
          {results.map(food => (
            <button
              key={food.id}
              onClick={() => setSelected(food)}
              className={`w-full text-left px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${selected?.id === food.id ? 'bg-emerald-50' : ''}`}
            >
              <div>
                <p className="font-bold text-sm text-gray-900">{food.name}</p>
                <p className="text-xs text-gray-400">{food.category} · {food.calories} kcal</p>
              </div>
              {selected?.id === food.id && <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
            </button>
          ))}
        </div>

        {/* Selected food + quantity */}
        {selected && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="font-black text-gray-900">{selected.name}</p>
              <div className="flex gap-3 mt-2 text-xs font-bold">
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{selected.calories} kcal</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{selected.protein}g P</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{selected.fat}g F</span>
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{selected.carbs}g C</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Khẩu phần:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(0.5, q - 0.5))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                >−</button>
                <span className="w-8 text-center font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 0.5)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                >+</button>
              </div>
              <span className="text-xs text-gray-400">→ {Math.round(selected.calories * quantity)} kcal</span>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {adding ? 'Đang thêm...' : 'Thêm vào Nhật Ký'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const DiaryPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState<{ mealType: string } | null>(null);

  const dateStr = currentDate.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mealData, statsData] = await Promise.all([
        getMealsByDate(dateStr),
        getDailyStats(dateStr),
      ]);
      setMeals(mealData.meals);
      setDailyStats(statsData);
    } catch {
      toast.error('Không thể tải dữ liệu nhật ký');
    } finally {
      setIsLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteMeal = async (id: number) => {
    try {
      await deleteMeal(id);
      toast.success('Đã xoá món ăn');
      fetchData();
    } catch {
      toast.error('Không thể xoá món ăn');
    }
  };

  const goToPrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const goToNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const displayDate = isToday
    ? 'Hôm nay'
    : currentDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });

  const nutrition = dailyStats?.nutrition || { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 };
  const goal = dailyStats?.goal || { calories: 2000, protein: 150, fat: 55, carbs: 250 };

  const caloriesPercent = Math.min(100, Math.round((nutrition.totalCalories / goal.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((nutrition.totalProtein / goal.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((nutrition.totalCarbs / goal.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((nutrition.totalFat / goal.fat) * 100));

  const groupedMeals = MEAL_TYPES.map(type => ({
    ...type,
    meals: meals.filter(m => m.mealType === type.id),
    totalCalories: meals.filter(m => m.mealType === type.id).reduce((sum, m) => sum + m.calories, 0),
    time: meals.filter(m => m.mealType === type.id)[0]?.eatenAt
      ? formatTime(meals.filter(m => m.mealType === type.id)[0].eatenAt)
      : '--:--',
  }));

  return (
    <>
      <AnimatePresence>
        {addModal && (
          <AddMealModal
            mealType={addModal.mealType}
            date={dateStr}
            onClose={() => setAddModal(null)}
            onAdded={fetchData}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="text-emerald-500" /> Nhật Ký Dinh Dưỡng
            </h1>
            <p className="text-gray-500 mt-1">Theo dõi nhật ký ăn uống và thống kê Calo chi tiết.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={goToPrevDay} className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center px-4">
              <p className="text-sm font-bold text-gray-900">{displayDate}</p>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                {currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={goToNextDay}
              disabled={isToday}
              className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-emerald-600 rounded-[24px] p-6 text-white shadow-lg shadow-emerald-500/20">
              <h3 className="text-emerald-100 text-sm font-medium mb-1">Tổng Calo Nạp</h3>
              {isLoading ? (
                <div className="flex items-center gap-2 h-12"><Loader2 size={24} className="animate-spin" /></div>
              ) : (
                <>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-black">{nutrition.totalCalories.toLocaleString()}</span>
                    <span className="text-emerald-200 ml-1">/ {goal.calories.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-emerald-700 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,1)] transition-all duration-700" style={{ width: `${caloriesPercent}%` }} />
                  </div>
                  <p className="text-xs font-medium text-emerald-100 text-right">
                    Còn lại: {Math.max(0, goal.calories - nutrition.totalCalories).toLocaleString()} kcal
                  </p>
                </>
              )}
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Thành phần Macro</h4>
                <BarChart2 size={16} className="text-gray-400" />
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-500 flex items-center gap-1"><Target size={14} className="text-emerald-500" /> Protein</span>
                      <span className="text-gray-900">{Math.round(nutrition.totalProtein)}g<span className="text-gray-400 font-normal">/{Math.round(goal.protein)}g</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${proteinPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-500 flex items-center gap-1"><Flame size={14} className="text-amber-500" /> Carbs</span>
                      <span className="text-gray-900">{Math.round(nutrition.totalCarbs)}g<span className="text-gray-400 font-normal">/{Math.round(goal.carbs)}g</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${carbsPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-500 flex items-center gap-1"><Droplets size={14} className="text-blue-500" /> Fat</span>
                      <span className="text-gray-900">{Math.round(nutrition.totalFat)}g<span className="text-gray-400 font-normal">/{Math.round(goal.fat)}g</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${fatPercent}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meals Column */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-24 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                <Loader2 size={36} className="animate-spin text-emerald-500" />
              </div>
            ) : (
              groupedMeals.map((group) => (
                <div key={group.id} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                      {group.meals.length > 0 && (
                        <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500">{group.time}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {group.totalCalories > 0 && (
                        <span className="text-amber-500 font-bold">
                          {group.totalCalories} <span className="text-xs text-gray-400 font-medium">KCAL</span>
                        </span>
                      )}
                      <button
                        onClick={() => setAddModal({ mealType: group.id })}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                      >
                        <Plus size={16} /> Thêm món
                      </button>
                    </div>
                  </div>

                  <div className="p-0">
                    {group.meals.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/30 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-3 font-medium">Món Ăn</th>
                            <th className="px-6 py-3 font-medium w-32">Khẩu Phần</th>
                            <th className="px-6 py-3 font-medium w-48 hidden md:table-cell">Thành Phần (C/P/F)</th>
                            <th className="px-6 py-3 font-medium text-right w-32">Năng Lượng</th>
                            <th className="px-6 py-3 w-16" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {group.meals.map((meal) => (
                            <tr key={meal.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0 overflow-hidden">
                                    {meal.food?.imageUrl
                                      ? <img src={meal.food.imageUrl} alt={meal.food.name} className="w-full h-full object-cover" />
                                      : meal.food?.name?.charAt(0) ?? '?'
                                    }
                                  </div>
                                  <span className="font-bold text-gray-900 text-sm">{meal.food?.name ?? 'Không rõ'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-500">x{meal.quantity}</td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                <div className="flex gap-2 text-xs font-bold">
                                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{Math.round(meal.carbs)}g C</span>
                                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{Math.round(meal.protein)}g P</span>
                                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{Math.round(meal.fat)}g F</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-black text-gray-900">{meal.calories}</span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <span className="text-sm font-medium text-gray-500">Chưa ghi nhận món ăn nào cho bữa này</span>
                        <button
                          onClick={() => setAddModal({ mealType: group.id })}
                          className="text-emerald-500 font-bold text-sm hover:underline flex items-center gap-1"
                        >
                          <Plus size={14} /> Thêm món ngay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DiaryPage;
