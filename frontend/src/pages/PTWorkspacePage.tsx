import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Copy, Eye, Loader2, Plus, RefreshCcw, Sparkles, UserPlus, Users, X, CheckCircle2, NotebookPen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFoods } from '../services/food.service';
import {
  assignMealPlanTemplate,
  createMealPlanTemplate,
  createProgressCheckin,
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
  updateMealPlanTemplate,
  updateAssignedMealPlanDetail,
  deleteAssignedMealPlanDetail,
  type PTMealPlanTemplate,
  type PTMealPlanTemplatePreview,
  type PTProgressCheckin,
  type PTWorkspace,
  type PTWorkspaceMember,
} from '../services/pt.service';
import type { FoodItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getAssetUrl } from '../services/api';

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

const PTWorkspacePage = () => {
  const { user } = useAuth();
  const isTrainer = user?.role === 'PT' || user?.role === 'ADMIN';
  const canManageWorkspace = isTrainer;
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<PTWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Awaited<ReturnType<typeof getWorkspaceById>> | null>(null);
  const [members, setMembers] = useState<PTWorkspaceMember[]>([]);
  const [templates, setTemplates] = useState<PTMealPlanTemplate[]>([]);
  const [checkins, setCheckins] = useState<PTProgressCheckin[]>([]);
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

  const selectedSeedMember = useMemo(() => {
    if (!members.length) return null;
    return members.find((member) => member.userId === selectedSeedMemberId && member.status === 'ACTIVE')
      || members.find((member) => member.status === 'ACTIVE')
      || null;
  }, [members, selectedSeedMemberId]);

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
        const servings = mealType === 'SNACK'
          ? 0.5
          : Math.max(0.5, Math.min(1.5, Number((targetKcal / Math.max(food.calories, 1)).toFixed(2))));
        rows.push({
          foodId: food.id,
          mealType,
          dayOfWeek: dayIndex,
          quantity: Number(servings.toFixed(2)),
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
      targetUserId: member?.userId || 0,
      macroStrategy: targetProtein >= 160 ? 'HIGH_PROTEIN' : targetCalories <= 1800 ? 'LOW_CARB' : 'BALANCED',
    }));
    setSelectedSeedMemberId(member?.userId || 0);
    setAssignUserIds(member?.userId ? [member.userId] : []);
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
        setMembers([]);
        setTemplates([]);
        setCheckins([]);
        setMyAssignedMealPlanPreview(null);
      }
    } catch {
      toast.error('Không thể tải PT workspace');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async (workspaceId: number) => {
    setWorkspaceBusy(true);
    setTemplatePreview(null);
    setAssignedMealPlanPreview(null);
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
      setMembers(fallbackMembers);
      setTemplates(fallbackTemplates);
      setCheckins(checkinList);
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
      toast.error('Không thể tải workspace chi tiết');
    } finally {
      setWorkspaceBusy(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const interval = window.setInterval(() => {
      void loadWorkspace(selectedWorkspaceId);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [selectedWorkspaceId]);

  const refreshWorkspace = async () => {
    if (!selectedWorkspaceId) return;
    await loadWorkspace(selectedWorkspaceId);
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

  if (loading && !workspaces.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-3xl bg-gray-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">PT Workspace</p>
            <h1 className="mt-2 text-3xl font-black">Quản lý học viên, meal plan và check-in</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-200">
              Tạo workspace riêng cho PT, mời học viên bằng invite code, dựng meal plan template, xem preview và assign cho từng nhóm hoặc từng người.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshWorkspace()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
            >
              <RefreshCcw size={16} />
              Làm mới
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-slate-100">Workspace của bạn</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{workspaces.length} workspace</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {workspaces.map((workspace) => {
                const active = selectedWorkspaceId === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => loadWorkspace(workspace.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      active
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-900/20'
                        : 'border-gray-100 bg-white hover:border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black text-gray-900 dark:text-slate-100">{workspace.name}</p>
                      <span className="text-[11px] font-bold text-gray-400">{workspace._count?.members || 0} HV</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">{workspace.description || 'Chưa có mô tả'}</p>
                  </button>
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
            <form onSubmit={handleCreateWorkspace} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" />
                <p className="text-sm font-black text-gray-900 dark:text-slate-100">Tạo workspace</p>
              </div>
            <div className="mt-3 space-y-3">
              <input
                value={workspaceForm.name}
                onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Tên workspace"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <textarea
                value={workspaceForm.description}
                onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả ngắn"
                rows={3}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                disabled={creatingWorkspace}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {creatingWorkspace ? 'Đang tạo...' : 'Tạo workspace'}
              </button>
            </div>
            </form>
          )}

          <form onSubmit={handleJoinWorkspace} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-blue-500" />
              <p className="text-sm font-black text-gray-900 dark:text-slate-100">Join bằng code</p>
            </div>
            <div className="mt-3 space-y-3">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="PT-XXXXXX"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                disabled={joiningWorkspace}
                className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60"
              >
                {joiningWorkspace ? 'Đang join...' : 'Tham gia workspace'}
              </button>
            </div>
          </form>

          <form onSubmit={handleInviteByEmail} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-emerald-500" />
              <p className="text-sm font-black text-gray-900 dark:text-slate-100">Mời bằng email</p>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              PT/Admin nhập email học viên để thêm vào workspace. User vẫn có thể join bằng mã mời.
            </p>
            <div className="mt-3 space-y-3">
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                disabled={invitingByEmail}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {invitingByEmail ? 'Đang mời...' : 'Mời thêm học viên'}
              </button>
            </div>
          </form>
        </aside>

        <section className="space-y-6">
          {!selectedWorkspace ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-lg font-black text-gray-900 dark:text-slate-100">Chọn hoặc tạo một workspace</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Sau đó bạn sẽ có đầy đủ member, template, assign và check-in.</p>
            </div>
          ) : (
            <>
              <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-emerald-500">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Workspace đang mở</p>
                        <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-slate-100">{selectedWorkspace.name}</h2>
                      </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-slate-300">{selectedWorkspace.description || 'Chưa có mô tả workspace'}</p>
                    {workspaceBusy && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                        <Loader2 size={12} className="animate-spin" />
                        Đang tải workspace...
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300">
                      <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-slate-800">Mã mời: <span className="font-black">{selectedWorkspace.inviteCode}</span></span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-slate-800">Học viên: <span className="font-black">{members.length}</span></span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-slate-800">Template: <span className="font-black">{templates.length}</span></span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-slate-800">Check-in: <span className="font-black">{checkins.length}</span></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canManageWorkspace && (
                      <>
                        <button
                          onClick={handleCopyInvite}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          <Copy size={16} />
                          Copy code
                        </button>
                        <button
                          onClick={handleRegenerateInvite}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600"
                        >
                          <RefreshCcw size={16} />
                          Đổi code
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] xl:items-start">
                <div className="space-y-6">
                  {!canManageWorkspace && (
                    <div className="rounded-[28px] border border-gray-100 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-sm dark:border-slate-700">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Workspace của bạn</p>
                      <h3 className="mt-2 text-2xl font-black">{selectedWorkspace.name}</h3>
                      <p className="mt-2 text-sm text-slate-200/90">
                        {selectedWorkspace.description || 'Bạn đã tham gia workspace này. Hãy xem meal plan được PT giao và thực hiện log đúng lịch.'}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold">
                        <div className="rounded-2xl bg-white/10 px-3 py-2">
                          Workspace
                        </div>
                        <div className="rounded-2xl bg-white/10 px-3 py-2">
                          {selectedWorkspaceMemberOptions.length} học viên
                        </div>
                      </div>
                    </div>
                  )}
                  {!canManageWorkspace && (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Meal plan của tôi</p>
                          <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Kế hoạch được PT giao</h3>
                        </div>
                      </div>
                      <div className="mt-4">
                        {myAssignedMealPlanPreview ? (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                            <p className="font-black text-gray-900 dark:text-slate-100">{myAssignedMealPlanPreview.mealPlan.name}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                              {myAssignedMealPlanPreview.assignment.template?.name || 'Template'} •{' '}
                              {new Date(myAssignedMealPlanPreview.mealPlan.startDate).toLocaleDateString('vi-VN')} -{' '}
                              {new Date(myAssignedMealPlanPreview.mealPlan.endDate).toLocaleDateString('vi-VN')}
                            </p>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                              <div className="rounded-2xl bg-white px-3 py-2 dark:bg-slate-950">
                                <p className="text-gray-400">Món</p>
                                <p className="text-base text-gray-900 dark:text-slate-100">{myAssignedMealPlanPreview.mealPlan.details.length}</p>
                              </div>
                              <div className="rounded-2xl bg-white px-3 py-2 dark:bg-slate-950">
                                <p className="text-gray-400">Kcal</p>
                                <p className="text-base text-gray-900 dark:text-slate-100">
                                  {Math.round(myAssignedMealPlanPreview.mealPlan.details.reduce((sum, detail) => sum + detail.food.calories * detail.quantity, 0))}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white px-3 py-2 dark:bg-slate-950">
                                <p className="text-gray-400">Protein</p>
                                <p className="text-base text-gray-900 dark:text-slate-100">
                                  {Math.round(myAssignedMealPlanPreview.mealPlan.details.reduce((sum, detail) => sum + detail.food.protein * detail.quantity, 0))}g
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void openAssignedMealPlanPreview(user?.id || 0)}
                              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                            >
                              <Eye size={16} />
                              Xem meal plan của tôi
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                            PT chưa gán meal plan cho bạn.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {canManageWorkspace && (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Thành viên</p>
                        <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Học viên trong workspace</h3>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{members.filter((item) => item.status === 'ACTIVE').length} active</span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {members.map((member) => (
                        <label
                          key={member.id}
                          className={`flex items-start gap-3 rounded-2xl border p-3 ${
                            assignUserIds.includes(member.userId)
                              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20'
                              : 'border-gray-100 dark:border-slate-700'
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
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-black text-gray-900 dark:text-slate-100">{member.user.name}</p>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-slate-800 dark:text-slate-300">{member.status}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{member.user.email}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
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
                  )}

                  {canManageWorkspace && (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Template meal plan</p>
                        <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Tạo template & preview</h3>
                      </div>
                    </div>

                    <form onSubmit={handleCreateTemplate} className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={templateForm.name}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Tên template"
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <select
                          value={templateForm.goalType}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, goalType: event.target.value as typeof templateForm.goalType }))}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          {GOAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <input type="number" value={templateForm.targetCalories} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetCalories: Number(event.target.value) }))} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Calo" />
                        <input type="number" value={templateForm.targetProtein} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetProtein: Number(event.target.value) }))} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Protein" />
                        <input type="number" value={templateForm.targetFat} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetFat: Number(event.target.value) }))} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Fat" />
                        <input type="number" value={templateForm.targetCarbs} onChange={(event) => setTemplateForm((prev) => ({ ...prev, targetCarbs: Number(event.target.value) }))} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Carbs" />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <select
                          value={templateForm.macroStrategy}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, macroStrategy: event.target.value }))}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          {MACRO_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <select
                          value={templateStatus}
                          onChange={(event) => setTemplateStatus(event.target.value as typeof templateStatus)}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="READY">Ready</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <select
                          value={templateForm.targetUserId}
                          onChange={(event) => {
                            const member = members.find((item) => item.userId === Number(event.target.value));
                            setTemplateForm((prev) => ({ ...prev, targetUserId: Number(event.target.value) }));
                            if (member) setSelectedSeedMemberId(member.userId);
                          }}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value={0}>Áp dụng cho cả workspace</option>
                          {selectedWorkspaceMemberOptions.map((member) => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => applyAutoTemplate(selectedSeedMember)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
                        >
                          <Sparkles size={16} />
                          Tạo template tự động
                        </button>
                        <button type="button" onClick={addBuilderRow} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                          <Plus size={16} />
                          Thêm món vào preview
                        </button>
                      </div>

                      <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-slate-100">Dùng hồ sơ học viên để dựng meal plan</p>
                            <p className="text-xs text-gray-600 dark:text-slate-300">
                              Chọn 1 học viên rồi bấm tạo tự động. Hệ thống sẽ lấy calo mục tiêu và sinh 7 ngày preview theo bữa.
                            </p>
                          </div>
                          <select
                            value={selectedSeedMemberId}
                            onChange={(event) => setSelectedSeedMemberId(Number(event.target.value))}
                            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value={0}>Chọn học viên</option>
                            {members.filter((member) => member.status === 'ACTIVE').map((member) => (
                              <option key={member.id} value={member.userId}>
                                {member.user.name} • {member.user.profile?.targetCalories || 2000} kcal
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-3xl border border-gray-100 p-4 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-gray-900 dark:text-slate-100">Preview builder</p>
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Tổng khoảng {Math.round(previewSummary.calories)} kcal</p>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4">
                          {previewByDay.map((day) => (
                            <div key={day.dayIndex} className="rounded-2xl border border-gray-100 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-gray-500 dark:text-slate-400">{day.label}</p>
                                <span className="text-[10px] font-bold text-emerald-600">{day.rows.length} món</span>
                              </div>
                              <p className="mt-1 text-sm font-black text-gray-900 dark:text-slate-100">{Math.round(day.totals.calories)} kcal</p>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400">{Math.round(day.totals.protein)}P / {Math.round(day.totals.carbs)}C / {Math.round(day.totals.fat)}F</p>
                            </div>
                          ))}
                        </div>
                        <input
                          value={foodQuery}
                          onChange={(event) => setFoodQuery(event.target.value)}
                          placeholder="Tìm món theo tên hoặc danh mục"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <div className="space-y-3">
                          {builderDetails.map((row, index) => {
                            const selectedFood = foods.find((food) => food.id === row.foodId);
                            return (
                              <div key={`${index}-${row.foodId}`} className="grid gap-3 rounded-2xl border border-gray-100 p-3 md:grid-cols-[minmax(0,1.5fr)_minmax(96px,0.7fr)_minmax(96px,0.7fr)_84px_48px] dark:border-slate-700">
                                <select
                                  value={row.foodId}
                                  onChange={(event) => updateBuilderRow(index, { foodId: Number(event.target.value) })}
                                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                  {MEAL_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <select
                                  value={row.dayOfWeek}
                                  onChange={(event) => updateBuilderRow(index, { dayOfWeek: Number(event.target.value) })}
                                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                                  <div className="md:col-span-5 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-slate-800">
                                    {getAssetUrl(selectedFood.imageUrl) ? (
                                      <img src={getAssetUrl(selectedFood.imageUrl)} alt={selectedFood.name} className="h-10 w-10 rounded-lg object-cover" />
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-500 dark:bg-slate-700">?</div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{selectedFood.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-slate-400">{selectedFood.category} • {selectedFood.calories} kcal / 1 phần</p>
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
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                        >
                          {creatingTemplate ? <Loader2 size={16} className="animate-spin" /> : <NotebookPen size={16} />}
                          Tạo template
                        </button>
                      </div>
                    </form>
                    </div>
                  )}
                </div>

                <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                  {canManageWorkspace && (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Assign</p>
                        <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Gán template cho học viên</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <select
                        value={assignTemplateId || 0}
                        onChange={(event) => setAssignTemplateId(Number(event.target.value) || null)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <input
                          type="date"
                          value={assignEndDate}
                          onChange={(event) => setAssignEndDate(event.target.value)}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-300">
                          Kích hoạt ngay
                          <input
                            type="checkbox"
                            checked={assignActive}
                            onChange={(event) => setAssignActive(event.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-emerald-600"
                          />
                        </label>
                        <button
                          onClick={handleAssignTemplate}
                          disabled={assigningTemplate}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {assigningTemplate ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                          Gán cho học viên
                        </button>
                        {lastAssignedMealPlanId && (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
                            <p className="font-black">Gán gần nhất</p>
                            <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                              {lastAssignedUserIds.length} học viên • Meal plan #{lastAssignedMealPlanId}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={!lastAssignedUserIds.length || assignedMealPlanPreviewLoading}
                                onClick={() => void openAssignedMealPlanPreview(lastAssignedUserIds[0])}
                                className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                                className="rounded-2xl border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
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
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Check-in</p>
                        <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Theo dõi tiến độ học viên</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <select
                        value={checkinForm.userId}
                        onChange={(event) => setCheckinForm((prev) => ({ ...prev, userId: Number(event.target.value) }))}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <input
                          type="number"
                          placeholder="% mỡ"
                          value={checkinForm.bodyFat}
                          onChange={(event) => setCheckinForm((prev) => ({ ...prev, bodyFat: event.target.value }))}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <input
                          type="number"
                          placeholder="Vòng eo"
                          value={checkinForm.waist}
                          onChange={(event) => setCheckinForm((prev) => ({ ...prev, waist: event.target.value }))}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <textarea
                        placeholder="Ghi chú PT"
                        value={checkinForm.note}
                        onChange={(event) => setCheckinForm((prev) => ({ ...prev, note: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                      <button
                        onClick={handleSaveCheckin}
                        disabled={savingCheckin}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      >
                        {savingCheckin ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Lưu check-in
                      </button>
                    </div>
                    </div>
                  )}

                  {!canManageWorkspace ? (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Hướng dẫn</p>
                          <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Dành cho học viên</h3>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-slate-300">
                        <p>1. Vào workspace bằng mã mời từ PT.</p>
                        <p>2. Xem meal plan được giao ở thẻ bên trái.</p>
                        <p>3. Log ăn uống và nước mỗi ngày để PT theo dõi tiến độ.</p>
                        <p>4. Nếu cần đổi món, nhắn PT để được điều chỉnh.</p>
                      </div>
                    </div>
                  ) : (
                  <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Tổng quan</p>
                        <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-100">Template gần nhất</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {templates.slice(0, 5).map((template) => (
                        <div
                          key={template.id}
                          className="w-full rounded-2xl border border-gray-100 px-4 py-3 text-left hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <button
                            type="button"
                            onClick={async () => {
                              setAssignTemplateId(template.id);
                              await openTemplatePreview(template);
                            }}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-black text-gray-900 dark:text-slate-100">{template.name}</p>
                              <span className="text-[11px] font-bold text-gray-400">{template.status}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                              {template.goalType} • {template.targetCalories} kcal • {template.assignments?.length || 0} lần gán
                            </p>
                          </button>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void openTemplatePreview(template)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <Eye size={14} />
                              Preview
                            </button>
                            {canManageWorkspace && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteTemplate(template)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-900/20"
                              >
                                <X size={14} />
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {!templates.length && (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                          Chưa có template nào.
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>

              {canManageWorkspace && (
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Templates</h3>
                    <span className="text-xs font-bold text-gray-400">{templates.length} item</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {templates.map((template) => (
                      <div key={template.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-700">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-black text-gray-900 dark:text-slate-100">{template.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {template.goalType} • {template.targetCalories} kcal • {template.macroStrategy}
                            </p>
                          </div>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500 dark:bg-slate-800 dark:text-slate-300">{template.status}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-600 dark:text-slate-300">
                          <div className="rounded-xl bg-gray-50 px-2 py-2 dark:bg-slate-800">{template.targetProtein}P</div>
                          <div className="rounded-xl bg-gray-50 px-2 py-2 dark:bg-slate-800">{template.targetFat}F</div>
                          <div className="rounded-xl bg-gray-50 px-2 py-2 dark:bg-slate-800">{template.targetCarbs}C</div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                          Target user: {template.targetUser?.name || 'Tất cả học viên'} • Assignments: {template.assignments?.length || 0}
                        </p>
                        <button
                          type="button"
                          onClick={() => void openTemplatePreview(template)}
                          className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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

                <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Check-in gần nhất</h3>
                    <span className="text-xs font-bold text-gray-400">{checkins.length} item</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {checkins.slice(0, 8).map((checkin) => (
                      <div key={checkin.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-700">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-black text-gray-900 dark:text-slate-100">{checkin.user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(checkin.recordedAt).toLocaleString()}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-400">{checkin.weight ? `${checkin.weight} kg` : 'No weight'}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                          {checkin.note || 'Không có ghi chú'}
                        </p>
                      </div>
                    ))}
                    {!checkins.length && (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                        Chưa có check-in nào.
                      </div>
                    )}
                  </div>
                </div>
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
            className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Template Preview</p>
                <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-slate-100">{templatePreview.template.name}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {templatePreview.template.goalType} • {templatePreview.template.targetCalories} kcal • {templatePreview.template.macroStrategy}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-2xl bg-gray-50 px-4 py-2 dark:bg-slate-900">
                    <p className="text-gray-400 dark:text-slate-500">Món</p>
                    <p className="text-lg text-gray-900 dark:text-slate-100">{templatePreview.summary.totalMeals}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-4 py-2 dark:bg-amber-900/20">
                    <p className="text-amber-500">Kcal</p>
                    <p className="text-lg text-amber-800 dark:text-amber-300">
                      {Math.round(templatePreview.summary.totalCalories || 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
                    <p className="text-emerald-500">Protein</p>
                    <p className="text-lg text-emerald-800 dark:text-emerald-300">
                      {Math.round(templatePreview.summary.totalProtein || 0)}g
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTemplatePreview(null)}
                  className="rounded-2xl bg-gray-100 p-3 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
              <div className="flex-1 overflow-auto bg-[linear-gradient(135deg,_#f8fafc,_#ecfeff)] p-5 dark:bg-slate-950">
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
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={templatePreviewAddForm.dayOfWeek}
                      onChange={(event) => setTemplatePreviewAddForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {MEAL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <select
                        value={templatePreviewEditForm.dayOfWeek}
                        onChange={(event) => setTemplatePreviewEditForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
            className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Assigned Meal Plan</p>
                <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-slate-100">
                  {assignedMealPlanPreview.mealPlan.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Học viên: {assignedMealPlanPreview.assignment.user?.name || 'N/A'} •
                  {assignedMealPlanPreview.assignment.template?.name || 'Template'} •
                  {new Date(assignedMealPlanPreview.mealPlan.startDate).toLocaleDateString('vi-VN')} đến {new Date(assignedMealPlanPreview.mealPlan.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-2xl bg-gray-50 px-4 py-2 dark:bg-slate-900">
                    <p className="text-gray-400 dark:text-slate-500">Món</p>
                    <p className="text-lg text-gray-900 dark:text-slate-100">{assignedMealPlanPreview.mealPlan.details.length}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-4 py-2 dark:bg-amber-900/20">
                    <p className="text-amber-500">Kcal</p>
                    <p className="text-lg text-amber-800 dark:text-amber-300">
                      {Math.round(assignedMealPlanPreview.mealPlan.details.reduce((sum, detail) => sum + detail.food.calories * detail.quantity, 0))}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
                    <p className="text-emerald-500">Protein</p>
                    <p className="text-lg text-emerald-800 dark:text-emerald-300">
                      {Math.round(assignedMealPlanPreview.mealPlan.details.reduce((sum, detail) => sum + detail.food.protein * detail.quantity, 0))}g
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignedMealPlanPreview(null)}
                  className="rounded-2xl bg-gray-100 p-3 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[linear-gradient(135deg,_#f8fafc,_#ecfeff)] p-5 dark:bg-slate-950">
              {canManageWorkspace && (
              <form onSubmit={saveAssignedMealPlanPreviewAdd} className="mb-5 rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Thêm món vào meal plan học viên</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Thêm món mới trực tiếp vào kế hoạch đã assign.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAssignedMealPlanPreviewAdd()}
                    className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <select
                    value={assignedMealPlanAddForm.foodId}
                    onChange={(event) => setAssignedMealPlanAddForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {MEAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={assignedMealPlanAddForm.dayOfWeek}
                    onChange={(event) => setAssignedMealPlanAddForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                <form onSubmit={saveAssignedMealPlanPreviewEdit} className="mb-5 rounded-[24px] border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-900/50 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Sửa món trong meal plan học viên</p>
                      <h3 className="mt-1 text-lg font-black text-gray-900 dark:text-slate-100">
                        {resolvePreviewFood(
                          assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex].foodId,
                          assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex].food
                        )?.name || `#${assignedMealPlanPreview.mealPlan.details[assignedMealPlanEditingIndex].foodId}`}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeAssignedMealPlanPreviewEdit}
                      className="rounded-2xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Hủy
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <select
                      value={assignedMealPlanEditForm.foodId}
                      onChange={(event) => setAssignedMealPlanEditForm((current) => ({ ...current, foodId: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={assignedMealPlanEditForm.dayOfWeek}
                      onChange={(event) => setAssignedMealPlanEditForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                    <div key={dayLabel} className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-gray-900 dark:text-slate-100">{dayLabel}</p>
                        <div className="flex items-center gap-2">
                          {canManageWorkspace && (
                            <button
                              type="button"
                              onClick={() => openAssignedMealPlanPreviewAdd(dayIndex)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300"
                              title="Thêm món vào ngày này"
                              aria-label={`Thêm món vào ${dayLabel}`}
                            >
                              <Plus size={14} />
                            </button>
                          )}
                          <span className="text-[11px] font-bold text-blue-600">{Math.round(totals.calories)} kcal</span>
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
                                  {canManageWorkspace && (
                                    <div className="mt-2 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openAssignedMealPlanPreviewEdit(index)}
                                        className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 p-4 text-xs font-bold text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:text-slate-500 dark:hover:border-blue-900/50 dark:hover:bg-blue-900/10 dark:hover:text-blue-300"
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
