import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Copy, Download, Eye, Loader2, NotebookPen, Plus, RefreshCcw, Sparkles, Trash2, UserPlus, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../services/auth.service';
import { getFoods } from '../services/food.service';
import {
  assignMealPlanTemplate,
  createMealPlanTemplate,
  createProgressCheckin,
  deleteWorkspace as deletePTWorkspace,
  getWorkspaceChatMessages,
  createWorkspace,
  deleteMealPlanTemplate,
  addAssignedMealPlanDetail,
  getMyWorkspaces,
  getMemberAssignedMealPlan,
  getProgressCheckins,
  getWorkspaceById,
  inviteWorkspaceMemberByEmail,
  joinWorkspaceByCode,
  listMealPlanTemplates,
  listWorkspaceMembers,
  regenerateInviteCode,
  previewMealPlanTemplate,
  sendWorkspaceChatMessage,
  updateMealPlanTemplate,
  updateAssignedMealPlanDetail,
  deleteAssignedMealPlanDetail,
  type PTMealPlanTemplate,
  type PTMealPlanTemplatePreview,
  type PTProgressCheckin,
  type PTAssignedMealPlanPreview,
  type PTWorkspace,
  type PTWorkspaceChatMessage,
  type PTWorkspaceMember,
} from '../services/pt.service';
import { subscribeWorkspaceEvents } from '../services/ptRealtime.service';
import type { FoodItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getAssetUrl } from '../services/api';
import PTCheckinHistoryPanel from '../components/pt-workspace/PTCheckinHistoryPanel';
import PTWorkspaceChatPanel from '../components/pt-workspace/PTWorkspaceChatPanel';

type BuilderDetail = {
  foodId: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  dayOfWeek: number;
  quantity: number;
};

type MealTypeKey = BuilderDetail['mealType'];

type TemplatePreviewState = {
  template: PTMealPlanTemplate;
  preview: PTMealPlanTemplatePreview;
  summary: {
    totalMeals: number;
    totalQuantity: number;
    totalCalories?: number;
    totalProtein?: number;
    totalFat?: number;
    totalCarbs?: number;
  };
};

const DAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const MEAL_OPTIONS: Array<{ value: BuilderDetail['mealType']; label: string }> = [
  { value: 'BREAKFAST', label: 'Sáng' },
  { value: 'LUNCH', label: 'Trưa' },
  { value: 'DINNER', label: 'Tối' },
  { value: 'SNACK', label: 'Phụ' },
];
const GOAL_OPTIONS = [
  { value: 'WEIGHT_LOSS', label: 'Giảm cân' },
  { value: 'WEIGHT_GAIN', label: 'Tăng cân' },
  { value: 'MAINTENANCE', label: 'Duy trì' },
  { value: 'MUSCLE_GAIN', label: 'Tăng cơ' },
];
const MACRO_OPTIONS = [
  { value: 'BALANCED', label: 'Balanced' },
  { value: 'HIGH_PROTEIN', label: 'High protein' },
  { value: 'LOW_CARB', label: 'Low carb' },
];

const MEAL_TARGET_RATIOS: Record<MealTypeKey, number> = {
  BREAKFAST: 0.22,
  LUNCH: 0.34,
  DINNER: 0.28,
  SNACK: 0.16,
};

const normalizeText = (value?: string | null) => String(value || '').toLowerCase();

const hasMealTag = (food: FoodItem, mealType: MealTypeKey) => {
  const meal = mealType.toLowerCase();
  const tags = (food.mealTimeTags || []).map(normalizeText);
  const roles = (food.mealRoles || []).map(normalizeText);
  if (tags.includes(meal) || roles.includes(meal)) return true;
  if (mealType === 'BREAKFAST') {
    return ['morning', 'sang', 'breakfast'].some((keyword) => tags.includes(keyword) || roles.includes(keyword) || normalizeText(food.category).includes(keyword));
  }
  if (mealType === 'SNACK') {
    return ['snack', 'phu', 'an nhe', 'dessert', 'fruit'].some((keyword) => tags.includes(keyword) || roles.includes(keyword) || normalizeText(food.category).includes(keyword));
  }
  return ['main', 'staple', 'lunch', 'dinner'].some((keyword) => tags.includes(keyword) || roles.includes(keyword) || normalizeText(food.category).includes(keyword));
};

const inferGoalTypeFromCalories = (targetCalories?: number | null): 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN' => {
  if (!targetCalories) return 'MAINTENANCE';
  if (targetCalories <= 1800) return 'WEIGHT_LOSS';
  if (targetCalories >= 2400) return 'WEIGHT_GAIN';
  return 'MAINTENANCE';
};

const snapServingQuantity = (value: number, min = 0.25, max = 1.5) => {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(clamped / 0.25) * 0.25;
};

const formatExportDate = (value?: string | Date | null) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
};

const formatExportDateTime = (value?: string | Date | null) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
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

type PTWorkspaceAssignedPlanExport = {
  member: PTWorkspaceMember;
  plan: PTAssignedMealPlanPreview | null;
};

