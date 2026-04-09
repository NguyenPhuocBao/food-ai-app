import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Flame, Droplets, Target, ChevronRight, MessageSquare, Send, Sparkles, Loader2, Calendar, UtensilsCrossed, BookOpen, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDailyStats } from '../services/statistics.service';
import { getActiveMealPlan, type MealPlan } from '../services/mealplan.service';
import { getMealHistory } from '../services/meal.service';

interface DailyStatsData {
  nutrition: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalMeals: number;
  };
  goal: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  progress: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const HomePage = () => {
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState<DailyStatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  useEffect(() => {
    getDailyStats()
      .then((data: any) => setDailyStats(data))
      .catch(() => setDailyStats(null))
      .finally(() => setLoadingStats(false));

    // Load active meal plan + recent meals in parallel
    Promise.all([
      getActiveMealPlan().catch(() => null),
      getMealHistory(5).catch(() => []),
    ]).then(([plan, meals]) => {
      setActivePlan(plan);
      setRecentMeals(meals);
    }).finally(() => setLoadingPlan(false));
  }, []);

  const nutrition = dailyStats?.nutrition;
  const goal = dailyStats?.goal;
  const progress = dailyStats?.progress;

  const caloriesConsumed = nutrition?.totalCalories ?? 0;
  const caloriesGoal = goal?.calories ?? 2000;
  const caloriesPercent = Math.min(100, Math.round((caloriesConsumed / caloriesGoal) * 100));

  // Get today's meals from active meal plan (dayOfWeek)
  const todayDayOfWeek = new Date().getDay();
  const todayPlanMeals = activePlan?.details?.filter(d => d.dayOfWeek === todayDayOfWeek) ?? [];
  const MEAL_LABELS: Record<string, string> = {
    BREAKFAST: 'Bữa Sáng',
    LUNCH: 'Bữa Trưa',
    DINNER: 'Bữa Tối',
    SNACK: 'Ăn Nhẹ',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Main Content (occupies 8 columns on large screens) */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Hero Section */}
           <div className="bg-emerald-600 rounded-[32px] overflow-hidden relative shadow-xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
              <div className="absolute bottom-0 right-10 w-32 h-32 rounded-full bg-amber-400 opacity-20 blur-2xl"></div>
              <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white space-y-2">
                  <p className="text-emerald-100 font-medium tracking-wide flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-300" /> Cập nhật hôm nay
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight">
                    {getGreeting()}, <br />
                    {user?.name || 'Bạn'}!
                  </h1>
                  <p className="text-emerald-50 max-w-md mt-4 text-sm md:text-base leading-relaxed">
                    Hãy theo dõi dinh dưỡng hôm nay của bạn và duy trì thói quen ăn uống lành mạnh nhé!
                  </p>
                </div>
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-md rounded-[24px] p-6 text-white w-full md:w-auto border border-white/20">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">Lượng Calo</span>
                    <Flame size={20} className="text-amber-300" />
                  </div>
                  {loadingStats ? (
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline mb-4">
                       <span className="text-4xl font-black tracking-tight">{caloriesConsumed.toLocaleString()}</span>
                       <span className="text-emerald-100 ml-1 text-sm">/ {caloriesGoal.toLocaleString()} kcal</span>
                    </div>
                  )}
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-300 rounded-full transition-all duration-700" style={{ width: `${caloriesPercent}%` }}></div>
                  </div>
                  <p className="text-emerald-100 text-xs mt-2">{caloriesPercent}% mục tiêu hàng ngày</p>
                </div>
              </div>
           </div>

           {/* Stats Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Protein nạp</p>
                  {loadingStats ? (
                    <p className="text-xl font-bold text-gray-400">--</p>
                  ) : (
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(nutrition?.totalProtein ?? 0)}g{' '}
                      <span className="text-sm font-normal text-gray-400">/ {Math.round(goal?.protein ?? 150)}g</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Flame size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Carbs nạp</p>
                  {loadingStats ? (
                    <p className="text-xl font-bold text-gray-400">--</p>
                  ) : (
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(nutrition?.totalCarbs ?? 0)}g{' '}
                      <span className="text-sm font-normal text-gray-400">/ {Math.round(goal?.carbs ?? 250)}g</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Droplets size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Chất béo</p>
                  {loadingStats ? (
                    <p className="text-xl font-bold text-gray-400">--</p>
                  ) : (
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(nutrition?.totalFat ?? 0)}g{' '}
                      <span className="text-sm font-normal text-gray-400">/ {Math.round(goal?.fat ?? 55)}g</span>
                    </p>
                  )}
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Link to="/foods" className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-[16px] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                 <UtensilsCrossed size={22} />
               </div>
               <h3 className="font-black text-gray-900">Khám phá món ăn</h3>
               <p className="text-sm text-gray-500 mt-2">Xem chi tiết dinh dưỡng và mở trang từng món để đọc kỹ hơn.</p>
             </Link>
             <Link to="/recipes" className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-[16px] bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                 <BookOpen size={22} />
               </div>
               <h3 className="font-black text-gray-900">Xem công thức</h3>
               <p className="text-sm text-gray-500 mt-2">Duyệt công thức phổ biến, mới thêm và tìm theo món ăn bạn muốn nấu.</p>
             </Link>
             <Link to="/meal-plans" className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                 <CalendarDays size={22} />
               </div>
               <h3 className="font-black text-gray-900">Tạo meal plan</h3>
               <p className="text-sm text-gray-500 mt-2">Sắp xếp món theo từng ngày và kích hoạt kế hoạch ăn uống phù hợp.</p>
             </Link>
           </div>

           {/* Meal Plan / Recommendations */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {activePlan ? (
                    <span className="flex items-center gap-2">
                      <Calendar size={20} className="text-emerald-500" />
                      Kế hoạch hôm nay — <span className="text-emerald-600">{activePlan.name}</span>
                    </span>
                  ) : 'Đề Xuất Dành Riêng Cho Bạn'}
                </h2>
                <Link to="/diary" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                  Nhật ký <ChevronRight size={16} />
                </Link>
              </div>

              {loadingPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white rounded-[24px] border border-gray-100 shadow-sm h-56 animate-pulse" />
                  ))}
                </div>
              ) : activePlan && todayPlanMeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {todayPlanMeals.slice(0, 3).map((detail, idx) => (
                    <motion.div
                      key={detail.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                    >
                      <div className="h-40 overflow-hidden relative bg-emerald-50 flex items-center justify-center">
                        {detail.food.imageUrl ? (
                          <img src={detail.food.imageUrl} alt={detail.food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-5xl font-black text-emerald-200">{detail.food.name.charAt(0)}</span>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900">
                          {detail.food.calories * detail.quantity} kcal
                        </div>
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {MEAL_LABELS[detail.mealType] ?? detail.mealType}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 leading-tight">{detail.food.name}</h3>
                          <div className="flex gap-2 text-xs font-bold">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{detail.food.protein}g P</span>
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{detail.food.carbs}g C</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Khẩu phần: x{detail.quantity}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Fallback: recent meals or empty state
                recentMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recentMeals.slice(0, 3).map((meal: any, idx: number) => (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                      >
                        <div className="h-40 bg-gray-50 flex items-center justify-center">
                          {meal.food?.imageUrl ? (
                            <img src={meal.food.imageUrl} alt={meal.food.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl font-black text-gray-200">{meal.food?.name?.charAt(0) ?? '?'}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1">{meal.food?.name}</h3>
                          <p className="text-xs text-gray-400 font-medium">{meal.calories} kcal</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                    <Calendar size={40} className="text-gray-200" />
                    <p className="font-medium text-gray-500">Chưa có kế hoạch bữa ăn nào</p>
                    <p className="text-sm">Hãy tạo Meal Plan để AI gợi ý thực đơn phù hợp cho bạn.</p>
                  </div>
                )
              )}
           </div>

        </div>

        {/* Right Sidebar: Quick AI Chat (occupies 4 columns on large screens) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-[600px] border border-gray-100 bg-white shadow-sm flex flex-col rounded-[32px] overflow-hidden">
           {/* Chat Header */}
           <div className="px-6 py-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MessageSquare size={20} /> Trợ Lý AI
                </h3>
                <p className="text-emerald-100 text-xs font-medium mt-1">Sẵn sàng phân tích dinh dưỡng</p>
              </div>
           </div>

           {/* Chat Body Mock */}
           <div className="flex-1 p-5 overflow-y-auto bg-gray-50 space-y-4">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm text-sm text-gray-700 shadow-sm">
                Chào {user?.name?.split(' ').pop() || 'bạn'}! Hôm nay bạn đã nạp được{' '}
                <span className="font-bold text-emerald-600">{caloriesConsumed} kcal</span>
                {caloriesGoal > 0 && ` trên tổng mục tiêu ${caloriesGoal} kcal`}. Bạn muốn lên thực đơn cho bữa tối hay phân tích thêm không?
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                <button className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-xl shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                  Kiểm tra Calo
                </button>
                <button className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-xl shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                  Gợi ý bữa phụ
                </button>
              </div>
           </div>

           {/* Chat Input */}
           <div className="p-4 bg-white border-t border-gray-100 shrink-0">
             <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full">
               <input 
                 type="text" 
                 placeholder="Hỏi FoodAI..." 
                 className="flex-1 bg-transparent border-0 focus:ring-0 text-sm p-0 text-gray-900"
               />
               <button className="text-emerald-500 hover:text-emerald-600">
                 <Send size={18} />
               </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
