import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  CalendarDays,
  Camera,
  Headset,
  Heart,
  Sparkles,
  Users,
  Utensils,
} from 'lucide-react';
import { getSystemStats } from '../../services/admin.service';
import AdvancedStatCard from '../../components/admin/AdvancedStatCard';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

interface AdminDashboardStats {
  users: { total: number; active: number; newThisWeek: number };
  foods: { total: number; withRecipes: number };
  recipes: { total: number };
  meals: { total: number; today: number };
  scans: { total: number; today: number; confirmed: number };
  library: { favorites: number; reviews: number };
  mealPlans: { total: number; active: number };
  support: {
    totalSessions: number;
    open: number;
    pending: number;
    closed: number;
    today: number;
    pendingOver24h: number;
    totalMessages: number;
    avgFirstResponseMinutes30d: number | null;
    firstResponseSamples30d: number;
  };
  topCategories: Array<{ name: string; value: number }>;
  weeklyOverview: Array<{
    date: string;
    meals: number;
    calories: number;
    scans: number;
    confirmedScans: number;
    saves: number;
    newUsers: number;
  }>;
  popularFoods: Array<{
    id: number;
    name: string;
    category: string;
    calories: number;
    popularity: number;
    recipe?: { id: number; title: string } | null;
    _count?: { favorites: number; reviews: number; meals: number };
  }>;
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
    isOnline: boolean;
    _count: { meals: number; scanHistory: number; favorites: number; mealPlans: number };
  }>;
  activeProvider: 'db' | 'memory';
  activeWindowMinutes: number;
}

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDay = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(parseDateKey(value));

