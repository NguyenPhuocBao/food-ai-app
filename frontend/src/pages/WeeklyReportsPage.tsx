import { Fragment, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, ChevronDown, ChevronRight, Download, Loader2, RefreshCcw, Sparkles, Trash2, Trophy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Meal, WeeklyReport } from '../types';
import {
  deleteWeeklyReport,
  generateWeeklyReport,
  getLatestWeeklyReport,
  getWeeklyReports,
} from '../services/weekly-report.service';
import { getMealsByDate } from '../services/meal.service';
import { useConfirm } from '../contexts/ConfirmContext';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));

const getMealTypeLabel = (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => {
  switch (mealType) {
    case 'BREAKFAST':
      return 'Bữa sáng';
    case 'LUNCH':
      return 'Bữa trưa';
    case 'DINNER':
      return 'Bữa tối';
    case 'SNACK':
      return 'Bữa phụ';
    default:
      return mealType;
  }
};

const mapMealsToReportItems = (meals: Meal[]) =>
  meals.map((meal) => ({
    id: meal.id,
    eatenAt: meal.eatenAt,
    mealType: meal.mealType,
    quantity: meal.quantity,
    calories: meal.calories,
    protein: meal.protein,
    fat: meal.fat,
    carbs: meal.carbs,
    notes: meal.notes,
    foodName: meal.food?.name || 'Mon an',
    foodCategory: meal.food?.category,
  }));

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

const triggerBlobDownload = (blob: Blob, filename: string) => {
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
  const dailyMeals = report.reportData?.dailyMeals || [];
  const totals = report.reportData?.totals;
  const alerts = report.reportData?.alerts || [];
  const recommendations = report.reportData?.recommendations || [];
  const hydrationAvg = report.reportData?.hydration?.avgMl ?? 0;
  const hydrationGoal = report.reportData?.hydration?.goalMl ?? 0;
  const healthScore = report.reportData?.healthScore ?? 0;
  const target = report.reportData?.target;
  const dailyMealMap = new Map(dailyMeals.map((item) => [item.date, item.items]));

  const rows: string[] = [];

  rows.push(toCsvRow(['BAO CAO DINH DUONG TUNG TUAN']));
  rows.push(toCsvRow(['Tuan bat dau', formatDate(report.weekStart), 'Tuan ket thuc', formatDate(report.weekEnd)]));
  rows.push(toCsvRow(['Ngay xuat file', formatDate(new Date().toISOString())]));
  rows.push('');

  rows.push(toCsvRow(['TONG QUAN TUAN']));
  rows.push(toCsvRow(['Chi so', 'Gia tri']));
  rows.push(toCsvRow(['Tong calories', `${Math.round(totals?.calories || 0)} kcal`]));
  rows.push(toCsvRow(['Tong protein', `${Math.round(totals?.protein || 0)} g`]));
  rows.push(toCsvRow(['Tong fat', `${Math.round(totals?.fat || 0)} g`]));
  rows.push(toCsvRow(['Tong carbs', `${Math.round(totals?.carbs || 0)} g`]));
  rows.push(toCsvRow(['Tong so bua', `${totals?.meals || 0} bua`]));
  rows.push(toCsvRow(['So ngay co ghi nhat ky', `${totals?.activeDays || 0}/7 ngay`]));
  rows.push(toCsvRow(['Diem suc khoe tuan', `${healthScore}/100`]));
  rows.push(toCsvRow(['Nuoc uong trung binh', `${Math.round(hydrationAvg)} ml/ngay`]));
  rows.push(toCsvRow(['Muc tieu nuoc', `${Math.round(hydrationGoal)} ml/ngay`]));
  if (target) {
    rows.push(toCsvRow(['Muc tieu calories', `${Math.round(target.calories)} kcal/ngay`]));
    rows.push(toCsvRow(['Muc tieu protein', `${Math.round(target.protein)} g/ngay`]));
    rows.push(toCsvRow(['Muc tieu fat', `${Math.round(target.fat)} g/ngay`]));
    rows.push(toCsvRow(['Muc tieu carbs', `${Math.round(target.carbs)} g/ngay`]));
  }
  rows.push('');

  rows.push(toCsvRow(['TONG HOP THEO NGAY']));
  rows.push(toCsvRow(['Ngay', 'Thu', 'Calories', 'Protein (g)', 'Fat (g)', 'Carbs (g)', 'So bua', 'Trang thai']));
  daily.forEach((day) => {
    rows.push(
      toCsvRow([
        formatDate(day.date),
        day.day,
        Math.round(day.calories),
        Math.round(day.protein),
        Math.round(day.fat),
        Math.round(day.carbs),
        day.meals,
        day.meals > 0 ? 'Da ghi nhat ky' : 'Chua ghi nhat ky',
      ]),
    );
  });
  rows.push('');

  rows.push(toCsvRow(['CHI TIET MON AN TRONG TUAN']));
  rows.push(
    toCsvRow([
      'Ngay',
      'Thu',
      'Bua an',
      'Mon an',
      'Nhom mon',
      'So luong',
      'Gio an',
      'Calories',
      'Protein (g)',
      'Fat (g)',
      'Carbs (g)',
      'Ghi chu',
    ]),
  );

  daily.forEach((day) => {
    const mealsInDay = dailyMealMap.get(day.date) || [];
    if (!mealsInDay.length) {
      rows.push(
        toCsvRow([
          formatDate(day.date),
          day.day,
          '',
          'Khong co du lieu mon an',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ]),
      );
      return;
    }

    mealsInDay.forEach((meal) => {
      rows.push(
        toCsvRow([
          formatDate(day.date),
          day.day,
          getMealTypeLabel(meal.mealType),
          meal.foodName,
          meal.foodCategory || '',
          meal.quantity,
          formatTime(meal.eatenAt),
          Math.round(meal.calories),
          Math.round(meal.protein),
          Math.round(meal.fat),
          Math.round(meal.carbs),
          meal.notes || '',
        ]),
      );
    });
  });
  rows.push('');

  rows.push(toCsvRow(['CANH BAO TRONG TUAN']));
  if (alerts.length) {
    rows.push(toCsvRow(['STT', 'Noi dung']));
    alerts.forEach((item, index) => {
      rows.push(toCsvRow([index + 1, item]));
    });
  } else {
    rows.push(toCsvRow(['Khong co canh bao lon trong tuan']));
  }
  rows.push('');

  rows.push(toCsvRow(['KHUYEN NGHI CHO TUAN TOI']));
  if (recommendations.length) {
    rows.push(toCsvRow(['STT', 'Noi dung']));
    recommendations.forEach((item, index) => {
      rows.push(toCsvRow([index + 1, item]));
    });
  } else {
    rows.push(toCsvRow(['Chua co khuyen nghi']));
  }

  return rows.join('\n');
};

const buildWeeklyReportWorkbook = async (report: WeeklyReport) => {
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Bao cao tuan', {
    views: [{ state: 'frozen', ySplit: 6 }],
  });

  const daily = report.reportData?.daily || [];
  const dailyMeals = report.reportData?.dailyMeals || [];
  const totals = report.reportData?.totals;
  const alerts = report.reportData?.alerts || [];
  const recommendations = report.reportData?.recommendations || [];
  const hydrationAvg = report.reportData?.hydration?.avgMl ?? 0;
  const hydrationGoal = report.reportData?.hydration?.goalMl ?? 0;
  const healthScore = report.reportData?.healthScore ?? 0;
  const target = report.reportData?.target;
  const dailyMealMap = new Map(dailyMeals.map((item) => [item.date, item.items]));

  sheet.columns = [
    { header: 'A', key: 'a', width: 20 },
    { header: 'B', key: 'b', width: 24 },
    { header: 'C', key: 'c', width: 18 },
    { header: 'D', key: 'd', width: 26 },
    { header: 'E', key: 'e', width: 20 },
    { header: 'F', key: 'f', width: 12 },
    { header: 'G', key: 'g', width: 14 },
    { header: 'H', key: 'h', width: 14 },
    { header: 'I', key: 'i', width: 14 },
    { header: 'J', key: 'j', width: 14 },
    { header: 'K', key: 'k', width: 14 },
    { header: 'L', key: 'l', width: 34 },
  ];

  const addSectionTitle = (title: string, color: string) => {
    const row = sheet.addRow([title]);
    sheet.mergeCells(`A${row.number}:L${row.number}`);
    row.height = 24;
    row.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
  };

  const addHeaderRow = (values: string[], color = 'E0F2FE') => {
    const row = sheet.addRow(values);
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: '0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    return row;
  };

  const addBodyRow = (values: Array<string | number>, fillColor?: string) => {
    const row = sheet.addRow(values);
    row.height = 22;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      if (fillColor) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      }
    });
    return row;
  };

  const styleMergedRange = (rowNumber: number, startCol: string, endCol: string, fillColor?: string) => {
    for (let code = startCol.charCodeAt(0); code <= endCol.charCodeAt(0); code += 1) {
      const cell = sheet.getCell(`${String.fromCharCode(code)}${rowNumber}`);
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } },
      };
      cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      if (fillColor) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      }
    }
  };

  const addKeyValueRow = (label: string, value: string, fillColor?: string) => {
    const row = addBodyRow([label, value], fillColor);
    sheet.mergeCells(`B${row.number}:L${row.number}`);
    row.height = Math.max(22, Math.ceil(value.length / 70) * 18);
    row.getCell(1).font = { bold: true, color: { argb: '0F172A' } };
    styleMergedRange(row.number, 'A', 'L', fillColor);
    return row;
  };

  const addIndexedNoteRow = (indexLabel: string | number, value: string, fillColor?: string) => {
    const row = addBodyRow([indexLabel, value], fillColor);
    sheet.mergeCells(`B${row.number}:L${row.number}`);
    row.height = Math.max(22, Math.ceil(value.length / 70) * 18);
    row.getCell(1).font = { bold: true, color: { argb: '0F172A' } };
    styleMergedRange(row.number, 'A', 'L', fillColor);
    return row;
  };

  const addSpacer = () => {
    sheet.addRow([]);
  };

  const titleRow = sheet.addRow(['BAO CAO DINH DUONG TUNG TUAN']);
  sheet.mergeCells(`A${titleRow.number}:L${titleRow.number}`);
  titleRow.height = 28;
  titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

  addKeyValueRow('Tuần bắt đầu', formatDate(report.weekStart), 'F8FAFC');
  addKeyValueRow('Tuần kết thúc', formatDate(report.weekEnd), 'F8FAFC');
  addKeyValueRow('Ngày xuất file', formatDate(new Date().toISOString()), 'F8FAFC');
  addSpacer();

  addSectionTitle('TONG QUAN TUAN', '0284C7');
  addHeaderRow(['Chỉ số', 'Giá trị'], 'E0F2FE');
  addKeyValueRow('Tổng calories', `${Math.round(totals?.calories || 0)} kcal`);
  addKeyValueRow('Tổng protein', `${Math.round(totals?.protein || 0)} g`);
  addKeyValueRow('Tổng fat', `${Math.round(totals?.fat || 0)} g`);
  addKeyValueRow('Tổng carbs', `${Math.round(totals?.carbs || 0)} g`);
  addKeyValueRow('Tổng số bữa', `${totals?.meals || 0} bữa`);
  addKeyValueRow('Số ngày có ghi nhật ký', `${totals?.activeDays || 0}/7 ngày`);
  addKeyValueRow('Điểm sức khỏe tuần', `${healthScore}/100`, 'DCFCE7');
  addKeyValueRow('Nước uống trung bình', `${Math.round(hydrationAvg)} ml/ngày`);
  addKeyValueRow('Mục tiêu nước', `${Math.round(hydrationGoal)} ml/ngày`);
  if (target) {
    addKeyValueRow('Mục tiêu calories', `${Math.round(target.calories)} kcal/ngày`);
    addKeyValueRow('Mục tiêu protein', `${Math.round(target.protein)} g/ngày`);
    addKeyValueRow('Mục tiêu fat', `${Math.round(target.fat)} g/ngày`);
    addKeyValueRow('Mục tiêu carbs', `${Math.round(target.carbs)} g/ngày`);
  }
  addSpacer();

  addSectionTitle('TONG HOP THEO NGAY', '0891B2');
  addHeaderRow(['Ngày', 'Thứ', 'Calories', 'Protein (g)', 'Fat (g)', 'Carbs (g)', 'Số bữa', 'Trạng thái'], 'CFFAFE');
  daily.forEach((day) => {
    addBodyRow([
      formatDate(day.date),
      day.day,
      Math.round(day.calories),
      Math.round(day.protein),
      Math.round(day.fat),
      Math.round(day.carbs),
      day.meals,
      day.meals > 0 ? 'Đã ghi nhật ký' : 'Chưa ghi nhật ký',
    ]);
  });
  addSpacer();

  addSectionTitle('CHI TIET MON AN TRONG TUAN', '7C3AED');
  addHeaderRow(
    ['Ngày', 'Thứ', 'Bữa ăn', 'Món ăn', 'Nhóm món', 'Số lượng', 'Giờ ăn', 'Calories', 'Protein (g)', 'Fat (g)', 'Carbs (g)', 'Ghi chú'],
    'EDE9FE',
  );
  daily.forEach((day) => {
    const mealsInDay = dailyMealMap.get(day.date) || [];
    if (!mealsInDay.length) {
      addBodyRow([formatDate(day.date), day.day, '', 'Không có dữ liệu món ăn', '', '', '', '', '', '', '', ''], 'FAFAFA');
      return;
    }

    mealsInDay.forEach((meal) => {
      addBodyRow([
        formatDate(day.date),
        day.day,
        getMealTypeLabel(meal.mealType),
        meal.foodName,
        meal.foodCategory || '',
        meal.quantity,
        formatTime(meal.eatenAt),
        Math.round(meal.calories),
        Math.round(meal.protein),
        Math.round(meal.fat),
        Math.round(meal.carbs),
        meal.notes || '',
      ]);
    });
  });
  addSpacer();

  addSectionTitle('CANH BAO TRONG TUAN', 'DC2626');
  if (alerts.length) {
    addHeaderRow(['STT', 'Nội dung'], 'FEE2E2');
    alerts.forEach((item, index) => addIndexedNoteRow(index + 1, item, 'FEF2F2'));
  } else {
    addIndexedNoteRow('-', 'Không có cảnh báo lớn trong tuần', 'FEF2F2');
  }
  addSpacer();

  addSectionTitle('KHUYEN NGHI CHO TUAN TOI', 'D97706');
  if (recommendations.length) {
    addHeaderRow(['STT', 'Nội dung'], 'FEF3C7');
    recommendations.forEach((item, index) => addIndexedNoteRow(index + 1, item, 'FFFBEB'));
  } else {
    addIndexedNoteRow('-', 'Chưa có khuyến nghị', 'FFFBEB');
  }

  return workbook;
};

