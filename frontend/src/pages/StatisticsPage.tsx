import { type ElementType, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart2,
  Calendar,
  Flame,
  Loader2,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getNutritionOverview,
  type StatisticsGroupBy,
} from '../services/statistics.service';

type OverviewBucket = {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  days: number;
  loggedDays: number;
};

type OverviewResponse = {
  range: {
    days: number;
    groupBy: StatisticsGroupBy;
    startDate: string;
    endDate: string;
  };
  target: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  summary: {
    total: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    average: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    activeDays: number;
    streak: number;
    bestBucket: OverviewBucket | null;
    worstBucket: OverviewBucket | null;
  };
  daily: Array<{
    date: string;
    dayLabel: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    hasLog: boolean;
  }>;
  buckets: OverviewBucket[];
};

const buildPeriodOptions = (isEn: boolean): Array<{ value: 7 | 14 | 30; label: string }> => [
  { value: 7, label: isEn ? '7 days' : '7 ngày' },
  { value: 14, label: isEn ? '14 days' : '14 ngày' },
  { value: 30, label: isEn ? '30 days' : '30 ngày' },
];

const buildGroupOptions = (isEn: boolean): Array<{ value: StatisticsGroupBy; label: string }> => [
  { value: 'day', label: isEn ? 'By day' : 'Theo ngày' },
  { value: 'week', label: isEn ? 'By week' : 'Theo tuần' },
  { value: 'month', label: isEn ? 'By month' : 'Theo tháng' },
];

const formatNumber = (value: number, isEn: boolean) =>
  Math.round(value || 0).toLocaleString(isEn ? 'en-US' : 'vi-VN');

const shortBucketLabel = (bucket: OverviewBucket, groupBy: StatisticsGroupBy, isEn: boolean) => {
  if (groupBy === 'day') return bucket.label.slice(0, 5);
  if (groupBy === 'week') {
    const parts = bucket.startDate.split('-');
    return `W${parts[2]}/${parts[1]}`;
  }
  const month = bucket.key.split('-')[1];
  return `${isEn ? 'M' : 'T'}${month}`;
};