const AdminDashboardV2 = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await getSystemStats();
      setStats(statsData);
    };

    fetchStats();
  }, []);

  const chartData = useMemo(
    () =>
      (stats?.weeklyOverview || []).map((item) => ({
        ...item,
        label: formatDay(item.date),
      })),
    [stats],
  );

  const recipeCoverage = stats?.foods.total
    ? Math.round((stats.foods.withRecipes / stats.foods.total) * 100)
    : 0;

  const scanAccuracy = stats?.scans.total
    ? Math.round((stats.scans.confirmed / stats.scans.total) * 100)
    : 0;

  const activeUserRate = stats?.users.total
    ? Math.round((stats.users.active / stats.users.total) * 100)
    : 0;

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="h-14 w-80 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-36 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const supportStats = stats.support ?? {
    totalSessions: 0,
    open: 0,
    pending: 0,
    closed: 0,
    today: 0,
    pendingOver24h: 0,
    totalMessages: 0,
    avgFirstResponseMinutes30d: null,
    firstResponseSamples30d: 0,
  };

  const firstResponseLabel = supportStats.avgFirstResponseMinutes30d === null
    ? 'Chua co du lieu'
    : `${supportStats.avgFirstResponseMinutes30d} phut`;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),_transparent_30%),linear-gradient(135deg,_#111827,_#0f172a_60%,_#1d4ed8)] text-white shadow-2xl">
        <div className="px-8 py-10 md:px-10 md:py-12 flex flex-col xl:flex-row gap-8 justify-between">
          <div className="max-w-3xl">
            <p className="text-blue-200 font-bold text-sm tracking-[0.22em] uppercase mb-4">Admin overview</p>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              Dashboard dong bo voi trai nghiem nguoi dung
            </h1>
            <p className="text-blue-50/85 mt-4 max-w-2xl leading-relaxed">
              Theo doi users, foods, recipes, meal plans, AI scan va thu vien luu trong mot giao dien admin thong nhat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 min-w-[280px]">
            <div className="rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <p className="text-sm text-blue-100">Dang online</p>
              <p className="text-3xl font-black mt-2">{stats.users.active}</p>
              <p className="text-xs text-blue-100 mt-2">{activeUserRate}% tong tai kho?n</p>
            </div>
            <div className="rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <p className="text-sm text-blue-100">Cua so online</p>
              <p className="text-3xl font-black mt-2">{stats.activeWindowMinutes}m</p>
              <p className="text-xs text-blue-100 mt-2">Provider: {stats.activeProvider}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AdvancedStatCard title="Nguoi dung" value={stats.users.total} icon={Users} color="#2563EB" />
        <AdvancedStatCard title="Mon an / Recipe" value={`${stats.foods.total} / ${stats.recipes.total}`} icon={Utensils} color="#10B981" />
        <AdvancedStatCard title="Meals hom nay" value={stats.meals.today} icon={Activity} color="#F97316" />
        <AdvancedStatCard title="Scan AI hom nay" value={stats.scans.today} icon={Camera} color="#F59E0B" />
        <AdvancedStatCard title="Meal plan active" value={stats.mealPlans.active} icon={CalendarDays} color="#8B5CF6" />
        <AdvancedStatCard title="CSKH pending" value={supportStats.pending} icon={Headset} color="#F97316" />
        <AdvancedStatCard title="Luot luu thu vien" value={stats.library.favorites} icon={Heart} color="#EC4899" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Hoat dong 7 ngay gan nhat</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Meals, scans va luot luu thu vien</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Meals</span>
              <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Scans</span>
              <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-300"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Saves</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="mealsFillV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="scansFillV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="savesFillV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ borderRadius: '16px', borderColor: '#E5E7EB' }} />
              <Area type="monotone" dataKey="meals" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#mealsFillV2)" />
              <Area type="monotone" dataKey="scans" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#scansFillV2)" />
              <Area type="monotone" dataKey="saves" stroke="#EC4899" strokeWidth={3} fillOpacity={1} fill="url(#savesFillV2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Co cau danh muc mon an</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-5">Du lieu category thuc te tren he thong</p>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.topCategories}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={104}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.topCategories.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3 mt-4">
            {stats.topCategories.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-gray-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-bold text-gray-900 dark:text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Top mon an pho bien</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Ket hop favorites, meals va do phu recipe</p>
            </div>
            <Sparkles size={18} className="text-amber-500 dark:text-amber-300" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/70 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-3 text-left">Mon an</th>
                  <th className="px-6 py-3 text-left">Danh muc</th>
                  <th className="px-6 py-3 text-left">Recipe</th>
                  <th className="px-6 py-3 text-left">Favorites</th>
                  <th className="px-6 py-3 text-left">Meals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {stats.popularFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{food.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{food.calories} kcal</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-300">{food.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        food.recipe
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {food.recipe ? 'Co recipe' : 'Chua co'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-300">{food._count?.favorites ?? food.popularity}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-300">{food._count?.meals ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">KPI cham soc khach hang</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Theo doi ticket va toc do phan hoi</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">Pending</p>
                <p className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1">{supportStats.pending}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">Open</p>
                <p className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1">{supportStats.open}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 p-3">
                <p className="text-xs text-rose-700 dark:text-rose-300">Pending qua 24h</p>
                <p className="text-2xl font-black text-rose-800 dark:text-rose-200 mt-1">{supportStats.pendingOver24h}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Ticket hom nay</p>
                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">{supportStats.today}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 bg-gray-50/60 dark:bg-slate-800/40">
              <p className="text-xs text-gray-500 dark:text-slate-400">First response TB (30 ngay)</p>
              <p className="text-xl font-black text-gray-900 dark:text-slate-100 mt-1">{firstResponseLabel}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Tren {supportStats.firstResponseSamples30d} ticket ?? co user message va admin reply
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Suc khoe san pham</h2>
            <div className="space-y-4 mt-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-slate-400">Recipe coverage</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">{recipeCoverage}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${recipeCoverage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-slate-400">Scan xac nhan</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">{scanAccuracy}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${scanAccuracy}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-slate-400">User dang online</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">{activeUserRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${activeUserRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Nguoi dung moi gan day</h2>
            <div className="space-y-4 mt-5">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-gray-100 dark:border-slate-700 p-4 bg-gray-50/40 dark:bg-slate-800/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                      user.isOnline
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {user.isOnline ? 'Dang online' : 'Offline'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                    <div className="rounded-xl bg-white dark:bg-slate-800 py-2">
                      <p className="font-black text-gray-900 dark:text-slate-100">{user._count.meals}</p>
                      <p className="text-gray-400 dark:text-slate-500 mt-1">Meals</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-800 py-2">
                      <p className="font-black text-gray-900 dark:text-slate-100">{user._count.scanHistory}</p>
                      <p className="text-gray-400 dark:text-slate-500 mt-1">Scans</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-800 py-2">
                      <p className="font-black text-gray-900 dark:text-slate-100">{user._count.favorites}</p>
                      <p className="text-gray-400 dark:text-slate-500 mt-1">Saves</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-800 py-2">
                      <p className="font-black text-gray-900 dark:text-slate-100">{user._count.mealPlans}</p>
                      <p className="text-gray-400 dark:text-slate-500 mt-1">Plans</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardV2;