const healthGradeStyles: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  B: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',
  C: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
  D: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200',
};

const WeeklyReportsPage = () => {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [previewReport, setPreviewReport] = useState<WeeklyReport | null>(null);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [expandedPreviewDays, setExpandedPreviewDays] = useState<string[]>([]);
  const [fallbackDailyMeals, setFallbackDailyMeals] = useState<Record<string, ReturnType<typeof mapMealsToReportItems>>>({});
  const [loadingMealDates, setLoadingMealDates] = useState<string[]>([]);

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

  const previewDailyHealth = useMemo(() => {
    if (!previewReport?.reportData?.dailyHealth?.length) return [];
    return previewReport.reportData.dailyHealth;
  }, [previewReport]);

  const activeDailyMealMap = useMemo(
    () => new Map((activeReport?.reportData?.dailyMeals || []).map((item) => [item.date, item.items])),
    [activeReport],
  );

  const previewDailyMealMap = useMemo(
    () => new Map((previewReport?.reportData?.dailyMeals || []).map((item) => [item.date, item.items])),
    [previewReport],
  );

  const ensureMealsForDate = async (date: string) => {
    if (fallbackDailyMeals[date] || loadingMealDates.includes(date)) return fallbackDailyMeals[date] || [];

    setLoadingMealDates((prev) => [...prev, date]);
    try {
      const result = await getMealsByDate(date);
      const mapped = mapMealsToReportItems(result.meals || []);
      setFallbackDailyMeals((prev) => ({ ...prev, [date]: mapped }));
      return mapped;
    } catch {
      return [];
    } finally {
      setLoadingMealDates((prev) => prev.filter((item) => item !== date));
    }
  };

  const hydrateReportWithLiveMeals = async (report: WeeklyReport) => {
    const existingDailyMeals = report.reportData?.dailyMeals || [];
    const existingMap = new Map(existingDailyMeals.map((item) => [item.date, item.items]));
    const daily = report.reportData?.daily || [];
    const missingDates = daily
      .filter((day) => day.meals > 0 && (existingMap.get(day.date)?.length || 0) === 0)
      .map((day) => day.date);

    if (!missingDates.length) return report;

    const resolved = await Promise.all(
      missingDates.map(async (date) => [date, await ensureMealsForDate(date)] as const),
    );

    const resolvedMap = new Map(resolved);
    const mergedDailyMeals = daily.map((day) => ({
      date: day.date,
      day: day.day,
      items: existingMap.get(day.date)?.length ? existingMap.get(day.date)! : (resolvedMap.get(day.date) || []),
    }));

    return {
      ...report,
      reportData: {
        ...report.reportData,
        dailyMeals: mergedDailyMeals,
      },
    };
  };

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
    const confirmed = await confirm({
      title: 'Xóa weekly report',
      message: 'Bạn có chắc muốn xóa weekly report này?',
      confirmText: 'Xóa báo cáo',
      tone: 'danger',
    });
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

  const handleExportCsv = async (report: WeeklyReport) => {
    try {
      const hydratedReport = await hydrateReportWithLiveMeals(report);
      const content = buildWeeklyReportCsv(hydratedReport);
      const fileName = `${getExportFileBase(report)}.csv`;
      triggerDownload(content, fileName, 'text/csv;charset=utf-8');
      toast.success('Đã xuất file CSV');
    } catch {
      toast.error('Không thể xuất file CSV');
    }
  };

  const handleExportExcel = async (report: WeeklyReport) => {
    try {
      const hydratedReport = await hydrateReportWithLiveMeals(report);
      const workbook = await buildWeeklyReportWorkbook(hydratedReport);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob(
        [buffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      );
      triggerBlobDownload(blob, `${getExportFileBase(report)}.xlsx`);
      toast.success('Đã xuất file Excel');
    } catch {
      toast.error('Không thể xuất file Excel');
    }
  };

  const toggleExpandedDay = async (date: string) => {
    const willExpand = !expandedDays.includes(date);
    setExpandedDays((prev) => (prev.includes(date) ? prev.filter((item) => item !== date) : [...prev, date]));
    if (willExpand && !activeDailyMealMap.get(date)?.length) {
      await ensureMealsForDate(date);
    }
  };

  const toggleExpandedPreviewDay = async (date: string) => {
    const willExpand = !expandedPreviewDays.includes(date);
    setExpandedPreviewDays((prev) => (prev.includes(date) ? prev.filter((item) => item !== date) : [...prev, date]));
    if (willExpand && !previewDailyMealMap.get(date)?.length) {
      await ensureMealsForDate(date);
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
                    onClick={() => {
                      setExpandedPreviewDays([]);
                      setPreviewReport(activeReport);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Download size={14} />
                    Xem trước CSV
                  </button>
                  <button
                    onClick={() => void handleExportExcel(activeReport)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Download size={14} />
                    Xuất Excel
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
                    {(activeReport.reportData?.daily || []).map((day) => {
                      const isExpanded = expandedDays.includes(day.date);
                      const mealsInDay = activeDailyMealMap.get(day.date)?.length
                        ? activeDailyMealMap.get(day.date) || []
                        : fallbackDailyMeals[day.date] || [];
                      const isLoadingMeals = loadingMealDates.includes(day.date);

                      return (
                        <Fragment key={day.date}>
                          <tr key={day.date} className="bg-white dark:bg-slate-900">
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">
                              <button
                                type="button"
                                onClick={() => toggleExpandedDay(day.date)}
                                className="flex items-center gap-2 text-left"
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <span>{day.day}</span>
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.calories)}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.protein)}g</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.fat)}g</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{Math.round(day.carbs)}g</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{day.meals}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50 dark:bg-slate-950">
                              <td colSpan={6} className="px-4 py-4">
                                {mealsInDay.length ? (
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {mealsInDay.map((meal) => (
                                      <div
                                        key={`active-meal-${meal.id}`}
                                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <p className="font-black text-slate-900 dark:text-slate-100">{meal.foodName}</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                              {getMealTypeLabel(meal.mealType)} • {formatTime(meal.eatenAt)} • SL {meal.quantity}
                                            </p>
                                          </div>
                                          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
                                            {Math.round(meal.calories)} kcal
                                          </span>
                                        </div>
                                        <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                                          P {Math.round(meal.protein)}g • F {Math.round(meal.fat)}g • C {Math.round(meal.carbs)}g
                                        </p>
                                        {meal.notes && (
                                          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                            Ghi chú: {meal.notes}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : isLoadingMeals ? (
                                  <div className="rounded-2xl border border-dashed border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300">
                                    Đang tải món ăn trong ngày...
                                  </div>
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                    Ngày này chưa có món ăn chi tiết trong report.
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-sky-200 bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 px-6 py-5 text-white md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-100">CSV Preview</p>
                <h3 className="mt-2 text-2xl font-black">Bảng preview trước khi xuất file</h3>
                <p className="mt-2 text-sm text-sky-50">
                  Báo cáo tuần {formatDate(previewReport.weekStart)} - {formatDate(previewReport.weekEnd)}. Tiêu đề dùng hệ màu xanh trời, phần log và warning được tách riêng để kiểm tra trước khi tải file.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleExportExcel(previewReport)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400"
                >
                  <Download size={16} />
                  Xuất Excel đẹp
                </button>
                <button
                  onClick={() => void handleExportCsv(previewReport)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50"
                >
                  <Download size={16} />
                  Xuất CSV
                </button>
                <button
                  onClick={() => {
                    setExpandedPreviewDays([]);
                    setPreviewReport(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20"
                >
                  <X size={16} />
                  Đóng
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-108px)] overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">Tổng kcal</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {Math.round(previewReport.reportData?.totals?.calories || 0)}
                  </p>
                </div>
                <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Số bữa</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {previewReport.reportData?.totals?.meals || 0}
                  </p>
                </div>
                <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">Log cảnh báo</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {previewReport.reportData?.alerts?.length || 0}
                  </p>
                </div>
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Health score</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {previewReport.reportData?.healthScore || 0}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-sm">
                  <div className="border-b border-sky-100 bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-4 text-white">
                    <h4 className="text-lg font-black">Bảng dữ liệu chuẩn bị xuất CSV</h4>
                    <p className="mt-1 text-sm text-sky-50">
                      Tiêu đề bảng dùng màu xanh trời, tập trung vào dữ liệu ngày để user kiểm tra nhanh trước khi tải.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-sky-50">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Ngày</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Calo</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Protein</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Fat</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Carbs</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Meals</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wide text-sky-800">Log</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(previewReport.reportData?.daily || []).map((day) => {
                          const dailyHealth = previewDailyHealth.find((item) => item.date === day.date);
                          const grade = dailyHealth?.grade && dailyHealth.grade in healthGradeStyles
                            ? (dailyHealth.grade as keyof typeof healthGradeStyles)
                            : null;
                          const isExpanded = expandedPreviewDays.includes(day.date);
                          const mealsInDay = previewDailyMealMap.get(day.date)?.length
                            ? previewDailyMealMap.get(day.date) || []
                            : fallbackDailyMeals[day.date] || [];
                          const isLoadingMeals = loadingMealDates.includes(day.date);

                          return (
                            <Fragment key={`preview-${day.date}`}>
                              <tr className="bg-white">
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandedPreviewDay(day.date)}
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {isExpanded ? <ChevronDown size={16} className="text-sky-700" /> : <ChevronRight size={16} className="text-sky-700" />}
                                    <span>
                                      <span className="block">{day.day}</span>
                                      <span className="text-xs font-medium text-slate-500">{formatDate(day.date)}</span>
                                    </span>
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{Math.round(day.calories)}</td>
                                <td className="px-4 py-3 text-slate-700">{Math.round(day.protein)}g</td>
                                <td className="px-4 py-3 text-slate-700">{Math.round(day.fat)}g</td>
                                <td className="px-4 py-3 text-slate-700">{Math.round(day.carbs)}g</td>
                                <td className="px-4 py-3 text-slate-700">{day.meals}</td>
                                <td className="px-4 py-3">
                                  {grade ? (
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${healthGradeStyles[grade]}`}>
                                      Grade {grade}
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                      Chưa có log
                                    </span>
                                  )}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-sky-50/40">
                                  <td colSpan={7} className="px-4 py-4">
                                    {mealsInDay.length ? (
                                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {mealsInDay.map((meal) => (
                                          <div
                                            key={`preview-meal-${meal.id}`}
                                            className="rounded-2xl border border-sky-200 bg-white px-4 py-3 shadow-sm"
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div>
                                                <p className="font-black text-slate-900">{meal.foodName}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                                  {getMealTypeLabel(meal.mealType)} • {formatTime(meal.eatenAt)} • SL {meal.quantity}
                                                </p>
                                              </div>
                                              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
                                                {Math.round(meal.calories)} kcal
                                              </span>
                                            </div>
                                            {meal.foodCategory && (
                                              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
                                                {meal.foodCategory}
                                              </p>
                                            )}
                                            <p className="mt-3 text-xs font-medium text-slate-600">
                                              P {Math.round(meal.protein)}g • F {Math.round(meal.fat)}g • C {Math.round(meal.carbs)}g
                                            </p>
                                            {meal.notes && (
                                              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                                                Ghi chú: {meal.notes}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : isLoadingMeals ? (
                                      <div className="rounded-2xl border border-dashed border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700">
                                        Đang tải món ăn trong ngày...
                                      </div>
                                    ) : (
                                      <div className="rounded-2xl border border-dashed border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
                                        Chưa có món ăn chi tiết cho ngày này.
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-600" />
                      <h4 className="text-lg font-black text-rose-900">Log màu đỏ</h4>
                    </div>
                    <p className="mt-1 text-sm text-rose-700">
                      Dùng để hiển thị các cảnh báo cần chú ý trước khi export.
                    </p>
                    <div className="mt-4 space-y-3">
                      {(previewReport.reportData?.alerts || []).length ? (
                        (previewReport.reportData?.alerts || []).map((item, index) => (
                          <div
                            key={`preview-alert-${index}`}
                            className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-800"
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700">
                          Không có alert lớn trong tuần này.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <h4 className="text-lg font-black text-amber-900">Warning & khuyến nghị</h4>
                    <p className="mt-1 text-sm text-amber-700">
                      Gom các recommendation để user biết tuần tới nên chỉnh gì.
                    </p>
                    <div className="mt-4 space-y-3">
                      {(previewReport.reportData?.recommendations || []).length ? (
                        (previewReport.reportData?.recommendations || []).map((item, index) => (
                          <div
                            key={`preview-recommend-${index}`}
                            className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-900"
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-700">
                          Chưa có khuyến nghị mới.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-sky-200 bg-sky-50 p-5 shadow-sm">
                    <h4 className="text-lg font-black text-sky-900">Log theo ngày</h4>
                    <p className="mt-1 text-sm text-sky-700">
                      Tóm tắt grade, số alert và số recommendation cho từng ngày có health log.
                    </p>
                    <div className="mt-4 space-y-3">
                      {previewDailyHealth.length ? (
                        previewDailyHealth.map((item) => {
                          const grade = item.grade in healthGradeStyles
                            ? (item.grade as keyof typeof healthGradeStyles)
                            : 'D';
                          return (
                            <div
                              key={`preview-health-${item.date}`}
                              className="rounded-2xl border border-sky-200 bg-white px-4 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-black text-slate-900">{formatDate(item.date)}</p>
                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    {item.alerts.length} alert • {item.recommendations.length} gợi ý
                                  </p>
                                </div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${healthGradeStyles[grade]}`}>
                                  {item.grade} • {item.score}/100
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-800">
                          Chưa có log chi tiết theo ngày.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportsPage;