const MiniBarChart = ({
  data,
  goal,
  groupBy,
  isEn,
}: {
  data: OverviewBucket[];
  goal: number;
  groupBy: StatisticsGroupBy;
  isEn: boolean;
}) => {
  const maxValue = Math.max(goal, ...data.map((item) => item.calories), 1);

  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((bucket, index) => {
        const barHeight = Math.max(4, Math.round((bucket.calories / maxValue) * 100));
        const isLatest = index === data.length - 1;

        return (
          <div key={bucket.key} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {formatNumber(bucket.calories, isEn)} kcal
            </div>
            <div className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse" style={{ height: '90%' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isLatest ? 'bg-emerald-500' : 'bg-gray-200'}`}
                style={{ height: `${barHeight}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{shortBucketLabel(bucket, groupBy, isEn)}</span>
          </div>
        );
      })}
    </div>
  );
};

const MacroRing = ({
  protein,
  carbs,
  fat,
  isEn,
}: {
  protein: number;
  carbs: number;
  fat: number;
  isEn: boolean;
}) => {
  const total = protein + carbs + fat || 1;
  const p = (protein / total) * 100;
  const c = (carbs / total) * 100;
  const f = (fat / total) * 100;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct: number) => (pct / 100) * circumference;

  let offset = 0;
  const segments = [
    { value: p, color: '#10b981', label: 'Protein' },
    { value: c, color: '#f59e0b', label: 'Carbs' },
    { value: f, color: '#60a5fa', label: isEn ? 'Fat' : 'Chất béo' },
  ];

  return (
    <div className="flex items-center gap-6">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        {segments.map((segment, idx) => {
          const element = (
            <circle
              key={idx}
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="10"
              strokeDasharray={`${dash(segment.value)} ${circumference - dash(segment.value)}`}
              strokeDashoffset={-offset * (circumference / 100)}
              strokeLinecap="round"
              transform="rotate(-90 45 45)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          );
          offset += segment.value;
          return element;
        })}
      </svg>

      <div className="space-y-2">
        {[
          { label: 'Protein', value: Math.round(protein), color: 'bg-emerald-500' },
          { label: 'Carbs', value: Math.round(carbs), color: 'bg-amber-400' },
          { label: isEn ? 'Fat' : 'Chất béo', value: Math.round(fat), color: 'bg-blue-400' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-500 font-medium w-12">{item.label}</span>
            <span className="text-xs font-black text-gray-900">{item.value}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: ElementType;
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

const StatisticsPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [groupBy, setGroupBy] = useState<StatisticsGroupBy>('day');
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const periodOptions = useMemo(() => buildPeriodOptions(isEn), [isEn]);
  const groupOptions = useMemo(() => buildGroupOptions(isEn), [isEn]);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      try {
        const data = (await getNutritionOverview(period, groupBy)) as OverviewResponse;
        setOverview(data);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOverview();
  }, [period, groupBy]);

  const buckets = overview?.buckets || [];
  const target = overview?.target || {
    calories: user?.profile?.targetCalories || 2000,
    protein: user?.profile?.targetProtein || 150,
    fat: user?.profile?.targetFat || 55,
    carbs: user?.profile?.targetCarbs || 250,
  };
  const summary = overview?.summary || {
    total: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    average: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    activeDays: 0,
    streak: 0,
    bestBucket: null,
    worstBucket: null,
  };

  const chartTitle = useMemo(() => {
    if (groupBy === 'week') return isEn ? 'Calories by week' : 'Lượng calo theo tuần';
    if (groupBy === 'month') return isEn ? 'Calories by month' : 'Lượng calo theo tháng';
    return isEn ? 'Calories by day' : 'Lượng calo theo ngày';
  }, [groupBy, isEn]);

  const openBucketDetail = (bucket: OverviewBucket) => {
    navigate(`/diary?date=${bucket.startDate}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-emerald-500" /> {isEn ? 'Nutrition Statistics' : 'Thống kê dinh dưỡng'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEn
              ? 'Choose a time range and group data by day, week, or month.'
              : 'Chọn khung thời gian và cách gom nhóm theo ngày, tuần, tháng.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${period === option.value ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
            {groupOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setGroupBy(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${groupBy === option.value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 size={48} className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Flame}
              label={isEn ? 'Avg calories/day' : 'TB calo/ngày'}
              value={formatNumber(summary.average.calories, isEn)}
              sub={`${isEn ? 'Goal' : 'Mục tiêu'}: ${formatNumber(target.calories, isEn)} kcal`}
              color="bg-amber-50 text-amber-500"
            />
            <StatCard
              icon={Target}
              label={isEn ? 'Avg protein/day' : 'TB protein/ngày'}
              value={`${Math.round(summary.average.protein || 0)}g`}
              sub={`${isEn ? 'Goal' : 'Mục tiêu'}: ${Math.round(target.protein || 150)}g`}
              color="bg-emerald-50 text-emerald-500"
            />
            <StatCard
              icon={Award}
              label="Streak"
              value={summary.streak}
              sub={isEn ? 'Consecutive logged days' : 'Số ngày ghi nhận liên tiếp'}
              color="bg-red-50 text-red-500"
            />
            <StatCard
              icon={Calendar}
              label={isEn ? 'Active days' : 'Ngày hoạt động'}
              value={summary.activeDays}
              sub={isEn ? `In the last ${period} days` : `Trong ${period} ngày qua`}
              color="bg-blue-50 text-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[28px] shadow-sm border border-gray-100 p-7">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{chartTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isEn ? 'Range' : 'Khung'} {period} {isEn ? 'days' : 'ngày'}, {isEn ? 'grouped' : 'gộp nhóm'}{' '}
                    {groupOptions.find((item) => item.value === groupBy)?.label.toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">{formatNumber(summary.total.calories, isEn)}</p>
                  <p className="text-xs text-gray-400">{isEn ? 'kcal total' : 'kcal tổng cộng'}</p>
                </div>
              </div>

              <MiniBarChart data={buckets} goal={target.calories} groupBy={groupBy} isEn={isEn} />

              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {isEn ? 'Goal' : 'Mục tiêu'} {formatNumber(target.calories, isEn)} kcal
              </p>

              {!!summary.bestBucket && (
                <div className="mt-5 pt-5 border-t border-gray-50 flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <div>
                        <p className="text-xs text-gray-500">{isEn ? 'Highest point' : 'Mốc cao nhất'}</p>
                        <p className="text-sm font-black text-gray-900">
                          {summary.bestBucket.label} - {formatNumber(summary.bestBucket.calories, isEn)} kcal
                        </p>
                      </div>
                    </div>

                  {!!summary.worstBucket && (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
                      <TrendingDown size={16} className="text-red-400" />
                      <div>
                        <p className="text-xs text-gray-500">{isEn ? 'Lowest point' : 'Mốc thấp nhất'}</p>
                        <p className="text-sm font-black text-gray-900">
                          {summary.worstBucket.label} - {formatNumber(summary.worstBucket.calories, isEn)} kcal
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-7 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{isEn ? 'Macro ratio' : 'Tỉ lệ macro'}</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {isEn ? 'Average on days with logs' : 'Trung bình theo ngày có log'}
                </p>
                <MacroRing
                  protein={summary.average.protein || 0}
                  carbs={summary.average.carbs || 0}
                  fat={summary.average.fat || 0}
                  isEn={isEn}
                />
              </div>

              <div className="mt-6 space-y-3 pt-5 border-t border-gray-50">
                {[
                  { label: isEn ? 'Total protein' : 'Tổng protein', value: summary.total.protein, unit: 'g', color: 'text-emerald-600' },
                  { label: isEn ? 'Total carbs' : 'Tổng carbs', value: summary.total.carbs, unit: 'g', color: 'text-amber-600' },
                  { label: isEn ? 'Total fat' : 'Tổng chất béo', value: summary.total.fat, unit: 'g', color: 'text-blue-600' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-black ${item.color}`}>{Math.round(item.value || 0)}{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">{isEn ? 'Detail table' : 'Bảng chi tiết'}</h2>
              <p className="text-xs text-gray-500">
                {buckets.length} {isEn ? 'data points' : 'mốc dữ liệu'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    {(isEn
                      ? ['Point', 'Date range', 'Calories', 'Protein', 'Carbs', 'Fat', 'Target']
                      : ['Mốc', 'Khoảng ngày', 'Calo', 'Protein', 'Carbs', 'Chất béo', 'Mục tiêu']
                    ).map((column) => (
                      <th key={column} className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {buckets.map((bucket) => {
                    const percent = target.calories > 0
                      ? Math.round((bucket.calories / target.calories) * 100)
                      : 0;
                    const good = percent >= 70 && percent <= 110;

                    return (
                      <tr
                        key={bucket.key}
                        onClick={() => openBucketDetail(bucket)}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        title={isEn ? 'Open meal detail by date' : 'Mở chi tiết bữa ăn theo ngày'}
                      >
                        <td className="px-6 py-3 font-bold text-gray-900 text-sm">{bucket.label}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{bucket.startDate} - {bucket.endDate}</td>
                        <td className="px-6 py-3 font-black text-gray-900">{formatNumber(bucket.calories, isEn)}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{Math.round(bucket.protein || 0)}g</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{Math.round(bucket.carbs || 0)}g</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{Math.round(bucket.fat || 0)}g</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${good ? 'bg-emerald-500' : 'bg-red-300'}`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${good ? 'text-emerald-600' : 'text-red-400'}`}>
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {buckets.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                        {isEn ? 'No data for the current filter.' : 'Không có dữ liệu cho bộ lọc hiện tại.'}
                      </td>
                    </tr>
                  )}
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

