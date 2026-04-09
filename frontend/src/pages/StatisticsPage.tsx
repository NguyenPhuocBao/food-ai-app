import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Flame, Target, Droplets, Calendar, Award, Loader2 } from 'lucide-react';
import { getWeeklyStats, getTrends } from '../services/statistics.service';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

// ── Mini Bar Chart component (no library needed) ─────────────────────────
const MiniBarChart = ({
  data,
  goal,
  color = 'bg-emerald-500',
}: {
  data: { day: string; calories: number }[];
  goal: number;
  color?: string;
}) => {
  const max = Math.max(...data.map(d => d.calories), goal);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => {
        const height = max > 0 ? (d.calories / max) * 100 : 0;
        const isToday = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {d.calories} kcal
            </div>
            <div className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse" style={{ height: '90%' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? color : 'bg-gray-200'}`}
                style={{ height: `${Math.max(4, height)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{d.day.slice(0, 2)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Macro Ring (SVG donut) ───────────────────────────────────────────────
const MacroRing = ({
  protein,
  carbs,
  fat,
}: { protein: number; carbs: number; fat: number }) => {
  const total = protein + carbs + fat || 1;
  const p = (protein / total) * 100;
  const c = (carbs / total) * 100;
  const f = (fat / total) * 100;

  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = (pct: number) => (pct / 100) * circ;

  let offset = 0;
  const segments = [
    { val: p, color: '#10b981', label: 'Protein' },
    { val: c, color: '#f59e0b', label: 'Carbs' },
    { val: f, color: '#60a5fa', label: 'Fat' },
  ];

  return (
    <div className="flex items-center gap-6">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        {segments.map((seg, i) => {
          const el = (
            <circle
              key={i}
              cx="45" cy="45" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${dash(seg.val)} ${circ - dash(seg.val)}`}
              strokeDashoffset={-offset * (circ / 100)}
              strokeLinecap="round"
              transform="rotate(-90 45 45)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          );
          offset += seg.val;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        {[
          { label: 'Protein', val: Math.round(protein), color: 'bg-emerald-500' },
          { label: 'Carbs', val: Math.round(carbs), color: 'bg-amber-400' },
          { label: 'Fat', val: Math.round(fat), color: 'bg-blue-400' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-xs text-gray-500 font-medium w-12">{s.label}</span>
            <span className="text-xs font-black text-gray-900">{s.val}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) => (
  <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────
const StatisticsPage = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    fetchAll();
  }, [period]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [weekly, trend] = await Promise.all([
        getWeeklyStats(),
        getTrends(period),
      ]);
      setWeeklyData(weekly);
      setTrendData(trend);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const daily: any[] = weeklyData?.daily ?? [];
  const summary = weeklyData?.summary ?? {};
  const avg = summary?.average ?? {};
  const bestDay = summary?.bestDay ?? null;

  // Streak counting from trendData
  const trendDays: any[] = trendData?.trend ?? [];
  const streak = (() => {
    let count = 0;
    for (let i = trendDays.length - 1; i >= 0; i--) {
      if (trendDays[i].calories > 0) count++;
      else break;
    }
    return count;
  })();

  const totalCalories = daily.reduce((s: number, d: any) => s + (d.calories || 0), 0);
  const totalProtein = daily.reduce((s: number, d: any) => s + (d.protein || 0), 0);
  const totalCarbs = daily.reduce((s: number, d: any) => s + (d.carbs || 0), 0);
  const totalFat = daily.reduce((s: number, d: any) => s + (d.fat || 0), 0);
  const activeDays = daily.filter((d: any) => d.calories > 0).length;

  const goalCalories = user?.profile?.targetCalories ?? 2000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-emerald-500" /> Thống Kê Dinh Dưỡng
          </h1>
          <p className="text-gray-500 mt-1">Phân tích lượng dinh dưỡng nạp vào theo thời gian.</p>
        </div>
        <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {([7, 14, 30] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${period === p ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {p} ngày
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 size={48} className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-8">

          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Flame}
              label="TB Calo / ngày"
              value={`${Math.round(avg.calories ?? 0).toLocaleString()}`}
              sub={`Mục tiêu: ${goalCalories} kcal`}
              color="bg-amber-50 text-amber-500"
            />
            <StatCard
              icon={Target}
              label="TB Protein / ngày"
              value={`${Math.round(avg.protein ?? 0)}g`}
              sub={`Mục tiêu: ${user?.profile?.targetProtein ?? 150}g`}
              color="bg-emerald-50 text-emerald-500"
            />
            <StatCard
              icon={Award}
              label="Ngày Streak 🔥"
              value={streak}
              sub="Ngày ghi nhận liên tục"
              color="bg-red-50 text-red-500"
            />
            <StatCard
              icon={Calendar}
              label="Ngày Hoạt Động"
              value={activeDays}
              sub={`Trong ${period} ngày qua`}
              color="bg-blue-50 text-blue-500"
            />
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Calorie Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-[28px] shadow-sm border border-gray-100 p-7">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Lượng Calo Theo Tuần</h2>
                  <p className="text-sm text-gray-500 mt-1">So sánh với mục tiêu {goalCalories.toLocaleString()} kcal</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">{totalCalories.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">kcal tổng tuần</p>
                </div>
              </div>

              {/* Guide line */}
              <div className="relative">
                <MiniBarChart
                  data={daily.map((d: any) => ({ day: d.day, calories: d.calories || 0 }))}
                  goal={goalCalories}
                  color="bg-emerald-500"
                />
                {/* Goal line text */}
                <p className="text-[10px] text-gray-400 mt-1 text-right">— Mục tiêu {goalCalories} kcal</p>
              </div>

              {/* Best/Worst */}
              {bestDay && (
                <div className="mt-5 pt-5 border-t border-gray-50 flex gap-4">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500">Ngày tốt nhất</p>
                      <p className="text-sm font-black text-gray-900">{bestDay.day} · {bestDay.calories} kcal</p>
                    </div>
                  </div>
                  {summary.worstDay && (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
                      <TrendingDown size={16} className="text-red-400" />
                      <div>
                        <p className="text-xs text-gray-500">Ngày thấp nhất</p>
                        <p className="text-sm font-black text-gray-900">{summary.worstDay.day} · {summary.worstDay.calories} kcal</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Macro Breakdown */}
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-7 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Phân Bổ Macro</h2>
                <p className="text-sm text-gray-500 mb-6">Trung bình mỗi ngày trong tuần</p>
                <MacroRing
                  protein={avg.protein ?? 0}
                  carbs={avg.carbs ?? 0}
                  fat={avg.fat ?? 0}
                />
              </div>

              <div className="mt-6 space-y-3 pt-5 border-t border-gray-50">
                {[
                  { label: 'Tổng Protein', val: Math.round(totalProtein), unit: 'g', color: 'text-emerald-600' },
                  { label: 'Tổng Carbs', val: Math.round(totalCarbs), unit: 'g', color: 'text-amber-600' },
                  { label: 'Tổng Fat', val: Math.round(totalFat), unit: 'g', color: 'text-blue-600' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-black ${item.color}`}>{item.val}{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trend Table */}
          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Chi Tiết Từng Ngày</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Đạt mục tiêu
                <span className="w-3 h-3 rounded bg-red-300 inline-block ml-2" /> Chưa đạt
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    {['Ngày', 'Calo', 'Protein', 'Carbs', 'Fat', 'So với mục tiêu'].map(col => (
                      <th key={col} className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {daily.map((d: any, i: number) => {
                    const pct = goalCalories > 0 ? Math.round((d.calories / goalCalories) * 100) : 0;
                    const ok = pct >= 70 && pct <= 110;
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-3 font-bold text-gray-900 text-sm">{d.day}</td>
                        <td className="px-6 py-3 font-black text-gray-900">{d.calories > 0 ? d.calories.toLocaleString() : '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{d.protein > 0 ? `${Math.round(d.protein)}g` : '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{d.carbs > 0 ? `${Math.round(d.carbs)}g` : '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{d.fat > 0 ? `${Math.round(d.fat)}g` : '—'}</td>
                        <td className="px-6 py-3">
                          {d.calories > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[80px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-300'}`}
                                  style={{ width: `${Math.min(100, pct)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${ok ? 'text-emerald-600' : 'text-red-400'}`}>{pct}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">Chưa ghi</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