const PTWorkspacePage = () => {
  const { user, refreshUser } = useAuth();
  const isTrainer = user?.role === 'PT' || user?.role === 'ADMIN';
  const canManageWorkspace = isTrainer;
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<PTWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Awaited<ReturnType<typeof getWorkspaceById>> | null>(null);
  const [workspaceDetailOpen, setWorkspaceDetailOpen] = useState(false);
  const [members, setMembers] = useState<PTWorkspaceMember[]>([]);
  const [templates, setTemplates] = useState<PTMealPlanTemplate[]>([]);
  const [checkins, setCheckins] = useState<PTProgressCheckin[]>([]);
  const [workspaceChatMessages, setWorkspaceChatMessages] = useState<Awaited<ReturnType<typeof getWorkspaceChatMessages>>>([]);
  const [workspaceChatDraft, setWorkspaceChatDraft] = useState('');
  const [workspaceChatLoading, setWorkspaceChatLoading] = useState(false);
  const [workspaceChatSending, setWorkspaceChatSending] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodQuery, setFoodQuery] = useState('');
  const deferredFoodQuery = useDeferredValue(foodQuery);
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedSeedMemberId, setSelectedSeedMemberId] = useState<number>(0);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [joiningWorkspace, setJoiningWorkspace] = useState(false);
  const [invitingByEmail, setInvitingByEmail] = useState(false);
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState(false);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    goalType: 'MAINTENANCE' as 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN',
    targetCalories: 2000,
    targetProtein: 150,
    targetFat: 55,
    targetCarbs: 250,
    macroStrategy: 'BALANCED',
    targetUserId: 0,
  });
  const [templateStatus, setTemplateStatus] = useState<'DRAFT' | 'READY' | 'ASSIGNED' | 'ARCHIVED'>('DRAFT');
  const [builderDetails, setBuilderDetails] = useState<BuilderDetail[]>([
    { foodId: 0, mealType: 'BREAKFAST', dayOfWeek: 1, quantity: 1 },
  ]);
  const [assignTemplateId, setAssignTemplateId] = useState<number | null>(null);
  const [assignUserIds, setAssignUserIds] = useState<number[]>([]);
  const [assignStartDate, setAssignStartDate] = useState('');
  const [assignEndDate, setAssignEndDate] = useState('');
  const [assignActive, setAssignActive] = useState(true);
  const [lastAssignedMealPlanId, setLastAssignedMealPlanId] = useState<number | null>(null);
  const [lastAssignedUserIds, setLastAssignedUserIds] = useState<number[]>([]);
  const [assignedMealPlanPreview, setAssignedMealPlanPreview] = useState<Awaited<ReturnType<typeof getMemberAssignedMealPlan>> | null>(null);
  const [assignedMealPlanPreviewLoading, setAssignedMealPlanPreviewLoading] = useState(false);
  const [myAssignedMealPlanPreview, setMyAssignedMealPlanPreview] = useState<Awaited<ReturnType<typeof getMemberAssignedMealPlan>> | null>(null);
  const [assignedMealPlanEditingIndex, setAssignedMealPlanEditingIndex] = useState<number | null>(null);
  const [assignedMealPlanEditSaving, setAssignedMealPlanEditSaving] = useState(false);
  const [assignedMealPlanEditForm, setAssignedMealPlanEditForm] = useState({
    foodId: 0,
    mealType: 'BREAKFAST' as BuilderDetail['mealType'],
    dayOfWeek: 0,
    quantity: 1,
  });
  const [templatePreview, setTemplatePreview] = useState<TemplatePreviewState | null>(null);
  const [templatePreviewLoading, setTemplatePreviewLoading] = useState(false);
  const [templatePreviewEditingIndex, setTemplatePreviewEditingIndex] = useState<number | null>(null);
  const [templatePreviewEditSaving, setTemplatePreviewEditSaving] = useState(false);
  const [templatePreviewEditForm, setTemplatePreviewEditForm] = useState({
    foodId: 0,
    mealType: 'BREAKFAST' as BuilderDetail['mealType'],
    dayOfWeek: 0,
    quantity: 1,
  });
  const [templatePreviewAddSaving, setTemplatePreviewAddSaving] = useState(false);
  const [templatePreviewAddForm, setTemplatePreviewAddForm] = useState({
    foodId: 0,
    mealType: 'BREAKFAST' as BuilderDetail['mealType'],
    dayOfWeek: 0,
    quantity: 1,
  });
  const [assignedMealPlanAddSaving, setAssignedMealPlanAddSaving] = useState(false);
  const [assignedMealPlanAddForm, setAssignedMealPlanAddForm] = useState({
    foodId: 0,
    mealType: 'BREAKFAST' as BuilderDetail['mealType'],
    dayOfWeek: 0,
    quantity: 1,
  });
  const [checkinForm, setCheckinForm] = useState({
    userId: 0,
    weight: '',
    bodyFat: '',
    waist: '',
    note: '',
  });
  const [checkinHistoryUserId, setCheckinHistoryUserId] = useState<number>(0);
  const [selfCheckinForm, setSelfCheckinForm] = useState({
    height: '',
    weight: '',
    bodyFat: '',
    waist: '',
    note: '',
  });
  const [savingSelfCheckin, setSavingSelfCheckin] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'xlsx' | null>(null);

  const filteredFoods = useMemo(() => {
    const query = deferredFoodQuery.trim().toLowerCase();
    if (!query) return foods;
    return foods.filter((food) =>
      food.name.toLowerCase().includes(query) ||
      food.category.toLowerCase().includes(query)
    );
  }, [foods, deferredFoodQuery]);

  const selectedWorkspaceMemberOptions = useMemo(
    () => members.filter((member) => member.status === 'ACTIVE').map((member) => member.user),
    [members]
  );

  const myMealPlanSummary = useMemo(() => {
    if (!myAssignedMealPlanPreview) return null;
    const details = myAssignedMealPlanPreview.mealPlan.details || [];
    return {
      totalMeals: details.length,
      totalCalories: Math.round(details.reduce((sum, detail) => sum + detail.food.calories * detail.quantity, 0)),
      totalProtein: Math.round(details.reduce((sum, detail) => sum + detail.food.protein * detail.quantity, 0)),
      totalFat: Math.round(details.reduce((sum, detail) => sum + detail.food.fat * detail.quantity, 0)),
      totalCarbs: Math.round(details.reduce((sum, detail) => sum + detail.food.carbs * detail.quantity, 0)),
      topDays: Array.from(
        details.reduce((map, detail) => {
          const current = map.get(detail.dayOfWeek) || 0;
          map.set(detail.dayOfWeek, current + detail.food.calories * detail.quantity);
          return map;
        }, new Map<number, number>())
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [myAssignedMealPlanPreview]);

  const selectedSeedMember = useMemo(() => {
    if (!members.length) return null;
    return members.find((member) => member.userId === selectedSeedMemberId && member.status === 'ACTIVE')
      || members.find((member) => member.status === 'ACTIVE')
      || null;
  }, [members, selectedSeedMemberId]);

  useEffect(() => {
    if (!canManageWorkspace) return;
    if (selectedSeedMemberId) return;
    const firstActiveMember = members.find((member) => member.status === 'ACTIVE');
    if (firstActiveMember) {
      setSelectedSeedMemberId(firstActiveMember.userId);
    }
  }, [canManageWorkspace, members, selectedSeedMemberId]);

  const mergeChatMessage = (messages: PTWorkspaceChatMessage[], incoming: PTWorkspaceChatMessage) => {
    if (messages.some((item) => item.id === incoming.id)) return messages;
    return [...messages, incoming].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const mergeCheckin = (items: PTProgressCheckin[], incoming: PTProgressCheckin) => {
    if (items.some((item) => item.id === incoming.id)) return items;
    return [incoming, ...items].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  };

  const filteredCheckins = useMemo(() => {
    if (!checkinHistoryUserId) return checkins;
    return checkins.filter((item) => item.userId === checkinHistoryUserId);
  }, [checkins, checkinHistoryUserId]);

  const selectedCheckinHistoryMember = useMemo(() => {
    if (!checkinHistoryUserId) return null;
    return selectedWorkspaceMemberOptions.find((member) => member.id === checkinHistoryUserId) || null;
  }, [selectedWorkspaceMemberOptions, checkinHistoryUserId]);

  const checkinHistorySummary = useMemo(() => {
    if (!filteredCheckins.length) return null;
    const latest = filteredCheckins[0];
    const earliest = filteredCheckins[filteredCheckins.length - 1];
    const latestWeight = latest.weight ?? null;
    const earliestWeight = earliest.weight ?? null;
    const weightDelta = latestWeight !== null && earliestWeight !== null
      ? Number((latestWeight - earliestWeight).toFixed(1))
      : null;

    return {
      total: filteredCheckins.length,
      latest,
      earliest,
      weightDelta,
    };
  }, [filteredCheckins]);

  const fetchAssignedPlansForExport = async (): Promise<PTWorkspaceAssignedPlanExport[]> => {
    if (!selectedWorkspace) return [];
    const activeMembers = members.filter((member) => member.status === 'ACTIVE');
    return Promise.all(
      activeMembers.map(async (member) => {
        try {
          const plan = await getMemberAssignedMealPlan(selectedWorkspace.id, member.userId);
          return { member, plan };
        } catch {
          return { member, plan: null };
        }
      }),
    );
  };

  const buildPTWorkspaceCsv = (assignedPlans: PTWorkspaceAssignedPlanExport[]) => {
    if (!selectedWorkspace) return '';
    const rows: string[] = [];

    rows.push(toCsvRow(['PT WORKSPACE EXPORT']));
    rows.push(toCsvRow(['Workspace', selectedWorkspace.name]));
    rows.push(toCsvRow(['Mo ta', selectedWorkspace.description || '']));
    rows.push(toCsvRow(['Ma moi', selectedWorkspace.inviteCode]));
    rows.push(toCsvRow(['Ngay xuat', formatExportDateTime(new Date())]));
    rows.push('');

    rows.push(toCsvRow(['DANH SACH HOC VIEN']));
    rows.push(toCsvRow(['Ten', 'Email', 'Trang thai', 'Chieu cao', 'Can nang', 'Target kcal', 'Ngay tham gia']));
    members.forEach((member) => {
      rows.push(
        toCsvRow([
          member.user.name,
          member.user.email,
          member.status,
          member.user.profile?.height || '',
          member.user.profile?.weight || '',
          member.user.profile?.targetCalories || '',
          formatExportDate(member.joinedAt),
        ]),
      );
    });
    rows.push('');

    rows.push(toCsvRow(['TEMPLATES']));
    rows.push(toCsvRow(['Ten template', 'Goal', 'Kcal', 'Protein', 'Fat', 'Carbs', 'Strategy', 'Trang thai', 'So assignment']));
    templates.forEach((template) => {
      rows.push(
        toCsvRow([
          template.name,
          template.goalType,
          template.targetCalories,
          template.targetProtein,
          template.targetFat,
          template.targetCarbs,
          template.macroStrategy,
          template.status,
          template.assignments?.length || 0,
        ]),
      );
    });
    rows.push('');

    rows.push(toCsvRow(['CHECKINS']));
    rows.push(toCsvRow(['Hoc vien', 'Ngay ghi nhan', 'Can nang', 'Body fat', 'Vong eo', 'Nguoi ghi nhan', 'Ghi chu']));
    checkins.forEach((checkin) => {
      rows.push(
        toCsvRow([
          checkin.user.name,
          formatExportDateTime(checkin.recordedAt),
          checkin.weight || '',
          checkin.bodyFat || '',
          checkin.waist || '',
          checkin.recordedBy?.name || 'Tu cap nhat',
          checkin.note || '',
        ]),
      );
    });
    rows.push('');

    rows.push(toCsvRow(['ASSIGNED MEAL PLANS']));
    rows.push(toCsvRow(['Hoc vien', 'Template', 'Meal plan', 'Trang thai', 'Bat dau', 'Ket thuc', 'Tong mon']));
    assignedPlans.forEach(({ member, plan }) => {
      rows.push(
        toCsvRow([
          member.user.name,
          plan?.assignment.template?.name || '',
          plan?.mealPlan.name || 'Chua co plan',
          plan?.assignment.status || '',
          formatExportDate(plan?.assignment.startDate),
          formatExportDate(plan?.assignment.endDate),
          plan?.mealPlan.details.length || 0,
        ]),
      );
    });
    rows.push('');

    rows.push(toCsvRow(['CHI TIET MON TRONG MEAL PLAN']));
    rows.push(toCsvRow(['Hoc vien', 'Meal plan', 'Thu', 'Bua', 'Mon an', 'So luong', 'Kcal', 'Protein', 'Fat', 'Carbs']));
    assignedPlans.forEach(({ member, plan }) => {
      if (!plan?.mealPlan.details.length) {
        rows.push(toCsvRow([member.user.name, 'Chua co meal plan', '', '', '', '', '', '', '', '']));
        return;
      }
      plan.mealPlan.details.forEach((detail) => {
        rows.push(
          toCsvRow([
            member.user.name,
            plan.mealPlan.name,
            DAY_LABELS[detail.dayOfWeek] || detail.dayOfWeek,
            MEAL_OPTIONS.find((item) => item.value === detail.mealType)?.label || detail.mealType,
            detail.food.name,
            detail.quantity,
            detail.food.calories,
            detail.food.protein,
            detail.food.fat,
            detail.food.carbs,
          ]),
        );
      });
    });

    return rows.join('\n');
  };

  const buildPTWorkspaceWorkbook = async (assignedPlans: PTWorkspaceAssignedPlanExport[]) => {
    if (!selectedWorkspace) return null;
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const dashboard = workbook.addWorksheet('Dashboard');
    const overview = workbook.addWorksheet('Overview');
    const studentsSheet = workbook.addWorksheet('Students');
    const templatesSheet = workbook.addWorksheet('Templates');
    const checkinsSheet = workbook.addWorksheet('Checkins');
    const plansSheet = workbook.addWorksheet('Assigned Plans');

    const styleHeaderRow = (sheet: any, rowNumber: number, color: string) => {
      const row = sheet.getRow(rowNumber);
      row.eachCell((cell: any) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'CBD5E1' } },
          left: { style: 'thin', color: { argb: 'CBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
          right: { style: 'thin', color: { argb: 'CBD5E1' } },
        };
      });
    };

    const addSheetTitle = (sheet: any, title: string, color: string, endColumn = 'F') => {
      const row = sheet.addRow([title]);
      sheet.mergeCells(`A${row.number}:${endColumn}${row.number}`);
      row.height = 24;
      row.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      return row;
    };

    const styleBody = (sheet: any) => {
      sheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber === 1) return;
        row.eachCell((cell: any) => {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } },
          };
        });
      });
    };

    const getMemberDashboardSummary = (member: PTWorkspaceMember) => {
      const memberCheckins = checkins
        .filter((item) => item.userId === member.userId)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
      const latestCheckin = memberCheckins[0] || null;
      const earliestCheckin = memberCheckins[memberCheckins.length - 1] || null;
      const latestWeight = latestCheckin?.weight ?? null;
      const earliestWeight = earliestCheckin?.weight ?? null;
      const weightDelta = latestWeight !== null && earliestWeight !== null
        ? Number((latestWeight - earliestWeight).toFixed(1))
        : null;
      const assignedPlan = assignedPlans.find((item) => item.member.userId === member.userId)?.plan || null;
      const hasActivePlan = assignedPlan?.assignment.status === 'ACTIVE';
      const latestCheckinDate = latestCheckin?.recordedAt ? new Date(latestCheckin.recordedAt) : null;
      const daysSinceCheckin = latestCheckinDate
        ? Math.floor((Date.now() - latestCheckinDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let evaluation = 'Thiếu dữ liệu';
      if (memberCheckins.length === 0) {
        evaluation = 'Chưa có check-in';
      } else if (daysSinceCheckin !== null && daysSinceCheckin > 14) {
        evaluation = 'Cần cập nhật';
      } else if (hasActivePlan && weightDelta !== null && weightDelta <= 0) {
        evaluation = 'Đang bám kế hoạch';
      } else if (hasActivePlan) {
        evaluation = 'Đang theo dõi';
      } else {
        evaluation = 'Chưa có meal plan';
      }

      return {
        latestCheckin,
        memberCheckins,
        assignedPlan,
        hasActivePlan,
        weightDelta,
        evaluation,
      };
    };

    const activeMembers = members.filter((member) => member.status === 'ACTIVE');
    const memberSummaries = activeMembers.map((member) => ({
      member,
      ...getMemberDashboardSummary(member),
    }));
    const membersWithPlan = memberSummaries.filter((item) => item.hasActivePlan).length;
    const membersWithCheckins = memberSummaries.filter((item) => item.memberCheckins.length > 0).length;
    const latestWorkspaceCheckin = [...checkins].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )[0];

    dashboard.columns = [
      { width: 24 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 24 },
    ];
    addSheetTitle(dashboard, `Dashboard • ${selectedWorkspace.name}`, '0F766E');
    dashboard.addRow(['Ngày xuất', formatExportDateTime(new Date())]);
    dashboard.addRow(['Mã mời', selectedWorkspace.inviteCode]);
    dashboard.addRow([]);

    addSheetTitle(dashboard, 'TỔNG HỢP NHANH', '0284C7');
    dashboard.addRow(['Chỉ số', 'Giá trị', 'Chỉ số', 'Giá trị', 'Chỉ số', 'Giá trị']);
    styleHeaderRow(dashboard, dashboard.lastRow!.number, '0284C7');
    dashboard.addRow([
      'Học viên active', activeMembers.length,
      'Đã có meal plan', membersWithPlan,
      'Có check-in', membersWithCheckins,
    ]);
    dashboard.addRow([
      'Templates', templates.length,
      'Tổng check-ins', checkins.length,
      'Check-in gần nhất', latestWorkspaceCheckin ? formatExportDateTime(latestWorkspaceCheckin.recordedAt) : 'Chưa có',
    ]);
    styleBody(dashboard);
    dashboard.addRow([]);

    addSheetTitle(dashboard, 'ĐÁNH GIÁ HỌC VIÊN', '7C3AED');
    dashboard.addRow(['Học viên', 'Check-ins', 'Cân nặng mới nhất', 'Biến động', 'Meal plan', 'Đánh giá']);
    styleHeaderRow(dashboard, dashboard.lastRow!.number, '7C3AED');
    memberSummaries.forEach((item) => {
      dashboard.addRow([
        item.member.user.name,
        item.memberCheckins.length,
        item.latestCheckin?.weight ? `${item.latestCheckin.weight} kg` : 'Chưa có',
        item.weightDelta !== null ? `${item.weightDelta > 0 ? '+' : ''}${item.weightDelta} kg` : 'Chưa đủ dữ liệu',
        item.assignedPlan?.mealPlan.name || 'Chưa có',
        item.evaluation,
      ]);
    });
    styleBody(dashboard);
    dashboard.addRow([]);

    addSheetTitle(dashboard, 'FOLLOW-UP ƯU TIÊN', 'DC2626');
    dashboard.addRow(['Học viên', 'Lý do cần chú ý']);
    styleHeaderRow(dashboard, dashboard.lastRow!.number, 'DC2626');
    const followups = memberSummaries.filter((item) => item.evaluation === 'Chưa có check-in' || item.evaluation === 'Cần cập nhật' || item.evaluation === 'Chưa có meal plan');
    if (followups.length) {
      followups.forEach((item) => {
        dashboard.addRow([
          item.member.user.name,
          item.evaluation === 'Chưa có meal plan'
            ? 'Học viên chưa được gán meal plan'
            : item.evaluation === 'Chưa có check-in'
              ? 'Chưa có bất kỳ check-in nào'
              : 'Đã quá lâu chưa cập nhật check-in',
        ]);
      });
    } else {
      dashboard.addRow(['Không có', 'Tất cả học viên hiện không có vấn đề nổi bật']);
    }
    styleBody(dashboard);

    overview.columns = [{ width: 28 }, { width: 48 }];
    overview.addRow(['Chỉ số', 'Giá trị']);
    styleHeaderRow(overview, 1, '0284C7');
    overview.addRows([
      ['Workspace', selectedWorkspace.name],
      ['Mô tả', selectedWorkspace.description || ''],
      ['Mã mời', selectedWorkspace.inviteCode],
      ['Số học viên', members.length],
      ['Templates', templates.length],
      ['Check-ins', checkins.length],
      ['Ngày xuất', formatExportDateTime(new Date())],
    ]);
    styleBody(overview);

    studentsSheet.columns = [
      { width: 24 }, { width: 30 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 },
    ];
    studentsSheet.addRow(['Tên', 'Email', 'Trạng thái', 'Chiều cao', 'Cân nặng', 'Target kcal', 'Ngày tham gia']);
    styleHeaderRow(studentsSheet, 1, '0891B2');
    members.forEach((member) => {
      studentsSheet.addRow([
        member.user.name,
        member.user.email,
        member.status,
        member.user.profile?.height || '',
        member.user.profile?.weight || '',
        member.user.profile?.targetCalories || '',
        formatExportDate(member.joinedAt),
      ]);
    });
    styleBody(studentsSheet);

    templatesSheet.columns = [
      { width: 28 }, { width: 18 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 18 }, { width: 16 }, { width: 14 },
    ];
    templatesSheet.addRow(['Tên template', 'Goal', 'Kcal', 'Protein', 'Fat', 'Carbs', 'Strategy', 'Trạng thái', 'Assignments']);
    styleHeaderRow(templatesSheet, 1, '7C3AED');
    templates.forEach((template) => {
      templatesSheet.addRow([
        template.name,
        template.goalType,
        template.targetCalories,
        template.targetProtein,
        template.targetFat,
        template.targetCarbs,
        template.macroStrategy,
        template.status,
        template.assignments?.length || 0,
      ]);
    });
    styleBody(templatesSheet);

    checkinsSheet.columns = [
      { width: 24 }, { width: 22 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 20 }, { width: 36 },
    ];
    checkinsSheet.addRow(['Học viên', 'Ngày ghi nhận', 'Cân nặng', 'Body fat', 'Vòng eo', 'Người ghi nhận', 'Ghi chú']);
    styleHeaderRow(checkinsSheet, 1, 'DC2626');
    checkins.forEach((checkin) => {
      checkinsSheet.addRow([
        checkin.user.name,
        formatExportDateTime(checkin.recordedAt),
        checkin.weight || '',
        checkin.bodyFat || '',
        checkin.waist || '',
        checkin.recordedBy?.name || 'Tự cập nhật',
        checkin.note || '',
      ]);
    });
    styleBody(checkinsSheet);

    plansSheet.columns = [
      { width: 24 }, { width: 24 }, { width: 24 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 16 }, { width: 12 }, { width: 12 }, { width: 12 },
    ];
    plansSheet.addRow(['Học viên', 'Template', 'Meal plan', 'Trạng thái', 'Bắt đầu', 'Kết thúc', 'Thứ', 'Bữa', 'Món ăn', 'SL', 'Kcal', 'Protein']);
    styleHeaderRow(plansSheet, 1, 'D97706');
    assignedPlans.forEach(({ member, plan }) => {
      if (!plan?.mealPlan.details.length) {
        plansSheet.addRow([
          member.user.name,
          plan?.assignment.template?.name || '',
          plan?.mealPlan.name || 'Chưa có meal plan',
          plan?.assignment.status || '',
          formatExportDate(plan?.assignment.startDate),
          formatExportDate(plan?.assignment.endDate),
          '',
          '',
          '',
          '',
          '',
          '',
        ]);
        return;
      }

      plan.mealPlan.details.forEach((detail, index) => {
        plansSheet.addRow([
          index === 0 ? member.user.name : '',
          index === 0 ? (plan.assignment.template?.name || '') : '',
          index === 0 ? plan.mealPlan.name : '',
          index === 0 ? plan.assignment.status : '',
          index === 0 ? formatExportDate(plan.assignment.startDate) : '',
          index === 0 ? formatExportDate(plan.assignment.endDate) : '',
          DAY_LABELS[detail.dayOfWeek] || detail.dayOfWeek,
          MEAL_OPTIONS.find((item) => item.value === detail.mealType)?.label || detail.mealType,
          detail.food.name,
          detail.quantity,
          detail.food.calories,
          detail.food.protein,
        ]);
      });
    });
    styleBody(plansSheet);

    [dashboard, overview, studentsSheet, templatesSheet, checkinsSheet, plansSheet].forEach((sheet) => {
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
    });

    return workbook;
  };

  const handleExportWorkspace = async (format: 'csv' | 'xlsx') => {
    if (!selectedWorkspace) return;
    setExportingFormat(format);
    try {
      const assignedPlans = await fetchAssignedPlansForExport();
      const fileBase = `pt-workspace-${selectedWorkspace.id}-${selectedWorkspace.name.toLowerCase().replace(/\s+/g, '-')}`;

      if (format === 'csv') {
        const content = buildPTWorkspaceCsv(assignedPlans);
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
        triggerBlobDownload(blob, `${fileBase}.csv`);
        toast.success('Đã xuất CSV cho PT');
        return;
      }

      const workbook = await buildPTWorkspaceWorkbook(assignedPlans);
      if (!workbook) throw new Error('Workbook not created');
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      triggerBlobDownload(blob, `${fileBase}.xlsx`);
      toast.success('Đã xuất Excel cho PT');
    } catch {
      toast.error('Không thể xuất báo cáo PT');
    } finally {
      setExportingFormat(null);
    }
  };

  const previewByDay = useMemo(() => {
    return DAY_LABELS.map((label, dayIndex) => {
      const rows = builderDetails.filter((row) => row.dayOfWeek === dayIndex && row.foodId > 0);
      const totals = rows.reduce((acc, row) => {
        const food = foods.find((item) => item.id === row.foodId);
        if (!food) return acc;
        const quantity = row.quantity || 1;
        acc.calories += food.calories * quantity;
        acc.protein += food.protein * quantity;
        acc.fat += food.fat * quantity;
        acc.carbs += food.carbs * quantity;
        return acc;
      }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
      return { dayIndex, label, rows, totals };
    });
  }, [builderDetails, foods]);

  const resolvePreviewFood = (foodId: number, fallbackFood?: FoodItem | null) => {
    if (fallbackFood) return fallbackFood;
    return foods.find((item) => item.id === Number(foodId)) || null;
  };

  const generateAutoBuilderRows = (member: PTWorkspaceMember | null): BuilderDetail[] => {
    const profile = member?.user.profile;
    const targetCalories = Number(profile?.targetCalories || 2000);
    const targetProtein = Number(profile?.targetProtein || 150);
    const targetFat = Number(profile?.targetFat || 55);
    const targetCarbs = Number(profile?.targetCarbs || 250);
    const goalType = inferGoalTypeFromCalories(targetCalories);
    const dietaryPref = (profile?.dietaryPref || []).map(normalizeText);
    const preferVegetarian = dietaryPref.some((item) => ['vegetarian', 'chay'].includes(item));
    const preferVegan = dietaryPref.some((item) => ['vegan', 'thuanchay'].includes(item));
    const usedFoodIds = new Set<number>();
    const rows: BuilderDetail[] = [];

    const pickFood = (mealType: MealTypeKey, targetKcal: number, dayIndex: number) => {
      const candidates = foods.filter((food) => {
        if (usedFoodIds.has(food.id)) return false;
        if (preferVegan && !food.isVegan) return false;
        if (preferVegetarian && !food.isVegetarian && !food.isVegan) return false;
        return hasMealTag(food, mealType);
      });
      const fallbackCandidates = foods.filter((food) => {
        if (usedFoodIds.has(food.id)) return false;
        if (preferVegan && !food.isVegan) return false;
        if (preferVegetarian && !food.isVegetarian && !food.isVegan) return false;
        return true;
      });
      const pool = (candidates.length ? candidates : fallbackCandidates).slice();
      const sorted = pool.sort((a, b) => {
        const calorieScoreA = Math.abs(a.calories - targetKcal);
        const calorieScoreB = Math.abs(b.calories - targetKcal);
        const proteinBiasA = Math.max(0, targetProtein / 6 - a.protein);
        const proteinBiasB = Math.max(0, targetProtein / 6 - b.protein);
        const fatBiasA = goalType === 'WEIGHT_LOSS' ? Math.max(0, a.fat - targetFat / 3) : 0;
        const fatBiasB = goalType === 'WEIGHT_LOSS' ? Math.max(0, b.fat - targetFat / 3) : 0;
        const varietyBiasA = (a.popularity || 0) * -0.03 + (dayIndex % 3) * 0.5;
        const varietyBiasB = (b.popularity || 0) * -0.03 + (dayIndex % 3) * 0.5;
        return (calorieScoreA + proteinBiasA + fatBiasA + varietyBiasA) - (calorieScoreB + proteinBiasB + fatBiasB + varietyBiasB);
      });
      const chosen = sorted[(dayIndex + (mealType === 'SNACK' ? 1 : 0)) % Math.max(1, Math.min(sorted.length, 5))] || sorted[0];
      if (!chosen) return null;
      usedFoodIds.add(chosen.id);
      return chosen;
    };

    DAY_LABELS.forEach((_, dayIndex) => {
      (['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as MealTypeKey[]).forEach((mealType) => {
        const targetKcal = Math.max(
          120,
          Math.round(targetCalories * MEAL_TARGET_RATIOS[mealType])
        );
        const food = pickFood(mealType, targetKcal, dayIndex);
        if (!food) return;
        const rawServing = mealType === 'SNACK'
          ? 0.5
          : targetKcal / Math.max(food.calories, 1);
        const servings = mealType === 'SNACK'
          ? 0.5
          : snapServingQuantity(rawServing, 0.5, 1.5);
        rows.push({
          foodId: food.id,
          mealType,
          dayOfWeek: dayIndex,
          quantity: servings,
        });
      });
    });

    return rows.length ? rows : builderDetails;
  };

  const applyAutoTemplate = (member: PTWorkspaceMember | null) => {
    const profile = member?.user.profile;
    const targetCalories = Number(profile?.targetCalories || 2000);
    const targetProtein = Number(profile?.targetProtein || 150);
    const targetFat = Number(profile?.targetFat || 55);
    const targetCarbs = Number(profile?.targetCarbs || 250);
    setTemplateForm((current) => ({
      ...current,
      name: `${member?.user.name || 'Học viên'} - Auto plan`,
      goalType: inferGoalTypeFromCalories(targetCalories),
      targetCalories,
      targetProtein,
      targetFat,
      targetCarbs,
      macroStrategy: targetProtein >= 160 ? 'HIGH_PROTEIN' : targetCalories <= 1800 ? 'LOW_CARB' : 'BALANCED',
    }));
    setSelectedSeedMemberId(member?.userId || 0);
    setBuilderDetails(generateAutoBuilderRows(member));
  };

  const openTemplatePreview = async (template: PTMealPlanTemplate) => {
    if (!selectedWorkspaceId) return;
    setTemplatePreviewLoading(true);
    setTemplatePreviewEditingIndex(null);
    try {
      const result = await previewMealPlanTemplate(selectedWorkspaceId, template.id);
      setTemplatePreview(result);
    } catch {
      toast.error('Không tải được preview');
    } finally {
      setTemplatePreviewLoading(false);
    }
  };

  const openTemplatePreviewEdit = (detailIndex: number) => {
    if (!templatePreview?.preview.details?.[detailIndex]) return;
    const detail = templatePreview.preview.details[detailIndex];
    setTemplatePreviewEditingIndex(detailIndex);
    setTemplatePreviewEditForm({
      foodId: detail.foodId,
      mealType: detail.mealType,
      dayOfWeek: detail.dayOfWeek,
      quantity: Number(detail.quantity || 1),
    });
  };

  const openTemplatePreviewAdd = (dayOfWeek?: number) => {
    setTemplatePreviewEditingIndex(null);
    setTemplatePreviewAddForm({
      foodId: foods[0]?.id || 0,
      mealType: 'BREAKFAST',
      dayOfWeek: typeof dayOfWeek === 'number' ? dayOfWeek : 0,
      quantity: 1,
    });
  };

  const closeTemplatePreviewEdit = () => {
    setTemplatePreviewEditingIndex(null);
  };

  const saveTemplatePreviewEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId || !templatePreview || templatePreviewEditingIndex === null) return;
    const currentDetails = [...(templatePreview.preview.details || [])];
    currentDetails[templatePreviewEditingIndex] = {
      ...currentDetails[templatePreviewEditingIndex],
      foodId: templatePreviewEditForm.foodId,
      mealType: templatePreviewEditForm.mealType,
      dayOfWeek: templatePreviewEditForm.dayOfWeek,
      quantity: templatePreviewEditForm.quantity,
    };

    setTemplatePreviewEditSaving(true);
    try {
      await updateMealPlanTemplate(selectedWorkspaceId, templatePreview.template.id, {
        previewData: {
          ...(templatePreview.preview || {}),
          details: currentDetails,
        },
      });
      toast.success('Đã lưu thay đổi preview');
      setTemplatePreviewEditingIndex(null);
      await openTemplatePreview(templatePreview.template);
    } catch {
      toast.error('Không thể lưu preview');
    } finally {
      setTemplatePreviewEditSaving(false);
    }
  };

  const saveTemplatePreviewAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId || !templatePreview || !templatePreviewAddForm.foodId) return;
    const currentDetails = [...(templatePreview.preview.details || [])];
    currentDetails.push({
      foodId: templatePreviewAddForm.foodId,
      mealType: templatePreviewAddForm.mealType,
      dayOfWeek: templatePreviewAddForm.dayOfWeek,
      quantity: templatePreviewAddForm.quantity,
    });
    setTemplatePreviewAddSaving(true);
    try {
      await updateMealPlanTemplate(selectedWorkspaceId, templatePreview.template.id, {
        previewData: {
          ...(templatePreview.preview || {}),
          details: currentDetails,
        },
      });
      toast.success('Đã thêm món vào preview');
      await openTemplatePreview(templatePreview.template);
    } catch {
      toast.error('Không thể thêm món vào preview');
    } finally {
      setTemplatePreviewAddSaving(false);
    }
  };

  const deleteTemplatePreviewDetail = async (detailIndex: number) => {
    if (!selectedWorkspaceId || !templatePreview) return;
    const currentDetails = [...(templatePreview.preview.details || [])];
    currentDetails.splice(detailIndex, 1);
    setTemplatePreviewEditSaving(true);
    try {
      await updateMealPlanTemplate(selectedWorkspaceId, templatePreview.template.id, {
        previewData: {
          ...(templatePreview.preview || {}),
          details: currentDetails,
        },
      });
      toast.success('Đã xóa món khỏi preview');
      if (templatePreviewEditingIndex === detailIndex) setTemplatePreviewEditingIndex(null);
      await openTemplatePreview(templatePreview.template);
    } catch {
      toast.error('Không thể xóa món khỏi preview');
    } finally {
      setTemplatePreviewEditSaving(false);
    }
  };

  const openAssignedMealPlanPreview = async (userId: number) => {
    if (!selectedWorkspaceId) return;
    setAssignedMealPlanPreviewLoading(true);
    setAssignedMealPlanEditingIndex(null);
    try {
      const result = await getMemberAssignedMealPlan(selectedWorkspaceId, userId);
      setAssignedMealPlanPreview(result);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không tải được meal plan của học viên');
    } finally {
      setAssignedMealPlanPreviewLoading(false);
    }
  };

  const openAssignedMealPlanPreviewEdit = (detailIndex: number) => {
    if (!assignedMealPlanPreview?.mealPlan.details?.[detailIndex]) return;
    const detail = assignedMealPlanPreview.mealPlan.details[detailIndex];
    setAssignedMealPlanEditingIndex(detailIndex);
    setAssignedMealPlanEditForm({
      foodId: detail.foodId,
      mealType: detail.mealType,
      dayOfWeek: detail.dayOfWeek,
      quantity: Number(detail.quantity || 1),
    });
  };

  const openAssignedMealPlanPreviewAdd = (dayOfWeek?: number) => {
    setAssignedMealPlanEditingIndex(null);
    setAssignedMealPlanAddForm({
      foodId: foods[0]?.id || 0,
      mealType: 'BREAKFAST',
      dayOfWeek: typeof dayOfWeek === 'number' ? dayOfWeek : 0,
      quantity: 1,
    });
  };

  const closeAssignedMealPlanPreviewEdit = () => {
    setAssignedMealPlanEditingIndex(null);
  };

  const saveAssignedMealPlanPreviewEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId || !assignedMealPlanPreview || assignedMealPlanEditingIndex === null) return;
    const detail = assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex];

    setAssignedMealPlanEditSaving(true);
    try {
      await updateAssignedMealPlanDetail(
        selectedWorkspaceId,
        assignedMealPlanPreview.assignment.userId,
        detail.id,
        {
          foodId: assignedMealPlanEditForm.foodId,
          mealType: assignedMealPlanEditForm.mealType,
          dayOfWeek: assignedMealPlanEditForm.dayOfWeek,
          quantity: assignedMealPlanEditForm.quantity,
        }
      );
      toast.success('Đã lưu meal plan của học viên');
      setAssignedMealPlanEditingIndex(null);
      await openAssignedMealPlanPreview(assignedMealPlanPreview.assignment.userId);
    } catch {
      toast.error('Không thể lưu meal plan');
    } finally {
      setAssignedMealPlanEditSaving(false);
    }
  };

  const saveAssignedMealPlanPreviewAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId || !assignedMealPlanPreview || !assignedMealPlanAddForm.foodId) return;
    setAssignedMealPlanAddSaving(true);
    try {
      await addAssignedMealPlanDetail(selectedWorkspaceId, assignedMealPlanPreview.assignment.userId, {
        foodId: assignedMealPlanAddForm.foodId,
        mealType: assignedMealPlanAddForm.mealType,
        dayOfWeek: assignedMealPlanAddForm.dayOfWeek,
        quantity: assignedMealPlanAddForm.quantity,
      });
      toast.success('Đã thêm món vào meal plan học viên');
      await openAssignedMealPlanPreview(assignedMealPlanPreview.assignment.userId);
    } catch {
      toast.error('Không thể thêm món vào meal plan');
    } finally {
      setAssignedMealPlanAddSaving(false);
    }
  };

  const deleteAssignedMealPlanPreviewDetail = async (detailIndex: number) => {
    if (!selectedWorkspaceId || !assignedMealPlanPreview) return;
    const detail = assignedMealPlanPreview.mealPlan.details[detailIndex];
    setAssignedMealPlanEditSaving(true);
    try {
      await deleteAssignedMealPlanDetail(selectedWorkspaceId, assignedMealPlanPreview.assignment.userId, detail.id);
      toast.success('Đã xóa món khỏi meal plan học viên');
      if (assignedMealPlanEditingIndex === detailIndex) setAssignedMealPlanEditingIndex(null);
      await openAssignedMealPlanPreview(assignedMealPlanPreview.assignment.userId);
    } catch {
      toast.error('Không thể xóa món khỏi meal plan');
    } finally {
      setAssignedMealPlanEditSaving(false);
    }
  };

  const loadAll = async (workspaceId?: number) => {
    setLoading(true);
    try {
      const [workspaceList, foodResult] = await Promise.all([
        getMyWorkspaces(),
        getFoods(1, 200),
      ]);
      setWorkspaces(workspaceList);
      setFoods(foodResult.items);
      const nextWorkspaceId = workspaceId || selectedWorkspaceId || workspaceList[0]?.id || null;
      if (nextWorkspaceId) {
        await loadWorkspace(nextWorkspaceId);
      } else {
        setSelectedWorkspaceId(null);
        setSelectedWorkspace(null);
        setWorkspaceDetailOpen(false);
        setMembers([]);
        setTemplates([]);
        setCheckins([]);
        setWorkspaceChatMessages([]);
        setMyAssignedMealPlanPreview(null);
      }
    } catch {
      toast.error('Không thể tải PT workspace');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async (
    workspaceId: number,
    options?: { preserveDetailOpen?: boolean; silent?: boolean }
  ) => {
    if (!options?.silent) {
      setWorkspaceBusy(true);
      setTemplatePreview(null);
      setAssignedMealPlanPreview(null);
    }
    try {
      const [workspace, memberList, templateList, checkinList] = await Promise.all([
        getWorkspaceById(workspaceId),
        listWorkspaceMembers(workspaceId).catch(() => []),
        listMealPlanTemplates(workspaceId).catch(() => []),
        getProgressCheckins(workspaceId).catch(() => []),
      ]);
      const fallbackMembers = memberList.length ? memberList : (workspace.members || []);
      const fallbackTemplates = templateList.length ? templateList : (workspace.templates || []);
      setSelectedWorkspaceId(workspaceId);
      setSelectedWorkspace(workspace);
      if (!options?.preserveDetailOpen) {
        setWorkspaceDetailOpen(false);
      }
      setMembers(fallbackMembers);
      setTemplates(fallbackTemplates);
      setCheckins(checkinList);
      await loadWorkspaceChat(workspaceId, options?.silent ? { silent: true } : undefined);
      if (!canManageWorkspace && user?.id) {
        const currentUserPlan = await getMemberAssignedMealPlan(workspaceId, user.id).catch(() => null);
        setMyAssignedMealPlanPreview(currentUserPlan);
      } else {
        setMyAssignedMealPlanPreview(null);
      }
      setAssignTemplateId((current) => current || fallbackTemplates[0]?.id || null);
      setCheckinForm((current) => ({
        ...current,
        userId: current.userId || fallbackMembers.find((item) => item.status === 'ACTIVE')?.userId || 0,
      }));
    } catch {
      if (!options?.silent) {
        toast.error('Không thể tải workspace chi tiết');
      }
    } finally {
      if (!options?.silent) {
        setWorkspaceBusy(false);
      }
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const interval = window.setInterval(() => {
      void loadWorkspace(selectedWorkspaceId, { preserveDetailOpen: true, silent: true });
    }, 30000);
    return () => window.clearInterval(interval);
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!selectedWorkspaceId || !workspaceDetailOpen) return;
    return subscribeWorkspaceEvents(selectedWorkspaceId, {
      onChatMessage: (message) => {
        setWorkspaceChatMessages((current) => mergeChatMessage(current, message));
      },
      onCheckin: (checkin) => {
        setCheckins((current) => mergeCheckin(current, checkin));
      },
    });
  }, [selectedWorkspaceId, workspaceDetailOpen]);

  useEffect(() => {
    if (!selectedWorkspaceId || !workspaceDetailOpen) return;
    const interval = window.setInterval(() => {
      void loadWorkspaceChat(selectedWorkspaceId, { silent: true });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [selectedWorkspaceId, workspaceDetailOpen]);

  useEffect(() => {
    if (!selectedWorkspaceId || !workspaceDetailOpen) return;
    const interval = window.setInterval(() => {
      void loadWorkspace(selectedWorkspaceId, { preserveDetailOpen: true, silent: true });
    }, 5000);
    return () => window.clearInterval(interval);
  }, [selectedWorkspaceId, workspaceDetailOpen]);

  const refreshWorkspace = async () => {
    if (!selectedWorkspaceId) return;
    await loadWorkspace(selectedWorkspaceId, { preserveDetailOpen: true });
  };

  const loadWorkspaceChat = async (workspaceId: number, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setWorkspaceChatLoading(true);
    }
    try {
      const messages = await getWorkspaceChatMessages(workspaceId).catch(() => []);
      setWorkspaceChatMessages((current) => {
        if (!options?.silent) return messages;
        if (!current.length) return messages;
        if (!messages.length) return current;
        if (current.length === messages.length && current[current.length - 1]?.id === messages[messages.length - 1]?.id) {
          return current;
        }
        return messages;
      });
    } finally {
      if (!options?.silent) {
        setWorkspaceChatLoading(false);
      }
    }
  };

  const handleSendWorkspaceChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId || !workspaceChatDraft.trim()) return;
    const content = workspaceChatDraft.trim();
    setWorkspaceChatSending(true);
    try {
      const created = await sendWorkspaceChatMessage(selectedWorkspaceId, content);
      setWorkspaceChatMessages((prev) => [...prev, created]);
      setWorkspaceChatDraft('');
      void loadWorkspaceChat(selectedWorkspaceId, { silent: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không gửi được tin nhắn');
    } finally {
      setWorkspaceChatSending(false);
    }
  };

  const handleCreateWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspaceForm.name.trim()) return;
    setCreatingWorkspace(true);
    try {
      const workspace = await createWorkspace(workspaceForm);
      toast.success('Đã tạo workspace');
      setWorkspaceForm({ name: '', description: '' });
      await loadAll(workspace.id);
    } catch {
      toast.error('Không tạo được workspace');
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: number, workspaceName: string) => {
    const shouldDelete = window.confirm(`Xóa workspace "${workspaceName}"? Workspace sẽ bị ẩn khỏi danh sách.`);
    if (!shouldDelete) return;
    try {
      await deletePTWorkspace(workspaceId);
      if (selectedWorkspaceId === workspaceId) {
        setSelectedWorkspaceId(null);
        setSelectedWorkspace(null);
        setWorkspaceDetailOpen(false);
        setMembers([]);
        setTemplates([]);
        setCheckins([]);
        setWorkspaceChatMessages([]);
        setMyAssignedMealPlanPreview(null);
      }
      toast.success('Đã xóa workspace');
      await loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không xóa được workspace');
    }
  };

  const handleJoinWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!joinCode.trim()) return;
    setJoiningWorkspace(true);
    try {
      await joinWorkspaceByCode(joinCode.trim());
      toast.success('Đã tham gia workspace');
      setJoinCode('');
      await loadAll();
    } catch {
      toast.error('Không tham gia được workspace');
    } finally {
      setJoiningWorkspace(false);
    }
  };

  const handleInviteByEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId || !inviteEmail.trim()) return;
    setInvitingByEmail(true);
    try {
      await inviteWorkspaceMemberByEmail(selectedWorkspaceId, inviteEmail.trim());
      toast.success('Đã mời/thêm học viên bằng email');
      setInviteEmail('');
      await refreshWorkspace();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không mời được bằng email');
    } finally {
      setInvitingByEmail(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!selectedWorkspace?.inviteCode) return;
    await navigator.clipboard.writeText(selectedWorkspace.inviteCode);
    toast.success('Đã copy invite code');
  };

  const handleRegenerateInvite = async () => {
    if (!selectedWorkspaceId) return;
    try {
      const updated = await regenerateInviteCode(selectedWorkspaceId);
      setSelectedWorkspace((current) => current ? { ...current, inviteCode: updated.inviteCode } : current);
      setWorkspaces((prev) => prev.map((item) => item.id === updated.id ? { ...item, inviteCode: updated.inviteCode } : item));
      toast.success('Đã tạo invite code mới');
    } catch {
      toast.error('Không thể tạo invite code mới');
    }
  };

  const addBuilderRow = () => {
    setBuilderDetails((prev) => [...prev, { foodId: 0, mealType: 'LUNCH', dayOfWeek: 1, quantity: 1 }]);
  };

  const updateBuilderRow = (index: number, patch: Partial<BuilderDetail>) => {
    setBuilderDetails((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row)));
  };

  const removeBuilderRow = (index: number) => {
    setBuilderDetails((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspaceId) return;
    const details = builderDetails.filter((row) => row.foodId > 0);
    if (!details.length) {
      toast.error('Thêm ít nhất một món vào template');
      return;
    }

    setCreatingTemplate(true);
    try {
      const createdTemplate = await createMealPlanTemplate(selectedWorkspaceId, {
        name: templateForm.name.trim(),
        goalType: templateForm.goalType,
        targetCalories: templateForm.targetCalories,
        targetProtein: templateForm.targetProtein,
        targetFat: templateForm.targetFat,
        targetCarbs: templateForm.targetCarbs,
        macroStrategy: templateForm.macroStrategy,
        targetUserId: templateForm.targetUserId > 0 ? templateForm.targetUserId : null,
        status: templateStatus,
        previewData: {
          details,
          notes: `Template created for workspace ${selectedWorkspace?.name || ''}`,
        },
      });
      toast.success('Đã tạo template meal plan');
      setTemplateForm((prev) => ({ ...prev, name: '' }));
      setBuilderDetails([{ foodId: 0, mealType: 'BREAKFAST', dayOfWeek: 1, quantity: 1 }]);
      setAssignTemplateId(createdTemplate.id);
      if (templateForm.targetUserId > 0) {
        setAssignUserIds([templateForm.targetUserId]);
      }
      await refreshWorkspace();
      void openTemplatePreview(createdTemplate);
    } catch {
      toast.error('Không tạo được template');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleAssignTemplate = async () => {
    if (!selectedWorkspaceId || !assignTemplateId || assignUserIds.length === 0) {
      toast.error('Chọn template và ít nhất một học viên');
      return;
    }
    setAssigningTemplate(true);
    try {
      const result = await assignMealPlanTemplate(selectedWorkspaceId, assignTemplateId, {
        userIds: assignUserIds,
        startDate: assignStartDate || undefined,
        endDate: assignEndDate || undefined,
        activate: assignActive,
      });
      const assignedCount = result.assignments.filter((item) => item.status === 'ASSIGNED').length;
      const skippedCount = result.assignments.filter((item) => item.status === 'SKIPPED').length;
      const firstAssigned = result.assignments.find((item) => item.status === 'ASSIGNED' && item.mealPlanId);
      if (firstAssigned?.mealPlanId) {
        setLastAssignedMealPlanId(firstAssigned.mealPlanId);
        setLastAssignedUserIds(result.assignments.filter((item) => item.status === 'ASSIGNED').map((item) => item.userId));
      }
      toast.success(`Đã gán ${assignedCount} học viên${skippedCount ? `, bỏ qua ${skippedCount}` : ''}`);
      await refreshWorkspace();
    } catch {
      toast.error('Không gán được meal plan');
    } finally {
      setAssigningTemplate(false);
    }
  };

  const handleDeleteTemplate = async (template: PTMealPlanTemplate) => {
    if (!selectedWorkspaceId) return;
    const shouldDelete = window.confirm(`Xóa template "${template.name}"? Hành động này không khôi phục được.`);
    if (!shouldDelete) return;
    try {
      await deleteMealPlanTemplate(selectedWorkspaceId, template.id);
      if (templatePreview?.template.id === template.id) {
        setTemplatePreview(null);
      }
      if (assignTemplateId === template.id) {
        setAssignTemplateId(null);
      }
      toast.success('Đã xóa template');
      await refreshWorkspace();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không thể xóa template');
    }
  };

  const handleSaveCheckin = async () => {
    if (!selectedWorkspaceId || !checkinForm.userId) {
      toast.error('Chọn học viên để check-in');
      return;
    }
    setSavingCheckin(true);
    try {
      await createProgressCheckin(selectedWorkspaceId, {
        userId: checkinForm.userId,
        weight: checkinForm.weight ? Number(checkinForm.weight) : undefined,
        bodyFat: checkinForm.bodyFat ? Number(checkinForm.bodyFat) : undefined,
        waist: checkinForm.waist ? Number(checkinForm.waist) : undefined,
        note: checkinForm.note || undefined,
      });
      toast.success('Đã lưu check-in');
      setCheckinForm((current) => ({ ...current, weight: '', bodyFat: '', waist: '', note: '' }));
      await refreshWorkspace();
    } catch {
      toast.error('Không lưu được check-in');
    } finally {
      setSavingCheckin(false);
    }
  };

  const handleSaveSelfCheckin = async () => {
    if (!selectedWorkspaceId || !user?.id) {
      toast.error('Không xác định được workspace hoặc người dùng');
      return;
    }
    setSavingSelfCheckin(true);
    try {
      const nextHeight = selfCheckinForm.height ? Number(selfCheckinForm.height) : undefined;
      const currentHeight = user.profile?.height ? Number(user.profile.height) : undefined;
      if (nextHeight && nextHeight !== currentHeight) {
        await updateProfile({ height: nextHeight });
        await refreshUser();
      }

      await createProgressCheckin(selectedWorkspaceId, {
        userId: user.id,
        weight: selfCheckinForm.weight ? Number(selfCheckinForm.weight) : undefined,
        bodyFat: selfCheckinForm.bodyFat ? Number(selfCheckinForm.bodyFat) : undefined,
        waist: selfCheckinForm.waist ? Number(selfCheckinForm.waist) : undefined,
        note: selfCheckinForm.note || undefined,
      });

      toast.success('Đã gửi báo cáo chỉ số cho PT');
      setSelfCheckinForm((current) => ({
        ...current,
        weight: '',
        bodyFat: '',
        waist: '',
        note: '',
      }));
      await refreshWorkspace();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không lưu được báo cáo chỉ số');
    } finally {
      setSavingSelfCheckin(false);
    }
  };

  const previewSummary = useMemo(() => {
    const details = builderDetails.filter((row) => row.foodId > 0);
    const selectedFoods = details
      .map((row) => foods.find((food) => food.id === row.foodId))
      .filter(Boolean) as FoodItem[];
    return selectedFoods.reduce(
      (acc, food, index) => {
        const quantity = details[index]?.quantity || 1;
        acc.calories += food.calories * quantity;
        acc.protein += food.protein * quantity;
        acc.fat += food.fat * quantity;
        acc.carbs += food.carbs * quantity;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  }, [builderDetails, foods]);

  useEffect(() => {
    setSelfCheckinForm((current) => ({
      ...current,
      height: user?.profile?.height ? String(user.profile.height) : '',
      weight: current.weight || (user?.profile?.weight ? String(user.profile.weight) : ''),
    }));
  }, [user?.profile?.height, user?.profile?.weight]);

  if (loading && !workspaces.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-3xl bg-gray-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.08),transparent_22%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_52%,#f0f9ff_100%)] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <section className="overflow-hidden rounded-[30px] border border-red-500/25 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.18),_transparent_28%),linear-gradient(135deg,_#0f0f10_0%,_#1b0b0b_38%,_#7f1d1d_100%)] p-7 text-white shadow-[0_24px_80px_rgba(127,29,29,0.30)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-red-200/90">PT Workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Quản lý học viên, meal plan và check-in</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-red-50/80">
              Tạo workspace riêng cho PT, mời học viên bằng invite code, dựng meal plan template, xem preview và assign cho từng nhóm hoặc từng người.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshWorkspace()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 backdrop-blur-sm hover:bg-white/15"
            >
              <RefreshCcw size={16} />
              Làm mới
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[28px] border border-indigo-400/25 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_24%),linear-gradient(180deg,rgba(30,41,59,0.98),rgba(49,46,129,0.94))] p-5 shadow-[0_18px_40px_rgba(79,70,229,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Workspace của bạn</p>
                <p className="text-xs text-indigo-100/70">{workspaces.length} workspace</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {workspaces.map((workspace) => {
                const active = selectedWorkspaceId === workspace.id;
                return (
                  <div
                    key={workspace.id}
                    className={`w-full rounded-[22px] border p-3.5 transition ${
                      active
                        ? 'border-indigo-300/40 bg-white/12 shadow-md shadow-indigo-500/15 backdrop-blur-sm'
                        : 'border-white/10 bg-slate-950/35 hover:border-indigo-300/30 hover:bg-white/8 hover:shadow-md hover:shadow-indigo-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => loadWorkspace(workspace.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-gray-900 dark:text-slate-100">{workspace.name}</p>
                          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-black text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">{workspace._count?.members || 0} HV</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">{workspace.description || 'Chưa có mô tả'}</p>
                      </button>
                      {canManageWorkspace && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteWorkspace(workspace.id, workspace.name)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-900/20"
                          title={`Xóa workspace ${workspace.name}`}
                          aria-label={`Xóa workspace ${workspace.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!workspaces.length && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                  Chưa có workspace nào.
                </div>
              )}
            </div>
          </div>

          {canManageWorkspace && (
            <form onSubmit={handleCreateWorkspace} className="rounded-[28px] border border-indigo-400/25 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_24%),linear-gradient(180deg,rgba(30,41,59,0.98),rgba(49,46,129,0.94))] p-5 shadow-[0_18px_40px_rgba(79,70,229,0.18)]">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-indigo-500" />
                <p className="text-sm font-black text-white">Tạo workspace</p>
              </div>
            <div className="mt-3 space-y-3">
              <input
                value={workspaceForm.name}
                onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Tên workspace"
                className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <textarea
                value={workspaceForm.description}
                onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả ngắn"
                rows={3}
                className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                disabled={creatingWorkspace}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/15 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-60"
              >
                {creatingWorkspace ? 'Đang tạo...' : 'Tạo workspace'}
              </button>
            </div>
            </form>
          )}

            <form onSubmit={handleJoinWorkspace} className="rounded-[28px] border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,47,73,0.94))] p-5 shadow-[0_18px_40px_rgba(8,145,178,0.18)]">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-blue-500" />
              <p className="text-sm font-black text-white">Join bằng code</p>
            </div>
            <div className="mt-3 space-y-3">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="PT-XXXXXX"
                className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                disabled={joiningWorkspace}
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {joiningWorkspace ? 'Đang join...' : 'Tham gia workspace'}
              </button>
            </div>
          </form>

          {canManageWorkspace && (
            <form onSubmit={handleInviteByEmail} className="rounded-[28px] border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,47,73,0.94))] p-5 shadow-[0_18px_40px_rgba(8,145,178,0.18)]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-cyan-500" />
                <p className="text-sm font-black text-white">Mời bằng email</p>
              </div>
              <p className="mt-2 text-xs text-cyan-100/70">
                PT/Admin nhập email học viên để thêm vào workspace. User thường chỉ cần mã mời để join.
              </p>
              <div className="mt-3 space-y-3">
                <input
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <button
                  disabled={invitingByEmail}
                  className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-60"
                >
                  {invitingByEmail ? 'Đang mời...' : 'Mời thêm học viên'}
                </button>
              </div>
            </form>
          )}
        </aside>

        <section className="space-y-6">
          {!selectedWorkspace ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-lg font-black text-gray-900 dark:text-slate-100">Chọn hoặc tạo một workspace</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Sau đó bạn sẽ có đầy đủ member, template, assign và check-in.</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setWorkspaceDetailOpen((current) => !current)}
                className="w-full rounded-[30px] border border-sky-400/25 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),linear-gradient(90deg,rgba(30,41,59,0.98),rgba(30,64,175,0.94),rgba(8,47,73,0.96))] p-6 text-left shadow-[0_20px_40px_rgba(56,189,248,0.16)] transition hover:shadow-[0_24px_50px_rgba(56,189,248,0.20)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-200">Workspace đang mở</p>
                        <h2 className="mt-1 text-2xl font-black text-white">{selectedWorkspace.name}</h2>
                      </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm text-sky-50/80">{selectedWorkspace.description || 'Chưa có mô tả workspace'}</p>
                    {workspaceBusy && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur-sm">
                        <Loader2 size={12} className="animate-spin" />
                        Đang tải workspace...
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-sky-50/85">
                      {canManageWorkspace && (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sky-100 shadow-sm backdrop-blur-sm">Mã mời: <span className="font-black text-white">{selectedWorkspace.inviteCode}</span></span>
                      )}
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sky-100 shadow-sm backdrop-blur-sm">Học viên: <span className="font-black text-white">{members.length}</span></span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-violet-100 shadow-sm backdrop-blur-sm">Template: <span className="font-black text-white">{templates.length}</span></span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-amber-100 shadow-sm backdrop-blur-sm">Check-in: <span className="font-black text-white">{checkins.length}</span></span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-sky-500/20">
                      {workspaceDetailOpen ? 'Đang mở workspace' : 'Bấm để vào workspace'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canManageWorkspace && (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleExportWorkspace('xlsx')}
                          disabled={exportingFormat !== null}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {exportingFormat === 'xlsx' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          Xuất Excel
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleExportWorkspace('csv')}
                          disabled={exportingFormat !== null}
                          className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30"
                        >
                          {exportingFormat === 'csv' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          Xuất CSV
                        </button>
                        <button
                          onClick={handleCopyInvite}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          <Copy size={16} />
                          Copy code
                        </button>
                        <button
                          onClick={handleRegenerateInvite}
                          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-sky-600"
                        >
                          <RefreshCcw size={16} />
                          Đổi code
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteWorkspace(selectedWorkspace.id, selectedWorkspace.name)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
                        >
                          <Trash2 size={16} />
                          Xóa workspace
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </button>

              {workspaceDetailOpen && (
              <div className={`grid gap-8 xl:items-start ${canManageWorkspace ? 'xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]' : 'xl:grid-cols-1'}`}>
                <div className="space-y-8">
                  {!canManageWorkspace && (
                    <div className="space-y-10">
                      <div className="rounded-[30px] border border-emerald-400/25 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_24%),linear-gradient(180deg,rgba(20,83,45,0.98),rgba(6,78,59,0.94))] p-6 shadow-lg shadow-emerald-500/20">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Meal plan của tôi</p>
                            <h3 className="mt-1 text-2xl font-black text-white">Kế hoạch được PT giao</h3>
                            <p className="mt-2 max-w-2xl text-sm text-emerald-50/80">
                              Tập trung vào kế hoạch PT đã giao, theo dõi nhanh kcal, macro và tiến độ từng ngày.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right text-xs font-bold text-emerald-50 shadow-sm backdrop-blur-sm">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">Trạng thái</p>
                            <p className="mt-1 text-base font-black text-white">{myAssignedMealPlanPreview ? 'Đã có plan' : 'Chưa có plan'}</p>
                          </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-bold md:grid-cols-4">
                          <div className="rounded-2xl bg-white/10 px-3 py-3 text-emerald-50 shadow-sm backdrop-blur-sm">
                            <p className="text-emerald-100/60">Món</p>
                            <p className="text-base text-white">{myMealPlanSummary?.totalMeals || 0}</p>
                          </div>
                          <div className="rounded-2xl bg-emerald-400/10 px-3 py-3 text-emerald-50 shadow-sm">
                            <p className="text-emerald-200">Kcal</p>
                            <p className="text-base text-white">{myMealPlanSummary?.totalCalories || 0}</p>
                          </div>
                          <div className="rounded-2xl bg-cyan-400/10 px-3 py-3 text-emerald-50 shadow-sm">
                            <p className="text-cyan-200">Protein</p>
                            <p className="text-base text-white">{myMealPlanSummary?.totalProtein || 0}g</p>
                          </div>
                          <div className="rounded-2xl bg-sky-400/10 px-3 py-3 text-emerald-50 shadow-sm">
                            <p className="text-sky-200">Carbs/Fat</p>
                            <p className="text-base text-white">
                              {myMealPlanSummary?.totalCarbs || 0}C / {myMealPlanSummary?.totalFat || 0}F
                            </p>
                          </div>
                        </div>
                        <div className="mt-8 rounded-[26px] border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,47,73,0.94))] p-6 shadow-lg shadow-cyan-500/20">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Tóm tắt nhanh</p>
                              <h4 className="mt-1 text-lg font-black text-white">{selectedWorkspace.name}</h4>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-cyan-100">
                              {selectedWorkspaceMemberOptions.length} HV
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-semibold text-cyan-50">
                            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">Trạng thái</p>
                              <p className="mt-1 text-sm font-black text-white">Active</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-sky-200">Học viên</p>
                              <p className="mt-1 text-sm font-black text-white">{selectedWorkspaceMemberOptions.length}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200">Template</p>
                              <p className="mt-1 text-sm font-black text-white">{templates.length}</p>
                            </div>
                          </div>
                          {myMealPlanSummary?.topDays?.length ? (
                            <div className="mt-4 grid gap-2">
                              {myMealPlanSummary.topDays.map(([dayIndex, kcal]) => (
                                <div key={dayIndex} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold text-cyan-50 backdrop-blur-sm">
                                  <span>{DAY_LABELS[dayIndex]}</span>
                                  <span>{Math.round(kcal)} kcal</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {myAssignedMealPlanPreview ? (
                          <div className="mt-8 rounded-[26px] border border-sky-400/25 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,64,175,0.94))] p-6 shadow-lg shadow-sky-500/20">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Meal plan đang áp dụng</p>
                                <p className="mt-1 font-black text-white">{myAssignedMealPlanPreview.mealPlan.name}</p>
                                <p className="mt-1 text-xs text-sky-100/70">
                                  {myAssignedMealPlanPreview.assignment.template?.name || 'Template'} •{' '}
                                  {new Date(myAssignedMealPlanPreview.mealPlan.startDate).toLocaleDateString('vi-VN')} -{' '}
                                  {new Date(myAssignedMealPlanPreview.mealPlan.endDate).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-sky-100">
                                {myAssignedMealPlanPreview.assignment.status}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => void openAssignedMealPlanPreview(user?.id || 0)}
                              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-sky-600"
                            >
                              <Eye size={16} />
                              Xem meal plan của tôi
                            </button>
                          </div>
                        ) : (
                          <div className="mt-8 rounded-[26px] border border-dashed border-amber-300 bg-amber-50/80 p-6 text-sm text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-200">
                            PT chưa gán meal plan cho bạn.
                          </div>
                        )}
                        <div className="mt-8 rounded-[28px] border border-rose-400/25 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_24%),linear-gradient(180deg,rgba(30,41,59,0.98),rgba(159,18,57,0.94))] p-6 shadow-lg shadow-rose-500/20">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-200">Tự báo cáo chỉ số</p>
                              <h3 className="mt-1 text-xl font-black text-white">Cập nhật cân nặng và chiều cao</h3>
                              <p className="mt-2 text-sm text-rose-50/80">
                                Bạn có thể tự gửi chỉ số mới cho PT. `Height` sẽ cập nhật vào hồ sơ, còn `weight/body fat/waist` sẽ được lưu thành check-in.
                              </p>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-rose-100">
                              Self report
                            </span>
                          </div>
                          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <input
                              type="number"
                              placeholder="Chiều cao (cm)"
                              value={selfCheckinForm.height}
                              onChange={(event) => setSelfCheckinForm((current) => ({ ...current, height: event.target.value }))}
                              className="rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-rose-900/40 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <input
                              type="number"
                              placeholder="Cân nặng (kg)"
                              value={selfCheckinForm.weight}
                              onChange={(event) => setSelfCheckinForm((current) => ({ ...current, weight: event.target.value }))}
                              className="rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-rose-900/40 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <input
                              type="number"
                              placeholder="% mỡ"
                              value={selfCheckinForm.bodyFat}
                              onChange={(event) => setSelfCheckinForm((current) => ({ ...current, bodyFat: event.target.value }))}
                              className="rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-rose-900/40 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <input
                              type="number"
                              placeholder="Vòng eo"
                              value={selfCheckinForm.waist}
                              onChange={(event) => setSelfCheckinForm((current) => ({ ...current, waist: event.target.value }))}
                              className="rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-rose-900/40 dark:bg-slate-950 dark:text-slate-100"
                            />
                          </div>
                          <textarea
                            value={selfCheckinForm.note}
                            onChange={(event) => setSelfCheckinForm((current) => ({ ...current, note: event.target.value }))}
                            placeholder="Ghi chú cho PT"
                            rows={3}
                            className="mt-3 w-full rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-rose-900/40 dark:bg-slate-950 dark:text-slate-100"
                          />
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={handleSaveSelfCheckin}
                              disabled={savingSelfCheckin}
                              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingSelfCheckin ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                              Gửi chỉ số cho PT
                            </button>
                          </div>
                        </div>
                        <PTWorkspaceChatPanel
                          variant="user"
                          draft={workspaceChatDraft}
                          loading={workspaceChatLoading}
                          messages={workspaceChatMessages}
                          sending={workspaceChatSending}
                          currentUserId={user?.id}
                          onDraftChange={setWorkspaceChatDraft}
                          onSubmit={handleSendWorkspaceChat}
                        />
                      </div>
                    </div>
                    )}
                  {canManageWorkspace && (
                    <div className="grid gap-8 xl:grid-cols-2">
                      <div className="rounded-[28px] border border-indigo-400/25 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_24%),linear-gradient(180deg,rgba(30,41,59,0.98),rgba(49,46,129,0.94))] p-6 shadow-[0_20px_42px_rgba(79,70,229,0.18)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">Thành viên</p>
                        <h3 className="mt-1 text-xl font-black text-white">Học viên trong workspace</h3>
                      </div>
                      <span className="text-xs font-bold text-indigo-100/65">{members.filter((item) => item.status === 'ACTIVE').length} active</span>
                      </div>
                    <div className="mt-4 grid gap-3">
                      {members.map((member) => (
                        <label
                          key={member.id}
                          className={`flex items-start gap-3 rounded-2xl border p-3 ${
                            assignUserIds.includes(member.userId)
                              ? 'border-indigo-300/40 bg-white/12'
                              : 'border-white/10 bg-slate-900/35'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={assignUserIds.includes(member.userId)}
                            onChange={(event) => {
                              setAssignUserIds((prev) => (
                                event.target.checked
                                  ? Array.from(new Set([...prev, member.userId]))
                                  : prev.filter((id) => id !== member.userId)
                              ));
                            }}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-black text-white">{member.user.name}</p>
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-indigo-100">{member.status}</span>
                            </div>
                            <p className="text-xs text-indigo-100/70">{member.user.email}</p>
                            <p className="mt-1 text-xs text-indigo-100/70">
                              BMI/target: {member.user.profile?.height && member.user.profile?.weight ? `${member.user.profile.height}cm / ${member.user.profile.weight}kg` : 'Chưa có dữ liệu'}
                            </p>
                          </div>
                        </label>
                      ))}
                      {!members.length && (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                          Chưa có học viên nào trong workspace.
                        </div>
                      )}
                    </div>
                    </div>
                    </div>
                  )}

                  {canManageWorkspace && (
                    <PTWorkspaceChatPanel
                      variant="trainer"
                      draft={workspaceChatDraft}
                      loading={workspaceChatLoading}
                      messages={workspaceChatMessages}
                      sending={workspaceChatSending}
                      currentUserId={user?.id}
                      onDraftChange={setWorkspaceChatDraft}
                      onSubmit={handleSendWorkspaceChat}
                    />
                  )}

                  {canManageWorkspace && (
                    <div className="rounded-[28px] border border-violet-400/25 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_24%),linear-gradient(180deg,rgba(30,27,75,0.98),rgba(88,28,135,0.94))] p-6 shadow-[0_20px_42px_rgba(147,51,234,0.18)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">Template meal plan</p>
                        <h3 className="mt-1 text-xl font-black text-white">Tạo template & preview</h3>
                      </div>
                    </div>

                    <form onSubmit={handleCreateTemplate} className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={templateForm.name}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Tên template"
                          className="rounded-2xl border border-violet-300/25 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
                        />
                        <select
                          value={templateForm.goalType}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, goalType: event.target.value as typeof templateForm.goalType }))}
                          className="rounded-2xl border border-violet-300/25 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
                        >
                          {GOAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <input type="number" value={templateForm.targetCalories} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetCalories: Number(event.target.value) }))} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Calo" />
                        <input type="number" value={templateForm.targetProtein} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetProtein: Number(event.target.value) }))} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Protein" />
                        <input type="number" value={templateForm.targetFat} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetFat: Number(event.target.value) }))} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Fat" />
                        <input type="number" value={templateForm.targetCarbs} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetCarbs: Number(event.target.value) }))} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Carbs" />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <select
                          value={templateForm.macroStrategy}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, macroStrategy: event.target.value }))}
                          className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          {MACRO_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <select
                          value={templateStatus}
                          onChange={(event) => setTemplateStatus(event.target.value as typeof templateStatus)}
                          className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="READY">Ready</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Áp dụng template cho</p>
                          <select
                            value={templateForm.targetUserId}
                            onChange={(event) => {
                              setTemplateForm((prev) => ({ ...prev, targetUserId: Number(event.target.value) }));
                            }}
                            className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value={0}>Áp dụng cho cả workspace</option>
                            {selectedWorkspaceMemberOptions.map((member) => (
                              <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Lấy macro từ học viên</p>
                          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                            <select
                              value={selectedSeedMemberId}
                              onChange={(event) => setSelectedSeedMemberId(Number(event.target.value))}
                              className="rounded-2xl border border-violet-300/25 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none"
                            >
                              <option value={0}>Chọn học viên để lấy dữ liệu</option>
                              {members.filter((member) => member.status === 'ACTIVE').map((member) => (
                                <option key={member.id} value={member.userId}>
                                  {member.user.name} • {member.user.profile?.targetCalories || 2000} kcal
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => applyAutoTemplate(selectedSeedMember)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300"
                            >
                              <Sparkles size={16} />
                              Tạo template tự động
                            </button>
                          </div>
                        </div>
                        <button type="button" onClick={addBuilderRow} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                          <Plus size={16} />
                          Thêm món vào preview
                        </button>
                      </div>

                      <div className="rounded-3xl border border-dashed border-violet-300/25 bg-white/8 p-5 backdrop-blur-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-black text-white">Dùng hồ sơ học viên để dựng meal plan</p>
                            <p className="text-xs text-violet-100/70">
                              Chọn 1 học viên rồi bấm tạo tự động. Hệ thống sẽ lấy calo mục tiêu và sinh 7 ngày preview theo bữa.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-violet-300/25 bg-slate-950/45 px-4 py-3 text-sm text-violet-50">
                            <p className="font-black">{selectedSeedMember?.user.name || 'Chưa chọn học viên'}</p>
                            <p className="mt-1 text-xs text-violet-100/70">
                              {selectedSeedMember?.user.profile?.targetCalories || 2000} kcal •
                              {' '}{selectedSeedMember?.user.profile?.targetProtein || 150}P /
                              {' '}{selectedSeedMember?.user.profile?.targetCarbs || 250}C /
                              {' '}{selectedSeedMember?.user.profile?.targetFat || 55}F
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-white">Preview builder</p>
                          <p className="text-xs font-semibold text-violet-100/65">Tổng khoảng {Math.round(previewSummary.calories)} kcal</p>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4">
                          {previewByDay.map((day) => (
                            <div key={day.dayIndex} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 shadow-sm backdrop-blur-sm">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-violet-100/70">{day.label}</p>
                                <span className="text-[10px] font-bold text-violet-200">{day.rows.length} món</span>
                              </div>
                              <p className="mt-1 text-sm font-black text-white">{Math.round(day.totals.calories)} kcal</p>
                              <p className="text-[11px] text-violet-100/70">{Math.round(day.totals.protein)}P / {Math.round(day.totals.carbs)}C / {Math.round(day.totals.fat)}F</p>
                            </div>
                          ))}
                        </div>
                        <input
                          value={foodQuery}
                          onChange={(event) => setFoodQuery(event.target.value)}
                          placeholder="Tìm món theo tên hoặc danh mục"
                          className="w-full rounded-2xl border border-violet-300/25 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
                        />
                        <div className="space-y-3">
                          {builderDetails.map((row, index) => {
                            const selectedFood = foods.find((food) => food.id === row.foodId);
                            return (
                              <div key={`${index}-${row.foodId}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 md:grid-cols-[minmax(0,1.5fr)_minmax(96px,0.7fr)_minmax(96px,0.7fr)_84px_48px]">
                                <select
                                  value={row.foodId}
                                  onChange={(event) => updateBuilderRow(index, { foodId: Number(event.target.value) })}
                                  className="rounded-xl border border-violet-300/20 bg-slate-950/45 px-3 py-2 text-sm text-white outline-none"
                                >
                                  <option value={0}>Chọn món</option>
                                  {filteredFoods.slice(0, 120).map((food) => (
                                    <option key={food.id} value={food.id}>
                                      {food.name} - {food.category}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={row.mealType}
                                  onChange={(event) => updateBuilderRow(index, { mealType: event.target.value as BuilderDetail['mealType'] })}
                                  className="rounded-xl border border-violet-300/20 bg-slate-950/45 px-3 py-2 text-sm text-white outline-none"
                                >
                                  {MEAL_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <select
                                  value={row.dayOfWeek}
                                  onChange={(event) => updateBuilderRow(index, { dayOfWeek: Number(event.target.value) })}
                                  className="rounded-xl border border-violet-300/20 bg-slate-950/45 px-3 py-2 text-sm text-white outline-none"
                                >
                                  {DAY_LABELS.map((label, dayIndex) => (
                                    <option key={label} value={dayIndex}>{label}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  min="0.25"
                                  step="0.25"
                                  value={row.quantity}
                                  onChange={(event) => updateBuilderRow(index, { quantity: Number(event.target.value) })}
                                  className="rounded-xl border border-violet-300/20 bg-slate-950/45 px-3 py-2 text-sm text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeBuilderRow(index)}
                                  className="flex h-10 w-10 items-center justify-center justify-self-end rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300"
                                  aria-label="Xóa món"
                                  title="Xóa món"
                                >
                                  <X size={16} />
                                </button>
                                {selectedFood && (
                                  <div className="md:col-span-5 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                                    {getAssetUrl(selectedFood.imageUrl) ? (
                                      <img src={getAssetUrl(selectedFood.imageUrl)} alt={selectedFood.name} className="h-10 w-10 rounded-lg object-cover" />
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-500 dark:bg-slate-700">?</div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-white">{selectedFood.name}</p>
                                      <p className="text-xs text-violet-100/70">{selectedFood.category} • {selectedFood.calories} kcal / 1 phần</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="submit"
                          disabled={creatingTemplate}
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                        >
                          {creatingTemplate ? <Loader2 size={16} className="animate-spin" /> : <NotebookPen size={16} />}
                          Tạo template
                        </button>
                      </div>
                    </form>
                    </div>
                  )}
                </div>

                <div className="space-y-8 xl:sticky xl:top-6 xl:self-start">
                  {canManageWorkspace && (
                    <div className="rounded-[28px] border border-sky-400/25 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,64,175,0.94))] p-6 shadow-[0_20px_42px_rgba(37,99,235,0.18)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-200">Assign</p>
                        <h3 className="mt-1 text-xl font-black text-white">Gán template cho học viên</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <select
                        value={assignTemplateId || 0}
                        onChange={(event) => setAssignTemplateId(Number(event.target.value) || null)}
                        className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value={0}>Chọn template</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>{template.name} • {template.status}</option>
                        ))}
                      </select>
                      <div className="grid gap-3">
                        <input
                          type="date"
                          value={assignStartDate}
                          onChange={(event) => setAssignStartDate(event.target.value)}
                          className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <input
                          type="date"
                          value={assignEndDate}
                          onChange={(event) => setAssignEndDate(event.target.value)}
                          className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <label className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-300">
                          Kích hoạt ngay
                          <input
                            type="checkbox"
                            checked={assignActive}
                            onChange={(event) => setAssignActive(event.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                          />
                        </label>
                        <button
                          onClick={handleAssignTemplate}
                          disabled={assigningTemplate}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/15 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-60"
                        >
                          {assigningTemplate ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                          Gán cho học viên
                        </button>
                        {lastAssignedMealPlanId && (
                          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-200">
                            <p className="font-black">Gán gần nhất</p>
                            <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-200/80">
                              {lastAssignedUserIds.length} học viên • Meal plan #{lastAssignedMealPlanId}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={!lastAssignedUserIds.length || assignedMealPlanPreviewLoading}
                                onClick={() => void openAssignedMealPlanPreview(lastAssignedUserIds[0])}
                                className="rounded-2xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Xem meal plan học viên
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!lastAssignedMealPlanId) return;
                                  navigator.clipboard.writeText(String(lastAssignedMealPlanId));
                                  toast.success('Đã copy meal plan id');
                                }}
                                className="rounded-2xl border border-indigo-300 px-3 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-900/30"
                              >
                                Copy ID
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  )}

                  {canManageWorkspace && (
                    <div className="rounded-[28px] border border-rose-400/25 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_24%),linear-gradient(180deg,rgba(30,41,59,0.98),rgba(159,18,57,0.94))] p-6 shadow-[0_20px_42px_rgba(225,29,72,0.18)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200">Check-in</p>
                        <h3 className="mt-1 text-xl font-black text-white">Theo dõi tiến độ học viên</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <select
                        value={checkinForm.userId}
                        onChange={(event) => setCheckinForm((prev) => ({ ...prev, userId: Number(event.target.value) }))}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value={0}>Chọn học viên</option>
                        {selectedWorkspaceMemberOptions.map((member) => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          type="number"
                          placeholder="Cân nặng"
                          value={checkinForm.weight}
                          onChange={(event) => setCheckinForm((prev) => ({ ...prev, weight: event.target.value }))}
                          className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <input
                          type="number"
                          placeholder="% mỡ"
                          value={checkinForm.bodyFat}
                          onChange={(event) => setCheckinForm((prev) => ({ ...prev, bodyFat: event.target.value }))}
                          className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <input
                          type="number"
                          placeholder="Vòng eo"
                          value={checkinForm.waist}
                          onChange={(event) => setCheckinForm((prev) => ({ ...prev, waist: event.target.value }))}
                          className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <textarea
                        placeholder="Ghi chú PT"
                        value={checkinForm.note}
                        onChange={(event) => setCheckinForm((prev) => ({ ...prev, note: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                      <button
                        onClick={handleSaveCheckin}
                        disabled={savingCheckin}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                      >
                        {savingCheckin ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Lưu check-in
                      </button>
                    </div>
                    </div>
                  )}

                </div>
              </div>
              )}

              {canManageWorkspace && (
              <div className="grid gap-8 xl:grid-cols-2">
                <div className="rounded-[28px] border border-violet-400/25 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,rgba(30,27,75,0.98),rgba(76,29,149,0.94))] p-6 shadow-[0_20px_42px_rgba(147,51,234,0.18)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Templates</h3>
                    <span className="text-xs font-bold text-violet-100/65">{templates.length} item</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {templates.map((template) => (
                      <div key={template.id} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-black text-white">{template.name}</p>
                            <p className="text-xs text-violet-100/70">
                              {template.goalType} • {template.targetCalories} kcal • {template.macroStrategy}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-violet-100">{template.status}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold text-violet-50">
                          <div className="rounded-xl bg-white/10 px-2 py-2">{template.targetProtein}P</div>
                          <div className="rounded-xl bg-white/10 px-2 py-2">{template.targetFat}F</div>
                          <div className="rounded-xl bg-white/10 px-2 py-2">{template.targetCarbs}C</div>
                        </div>
                        <p className="mt-2 text-xs text-violet-100/70">
                          Target user: {template.targetUser?.name || 'Tất cả học viên'} • Assignments: {template.assignments?.length || 0}
                        </p>
                        <button
                          type="button"
                          onClick={() => void openTemplatePreview(template)}
                          className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-violet-50 hover:bg-white/15"
                        >
                          <Eye size={14} />
                          Xem preview
                        </button>
                      </div>
                    ))}
                    {!templates.length && (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                        Chưa có template meal plan.
                      </div>
                    )}
                  </div>
                </div>

                <PTCheckinHistoryPanel
                  checkins={filteredCheckins.slice(0, 16)}
                  filterUserId={checkinHistoryUserId}
                  selectedMemberName={selectedCheckinHistoryMember?.name || null}
                  summary={checkinHistorySummary}
                  members={selectedWorkspaceMemberOptions.map((member) => ({ id: member.id, name: member.name }))}
                  onFilterChange={setCheckinHistoryUserId}
                />

              </div>
              )}
            </>
          )}
        </section>
      </div>

      {templatePreview && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setTemplatePreview(null)}
        >
          <div
            className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-violet-400/20 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,rgba(30,27,75,0.98),rgba(76,29,149,0.94))] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">Template Preview</p>
                <h2 className="mt-1 text-2xl font-black text-white">{templatePreview.template.name}</h2>
                <p className="mt-1 text-sm text-violet-100/70">
                  {templatePreview.template.goalType} • {templatePreview.template.targetCalories} kcal • {templatePreview.template.macroStrategy}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-2xl bg-white/10 px-4 py-2">
                    <p className="text-violet-100/60">Món</p>
                    <p className="text-lg text-white">{templatePreview.summary.totalMeals}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/10 px-4 py-2">
                    <p className="text-amber-200">Kcal</p>
                    <p className="text-lg text-white">
                      {Math.round(templatePreview.summary.totalCalories || 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/10 px-4 py-2">
                    <p className="text-emerald-200">Protein</p>
                    <p className="text-lg text-white">
                      {Math.round(templatePreview.summary.totalProtein || 0)}g
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTemplatePreview(null)}
                  className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/15"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {templatePreviewLoading ? (
              <div className="flex flex-1 items-center justify-center bg-[linear-gradient(135deg,_#f8fafc,_#ecfeff)] dark:bg-slate-950">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  <Loader2 size={18} className="animate-spin text-emerald-500" />
                  Đang tải preview...
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto bg-transparent p-5">
                {canManageWorkspace && (
                <form onSubmit={saveTemplatePreviewAdd} className="mb-5 rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Thêm món nhanh</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Chọn món từ DB, gán bữa và ngày rồi thêm ngay vào preview.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openTemplatePreviewAdd()}
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <select
                      value={templatePreviewAddForm.foodId}
                      onChange={(event) => setTemplatePreviewAddForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value={0}>Chọn món</option>
                      {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={templatePreviewAddForm.mealType}
                      onChange={(event) => setTemplatePreviewAddForm((current) => ({ ...current, mealType: event.target.value as BuilderDetail['mealType'] }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={templatePreviewAddForm.dayOfWeek}
                      onChange={(event) => setTemplatePreviewAddForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {DAY_LABELS.map((label, dayIndex) => (
                        <option key={label} value={dayIndex}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={templatePreviewAddForm.quantity}
                      onChange={(event) => setTemplatePreviewAddForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={templatePreviewAddSaving || templatePreviewAddForm.foodId === 0}
                      className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {templatePreviewAddSaving ? 'Đang thêm...' : 'Thêm vào preview'}
                    </button>
                  </div>
                </form>
                )}
                {templatePreviewEditingIndex !== null && templatePreview.preview.details?.[templatePreviewEditingIndex] && (
                  <form onSubmit={saveTemplatePreviewEdit} className="mb-5 rounded-[24px] border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Sửa món trong preview</p>
                        <h3 className="mt-1 text-lg font-black text-gray-900 dark:text-slate-100">
                          {resolvePreviewFood(
                            templatePreview.preview.details[templatePreviewEditingIndex].foodId,
                            templatePreview.preview.details[templatePreviewEditingIndex].food
                          )?.name || `#${templatePreview.preview.details[templatePreviewEditingIndex].foodId}`}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={closeTemplatePreviewEdit}
                        className="rounded-2xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Hủy
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <select
                        value={templatePreviewEditForm.foodId}
                        onChange={(event) => setTemplatePreviewEditForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value={0}>Chọn món</option>
                        {foods.map((food) => (
                          <option key={food.id} value={food.id}>
                            {food.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={templatePreviewEditForm.mealType}
                        onChange={(event) => setTemplatePreviewEditForm((current) => ({ ...current, mealType: event.target.value as BuilderDetail['mealType'] }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {MEAL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <select
                        value={templatePreviewEditForm.dayOfWeek}
                        onChange={(event) => setTemplatePreviewEditForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {DAY_LABELS.map((label, dayIndex) => (
                          <option key={label} value={dayIndex}>{label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={templatePreviewEditForm.quantity}
                        onChange={(event) => setTemplatePreviewEditForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => deleteTemplatePreviewDetail(templatePreviewEditingIndex)}
                        className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                      >
                        {templatePreviewEditSaving ? 'Đang xóa...' : 'Xóa món'}
                      </button>
                      <button
                        type="submit"
                        disabled={templatePreviewEditSaving || templatePreviewEditForm.foodId === 0}
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {templatePreviewEditSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                )}
                <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
                  {DAY_LABELS.map((dayLabel, dayIndex) => {
                    const dayDetails = (templatePreview.preview.details || [])
                      .map((detail, index) => ({ detail, index }))
                      .filter(({ detail }) => detail.dayOfWeek === dayIndex);
                    const totals = dayDetails.reduce(
                      (acc, detail) => {
                        const quantity = Number(detail.detail.quantity || 1);
                        const food = resolvePreviewFood(detail.detail.foodId, detail.detail.food);
                        acc.calories += Number(food?.calories || 0) * quantity;
                        acc.protein += Number(food?.protein || 0) * quantity;
                        acc.fat += Number(food?.fat || 0) * quantity;
                        acc.carbs += Number(food?.carbs || 0) * quantity;
                        return acc;
                      },
                      { calories: 0, protein: 0, fat: 0, carbs: 0 }
                    );

                  return (
                    <div key={dayLabel} className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-gray-900 dark:text-slate-100">{dayLabel}</p>
                        <div className="flex items-center gap-2">
                          {canManageWorkspace && (
                            <button
                              type="button"
                              onClick={() => openTemplatePreviewAdd(dayIndex)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300"
                              title="Thêm món vào ngày này"
                              aria-label={`Thêm món vào ${dayLabel}`}
                            >
                              <Plus size={14} />
                            </button>
                          )}
                          <span className="text-[11px] font-bold text-emerald-600">{Math.round(totals.calories)} kcal</span>
                        </div>
                      </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                          {Math.round(totals.protein)}P / {Math.round(totals.carbs)}C / {Math.round(totals.fat)}F
                        </p>
                        <div className="mt-4 space-y-3">
                          {dayDetails.length ? (
                            dayDetails.map(({ detail, index }) => (
                              <div key={`${dayLabel}-${detail.foodId}-${index}`} className="rounded-2xl border border-gray-100 p-3 dark:border-slate-800">
                                <div className="flex items-start gap-3">
                                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
                                    {resolvePreviewFood(detail.foodId, detail.food)?.imageUrl ? (
                                      <img
                                        src={getAssetUrl(resolvePreviewFood(detail.foodId, detail.food)?.imageUrl || '')}
                                        alt={resolvePreviewFood(detail.foodId, detail.food)?.name || `#${detail.foodId}`}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-xs font-black text-gray-400 dark:text-slate-500">?</div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="truncate text-sm font-black text-gray-900 dark:text-slate-100">
                                        {resolvePreviewFood(detail.foodId, detail.food)?.name || `#${detail.foodId}`}
                                      </p>
                                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-slate-800 dark:text-slate-300">
                                        {detail.mealType}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                      {detail.quantity || 1}x • {Math.round((resolvePreviewFood(detail.foodId, detail.food)?.calories || 0) * Number(detail.quantity || 1))} kcal
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openTemplatePreviewEdit(index)}
                                        className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void deleteTemplatePreviewDetail(index)}
                                        className="rounded-full border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                            <button
                              type="button"
                              onClick={() => openTemplatePreviewAdd(dayIndex)}
                              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 p-4 text-xs font-bold text-gray-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:text-slate-500 dark:hover:border-emerald-900/50 dark:hover:bg-emerald-900/10 dark:hover:text-emerald-300"
                            >
                              <Plus size={14} />
                              Thêm món vào ngày này
                            </button>
                          )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {assignedMealPlanPreview && (
        <div
          className="fixed inset-0 z-[61] bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setAssignedMealPlanPreview(null)}
        >
          <div
            className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-sky-400/20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,64,175,0.94))] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Assigned Meal Plan</p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {assignedMealPlanPreview.mealPlan.name}
                </h2>
                <p className="mt-1 text-sm text-sky-100/70">
                  Học viên: {assignedMealPlanPreview.assignment.user?.name || 'N/A'} •
                  {assignedMealPlanPreview.assignment.template?.name || 'Template'} •
                  {new Date(assignedMealPlanPreview.mealPlan.startDate).toLocaleDateString('vi-VN')} đến {new Date(assignedMealPlanPreview.mealPlan.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-2xl bg-white/10 px-4 py-2">
                    <p className="text-sky-100/60">Món</p>
                    <p className="text-lg text-white">{assignedMealPlanPreview.mealPlan.details.length}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/10 px-4 py-2">
                    <p className="text-amber-200">Kcal</p>
                    <p className="text-lg text-white">
                      {Math.round(assignedMealPlanPreview.mealPlan.details.reduce((sum, detail) => sum + detail.food.calories * detail.quantity, 0))}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/10 px-4 py-2">
                    <p className="text-emerald-200">Protein</p>
                    <p className="text-lg text-white">
                      {Math.round(assignedMealPlanPreview.mealPlan.details.reduce((sum, detail) => sum + detail.food.protein * detail.quantity, 0))}g
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignedMealPlanPreview(null)}
                  className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/15"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-transparent p-5">
              {canManageWorkspace && (
              <form onSubmit={saveAssignedMealPlanPreviewAdd} className="mb-5 rounded-[24px] border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Thêm món vào meal plan học viên</p>
                    <p className="mt-1 text-sm text-sky-100/70">Thêm món mới trực tiếp vào kế hoạch đã assign.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAssignedMealPlanPreviewAdd()}
                    className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-sky-50 hover:bg-white/15"
                  >
                    Reset
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <select
                    value={assignedMealPlanAddForm.foodId}
                    onChange={(event) => setAssignedMealPlanAddForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value={0}>Chọn món</option>
                    {foods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={assignedMealPlanAddForm.mealType}
                    onChange={(event) => setAssignedMealPlanAddForm((current) => ({ ...current, mealType: event.target.value as BuilderDetail['mealType'] }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {MEAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={assignedMealPlanAddForm.dayOfWeek}
                    onChange={(event) => setAssignedMealPlanAddForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {DAY_LABELS.map((label, dayIndex) => (
                      <option key={label} value={dayIndex}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={assignedMealPlanAddForm.quantity}
                    onChange={(event) => setAssignedMealPlanAddForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={assignedMealPlanAddSaving || assignedMealPlanAddForm.foodId === 0}
                    className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assignedMealPlanAddSaving ? 'Đang thêm...' : 'Thêm vào meal plan'}
                  </button>
                </div>
              </form>
              )}
              {canManageWorkspace && assignedMealPlanEditingIndex !== null && assignedMealPlanPreview.mealPlan.details?.[assignedMealPlanEditingIndex] && (
                <form onSubmit={saveAssignedMealPlanPreviewEdit} className="mb-5 rounded-[24px] border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Sửa món trong meal plan học viên</p>
                      <h3 className="mt-1 text-lg font-black text-white">
                        {resolvePreviewFood(
                          assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex].foodId,
                          assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex].food
                        )?.name || `#${assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex].foodId}`}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeAssignedMealPlanPreviewEdit}
                      className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-sky-50 hover:bg-white/15"
                    >
                      Hủy
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <select
                      value={assignedMealPlanEditForm.foodId}
                      onChange={(event) => setAssignedMealPlanEditForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value={0}>Chọn món</option>
                      {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={assignedMealPlanEditForm.mealType}
                      onChange={(event) => setAssignedMealPlanEditForm((current) => ({ ...current, mealType: event.target.value as BuilderDetail['mealType'] }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={assignedMealPlanEditForm.dayOfWeek}
                      onChange={(event) => setAssignedMealPlanEditForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {DAY_LABELS.map((label, dayIndex) => (
                        <option key={label} value={dayIndex}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={assignedMealPlanEditForm.quantity}
                      onChange={(event) => setAssignedMealPlanEditForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => deleteAssignedMealPlanPreviewDetail(assignedMealPlanEditingIndex)}
                      className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      {assignedMealPlanEditSaving ? 'Đang xóa...' : 'Xóa món'}
                    </button>
                    <button
                      type="submit"
                      disabled={assignedMealPlanEditSaving || assignedMealPlanEditForm.foodId === 0}
                      className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {assignedMealPlanEditSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
                {DAY_LABELS.map((dayLabel, dayIndex) => {
                  const dayDetails = (assignedMealPlanPreview.mealPlan.details || [])
                    .map((detail, index) => ({ detail, index }))
                    .filter(({ detail }) => detail.dayOfWeek === dayIndex);
                  const totals = dayDetails.reduce(
                    (acc, detail) => {
                      const quantity = Number(detail.detail.quantity || 1);
                      const food = resolvePreviewFood(detail.detail.foodId, detail.detail.food);
                      acc.calories += Number(food?.calories || 0) * quantity;
                      acc.protein += Number(food?.protein || 0) * quantity;
                      acc.fat += Number(food?.fat || 0) * quantity;
                      acc.carbs += Number(food?.carbs || 0) * quantity;
                      return acc;
                    },
                    { calories: 0, protein: 0, fat: 0, carbs: 0 }
                  );

                  return (
                    <div key={dayLabel} className="rounded-[24px] border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-white">{dayLabel}</p>
                        <div className="flex items-center gap-2">
                          {canManageWorkspace && (
                            <button
                              type="button"
                              onClick={() => openAssignedMealPlanPreviewAdd(dayIndex)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sky-100 hover:bg-white/15"
                              title="Thêm món vào ngày này"
                              aria-label={`Thêm món vào ${dayLabel}`}
                            >
                              <Plus size={14} />
                            </button>
                          )}
                          <span className="text-[11px] font-bold text-sky-200">{Math.round(totals.calories)} kcal</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-sky-100/70">
                        {Math.round(totals.protein)}P / {Math.round(totals.carbs)}C / {Math.round(totals.fat)}F
                      </p>
                      <div className="mt-4 space-y-3">
                        {dayDetails.length ? (
                          dayDetails.map(({ detail, index }) => (
                            <div key={`${dayLabel}-${detail.foodId}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
                                  {resolvePreviewFood(detail.foodId, detail.food)?.imageUrl ? (
                                    <img
                                      src={getAssetUrl(resolvePreviewFood(detail.foodId, detail.food)?.imageUrl || '')}
                                      alt={resolvePreviewFood(detail.foodId, detail.food)?.name || `#${detail.foodId}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-black text-sky-100/60">?</div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-black text-white">
                                      {resolvePreviewFood(detail.foodId, detail.food)?.name || `#${detail.foodId}`}
                                    </p>
                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-sky-100">
                                      {detail.mealType}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-sky-100/70">
                                    {detail.quantity || 1}x • {Math.round((resolvePreviewFood(detail.foodId, detail.food)?.calories || 0) * Number(detail.quantity || 1))} kcal
                                  </p>
                                  {canManageWorkspace && (
                                    <div className="mt-2 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openAssignedMealPlanPreviewEdit(index)}
                                        className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold text-sky-50 hover:bg-white/10"
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void deleteAssignedMealPlanPreviewDetail(index)}
                                        className="rounded-full border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAssignedMealPlanPreviewAdd(dayIndex)}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-4 text-xs font-bold text-sky-100/70 hover:bg-white/10 hover:text-white"
                          >
                            <Plus size={14} />
                            Thêm món vào ngày này
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTWorkspacePage;
