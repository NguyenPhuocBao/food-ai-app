import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Loader2, RefreshCcw, Sparkles, Trash2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { WeeklyReport } from '../types';
import {
  deleteWeeklyReport,
  generateWeeklyReport,
  getLatestWeeklyReport,
  getWeeklyReports,
} from '../services/weekly-report.service';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));

const getExportFileBase = (report: WeeklyReport) => {
  const start = report.weekStart.slice(0, 10);
  const end = report.weekEnd.slice(0, 10);
  return `weekly-report-${start}-to-${end}`;
};

const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const toCsvCell = (value: unknown) => {
  const raw = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

const toCsvRow = (cells: unknown[]) => cells.map(toCsvCell).join(',');

const buildWeeklyReportCsv = (report: WeeklyReport) => {
  const daily = report.reportData?.daily || [];
  const totals = report.reportData?.totals;
  const alerts = (report.reportData?.alerts || []).join(' | ');
  const recommendations = (report.reportData?.recommendations || []).join(' | ');
  const hydrationAvg = report.reportData?.hydration?.avgMl ?? '';
  const hydrationGoal = report.reportData?.hydration?.goalMl ?? '';
  const healthScore = report.reportData?.healthScore ?? '';

  const rows: string[] = [
    toCsvRow([
      'row_type',
      'week_start',
      'week_end',
      'date',
      'day',
      'calories',
      'protein',
      'fat',
      'carbs',
      'meals',
      'health_score',
      'alerts',
      'recommendations',
      'hydration_avg_ml',
      'hydration_goal_ml',
    ]),
    toCsvRow([
      'summary',
      report.weekStart,
      report.weekEnd,
      '',
      '',
      totals?.calories ?? '',
      totals?.protein ?? '',
      totals?.fat ?? '',
      totals?.carbs ?? '',
      totals?.meals ?? '',
      healthScore,
      alerts,
      recommendations,
      hydrationAvg,
      hydrationGoal,
    ]),
  ];

  daily.forEach((day) => {
    rows.push(
      toCsvRow([
        'daily',
        report.weekStart,
        report.weekEnd,
        day.date,
        day.day,
        day.calories,
        day.protein,
        day.fat,
        day.carbs,
        day.meals,
        '',
        '',
        '',
        '',
        '',
      ]),
    );
  });

  return rows.join('\n');
};

const WeeklyReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [latest, history] = await Promise.all([
        getLatestWeeklyReport(),
        getWeeklyReports(20),
      ]);

      const merged = latest
        ? [latest, ...history.filter((item) => item.id !== latest.id)]
        : history;
      setReports(merged);
      if (!activeId && merged.length > 0) setActiveId(merged[0].id);
    } catch {
      toast.error('Không thể tải weekly reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const activeReport = useMemo(
    () => reports.find((item) => item.id === activeId) || reports[0] || null,
    [reports, activeId],
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const report = await generateWeeklyReport();
      toast.success('Đã tạo weekly report');

      setReports((prev) => [report, ...prev.filter((item) => item.id !== report.id)]);
      setActiveId(report.id);
    } catch {
      toast.error('Không tạo được weekly report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Xóa weekly report này?');
    if (!confirmed) return;

    try {
      await deleteWeeklyReport(id);
      toast.success('Đã xóa weekly report');
      setReports((prev) => prev.filter((item) => item.id !== id));
      if (activeId === id) setActiveId(null);
    } catch {
      toast.error('Xóa weekly report thất bại');
    }
  };

  const handleExportJson = (report: WeeklyReport) => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        source: 'food-ai-app',
        report,
      };
      const content = JSON.stringify(payload, null, 2);
      const fileName = `${getExportFileBase(report)}.json`;
      triggerDownload(content, fileName, 'application/json;charset=utf-8');
      toast.success('Đã xuất file JSON');
    } catch {
      toast.error('Không thể xuất file JSON');
    }
  };

  const handleExportCsv = (report: WeeklyReport) => {
    try {
      const content = buildWeeklyReportCsv(report);
      const fileName = `${getExportFileBase(report)}.csv`;
      triggerDownload(content, fileName, 'text/csv;charset=utf-8');
      toast.success('Đã xuất file CSV');
    } catch {
      toast.error('Không thể xuất file CSV');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[30px] bg-gradient-to-br from-sky-500 via-indigo-500 to-blue-700 p-6 text-white shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-100">Weekly Reports</p>
            <h1 className="mt-2 text-3xl font-black">Báo cáo dinh dưỡng theo từng tuần</h1>
            <p className="mt-2 text-sm text-sky-100">
              Dữ liệu được tổng hợp từ bảng `weekly_reports`, bao gồm macro, calo và số bữa ăn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-3 text-sm font-bold text-white hover:bg-white/30"
            >
              <RefreshCcw size={16} />
              Tải lại
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-70"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Tạo report mới
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <div className="h-[520px] animate-pulse rounded-3xl bg-gray-200 dark:bg-slate-800" />
          <div className="h-[520px] animate-pulse rounded-3xl bg-gray-200 dark:bg-slate-800" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <CalendarDays size={36} className="mx-auto text-gray-300 dark:text-slate-600" />
          <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-slate-200">Chưa có báo cáo tuần nào</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Nhấn "Tạo report mới" để ghi dữ liệu vào weekly_reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {reports.map((report) => {
              const isActive = activeReport?.id === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveId(report.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Avg {Math.round(report.avgCalories)} kcal/ngày
                  </p>
                </button>
              );
            })}
          </div>

          {activeReport && (
            <section className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                    Báo cáo tuần {formatDate(activeReport.weekStart)} - {formatDate(activeReport.weekEnd)}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Tạo lúc {formatDate(activeReport.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportJson(activeReport)}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Download size={14} />
                    Xuất JSON
                  </button>
                  <button
                    onClick={() => handleExportCsv(activeReport)}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Download size={14} />
                    Xuất CSV
                  </button>
                  <button
                    onClick={() => handleDelete(activeReport.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                  >
                    <Trash2 size={14} />
                    Xóa
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
                  <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">Avg Calories</p>
                  <p className="mt-2 text-2xl font-black text-amber-800 dark:text-amber-200">{Math.round(activeReport.avgCalories)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                  <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Avg Protein</p>
                  <p className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-200">{Math.round(activeReport.avgProtein)}g</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4 dark:bg-sky-900/20">
                  <p className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">Avg Fat</p>
                  <p className="mt-2 text-2xl font-black text-sky-800 dark:text-sky-200">{Math.round(activeReport.avgFat)}g</p>
                </div>
                <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-900/20">
                  <p className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">Avg Carbs</p>
                  <p className="mt-2 text-2xl font-black text-purple-800 dark:text-purple-200">{Math.round(activeReport.avgCarbs)}g</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 p-4 dark:border-slate-700">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-slate-100">
                  <Trophy size={18} className="text-amber-500" />
                  Tổng kết nhanh
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-3 dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Tổng calo</p>
                    <p className="mt-1 text-lg font-black text-gray-900 dark:text-slate-100">
                      {Math.round(activeReport.reportData?.totals?.calories || 0)} kcal
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Số bữa ăn</p>
                    <p className="mt-1 text-lg font-black text-gray-900 dark:text-slate-100">
                      {activeReport.reportData?.totals?.meals || 0} bữa
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Ngày cao nhất</p>
                    <p className="mt-1 text-lg font-black text-gray-900 dark:text-slate-100">
                      {activeReport.reportData?.bestDay?.day || '-'} ({Math.round(activeReport.reportData?.bestDay?.calories || 0)} kcal)
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Ngày thấp nhất</p>
                    <p className="mt-1 text-lg font-black text-gray-900 dark:text-slate-100">
                      {activeReport.reportData?.worstDay?.day || '-'} ({Math.round(activeReport.reportData?.worstDay?.calories || 0)} kcal)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 p-4 dark:border-slate-700">
                  <h3 className="text-sm font-black uppercase tracking-wide text-gray-700 dark:text-slate-200">
                    Health Score
                  </h3>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {activeReport.reportData?.healthScore || 0}/100
                  </p>
                  <div className="mt-3 space-y-2">
                    {(activeReport.reportData?.alerts || []).slice(0, 3).map((item, index) => (
                      <p
                        key={`alert-${index}`}
                        className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                      >
                        {item}
                      </p>
                    ))}
                    {!activeReport.reportData?.alerts?.length && (
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        Không có cảnh báo lớn trong tuần.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-100 p-4 dark:border-slate-700">
                  <h3 className="text-sm font-black uppercase tracking-wide text-gray-700 dark:text-slate-200">
                    Khuyến nghị tuần tới
                  </h3>
                  <div className="mt-3 space-y-2">
                    {(activeReport.reportData?.recommendations || []).slice(0, 4).map((item, index) => (
                      <p
                        key={`recommend-${index}`}
                        className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                      >
                        {item}
                      </p>
                    ))}
                    {!activeReport.reportData?.recommendations?.length && (
                      <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                        Chưa có khuyến nghị.
                      </p>
                    )}
                  </div>
                  {activeReport.reportData?.hydration && (
                    <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">
                      Nước uống trung bình: {activeReport.reportData.hydration.avgMl}ml/ngày (mục tiêu {activeReport.reportData.hydration.goalMl}ml)
                    </p>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/80">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-slate-300">Ngày</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-slate-300">Calo</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-slate-300">Protein</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-slate-300">Fat</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-slate-300">Carbs</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-slate-300">Meals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {(activeReport.reportData?.daily || []).map((day) => (
                      <tr key={day.date} className="bg-white dark:bg-slate-900">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">{day.day}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.calories)}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.protein)}g</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.fat)}g</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.carbs)}g</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{day.meals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyReportsPage;
