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

const PERIOD_OPTIONS: Array<{ value: 7 | 14 | 30; label: string }> = [
  { value: 7, label: '7 ngay' },
  { value: 14, label: '14 ngay' },
  { value: 30, label: '30 ngay' },
];

const GROUP_OPTIONS: Array<{ value: StatisticsGroupBy; label: string }> = [
  { value: 'day', label: 'Theo ngay' },
  { value: 'week', label: 'Theo tuan' },
  { value: 'month', label: 'Theo thang' },
];

const formatNumber = (value: number) => Math.round(value || 0).toLocaleString('vi-VN');

const shortBucketLabel = (bucket: OverviewBucket, groupBy: StatisticsGroupBy) => {
  if (groupBy === 'day') return bucket.label.slice(0, 5);
  if (groupBy === 'week') {
    const parts = bucket.startDate.split('-');
    return `W${parts[2]}/${parts[1]}`;
  }
  const month = bucket.key.split('-')[1];
  return `T${month}`;
};

const MiniBarChart = ({
  data,
  goal,
  groupBy,
}: {
  data: OverviewBucket[];
  goal: number;
  groupBy: StatisticsGroupBy;
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
              {formatNumber(bucket.calories)} kcal
            </div>
            <div className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse" style={{ height: '90%' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isLatest ? 'bg-emerald-500' : 'bg-gray-200'}`}
                style={{ height: `${barHeight}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{shortBucketLabel(bucket, groupBy)}</span>
          </div>
        );
      })}
    </div>
  );
};

const MacroRing = ({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) => {
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
    { value: f, color: '#60a5fa', label: 'Fat' },
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
          { label: 'Fat', value: Math.round(fat), color: 'bg-blue-400' },
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
  const navigate = useNavigate();
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [groupBy, setGroupBy] = useState<StatisticsGroupBy>('day');
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);

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
    if (groupBy === 'week') return 'Luong calo theo tuan';
    if (groupBy === 'month') return 'Luong calo theo thang';
    return 'Luong calo theo ngay';
  }, [groupBy]);

  const openBucketDetail = (bucket: OverviewBucket) => {
    navigate(`/diary?date=${bucket.startDate}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-emerald-500" /> Thong ke dinh duong
          </h1>
          <p className="text-gray-500 mt-1">Chon khung thoi gian va cach gom nhom theo ngay, tuan, thang.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
            {PERIOD_OPTIONS.map((option) => (
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
            {GROUP_OPTIONS.map((option) => (
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
              label="TB calo / ngay"
              value={formatNumber(summary.average.calories)}
              sub={`Muc tieu: ${formatNumber(target.calories)} kcal`}
              color="bg-amber-50 text-amber-500"
            />
            <StatCard
              icon={Target}
              label="TB protein / ngay"
              value={`${Math.round(summary.average.protein || 0)}g`}
              sub={`Muc tieu: ${Math.round(target.protein || 150)}g`}
              color="bg-emerald-50 text-emerald-500"
            />
            <StatCard
              icon={Award}
              label="Streak"
              value={summary.streak}
              sub="So ngay ghi nhan lien tiep"
              color="bg-red-50 text-red-500"
            />
            <StatCard
              icon={Calendar}
              label="Ngay hoat dong"
              value={summary.activeDays}
              sub={`Trong ${period} ngay qua`}
              color="bg-blue-50 text-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[28px] shadow-sm border border-gray-100 p-7">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{chartTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Khung {period} ngay, gom nhom {GROUP_OPTIONS.find((item) => item.value === groupBy)?.label.toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">{formatNumber(summary.total.calories)}</p>
                  <p className="text-xs text-gray-400">kcal tong cong</p>
                </div>
              </div>

              <MiniBarChart data={buckets} goal={target.calories} groupBy={groupBy} />

              <p className="text-[10px] text-gray-400 mt-1 text-right">Muc tieu {formatNumber(target.calories)} kcal</p>

              {!!summary.bestBucket && (
                <div className="mt-5 pt-5 border-t border-gray-50 flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500">Moc cao nhat</p>
                      <p className="text-sm font-black text-gray-900">
                        {summary.bestBucket.label} - {formatNumber(summary.bestBucket.calories)} kcal
                      </p>
                    </div>
                  </div>

                  {!!summary.worstBucket && (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
                      <TrendingDown size={16} className="text-red-400" />
                      <div>
                        <p className="text-xs text-gray-500">Moc thap nhat</p>
                        <p className="text-sm font-black text-gray-900">
                          {summary.worstBucket.label} - {formatNumber(summary.worstBucket.calories)} kcal
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-7 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Ti le macro</h2>
                <p className="text-sm text-gray-500 mb-6">Trung binh theo ngay co log</p>
                <MacroRing
                  protein={summary.average.protein || 0}
                  carbs={summary.average.carbs || 0}
                  fat={summary.average.fat || 0}
                />
              </div>

              <div className="mt-6 space-y-3 pt-5 border-t border-gray-50">
                {[
                  { label: 'Tong protein', value: summary.total.protein, unit: 'g', color: 'text-emerald-600' },
                  { label: 'Tong carbs', value: summary.total.carbs, unit: 'g', color: 'text-amber-600' },
                  { label: 'Tong fat', value: summary.total.fat, unit: 'g', color: 'text-blue-600' },
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
              <h2 className="text-xl font-black text-gray-900">Bang chi tiet</h2>
              <p className="text-xs text-gray-500">{buckets.length} moc du lieu</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    {['Moc', 'Khoang ngay', 'Calo', 'Protein', 'Carbs', 'Fat', 'Muc tieu'].map((column) => (
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
                        title="Mo chi tiet bua an theo ngay"
                      >
                        <td className="px-6 py-3 font-bold text-gray-900 text-sm">{bucket.label}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{bucket.startDate} - {bucket.endDate}</td>
                        <td className="px-6 py-3 font-black text-gray-900">{formatNumber(bucket.calories)}</td>
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
                        Khong c? du lieu cho bo loc hien tai.
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
