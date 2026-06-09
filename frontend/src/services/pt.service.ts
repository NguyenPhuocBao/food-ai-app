import api from './api';
import type { FoodItem, MealPlan, MealPlanDetail } from '../types';

export type WorkspaceMemberStatus = 'PENDING' | 'ACTIVE' | 'LEFT' | 'BLOCKED';
export type MealPlanTemplateStatus = 'DRAFT' | 'READY' | 'ASSIGNED' | 'ARCHIVED';
export type MealPlanAssignmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type PTWorkspace = {
  id: number;
  ownerUserId: number;
  name: string;
  description?: string | null;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: { id: number; name: string; email: string; role: string };
  _count?: { members: number; templates: number; assignments: number; checkins: number };
};

export type PTWorkspaceMember = {
  id: number;
  workspaceId: number;
  userId: number;
  status: WorkspaceMemberStatus;
  note?: string | null;
  joinedAt: string;
  leftAt?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
      height?: number | null;
      weight?: number | null;
      targetCalories?: number | null;
      targetProtein?: number | null;
      targetFat?: number | null;
      targetCarbs?: number | null;
      dietaryPref?: string[];
      allergies?: string[];
    } | null;
  };
};

export type PTMealPlanTemplate = {
  id: number;
  workspaceId: number;
  createdByUserId: number;
  targetUserId?: number | null;
  name: string;
  goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  macroStrategy: string;
  previewData?: {
    details?: Array<{
      foodId: number;
      mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
      dayOfWeek: number;
      quantity?: number;
      food?: FoodItem;
    }>;
    notes?: string;
  } | null;
  status: MealPlanTemplateStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: number; name: string; email: string };
  targetUser?: { id: number; name: string; email: string } | null;
  assignments?: Array<{
    id: number;
    userId: number;
    status: MealPlanAssignmentStatus;
    startDate: string;
    endDate?: string | null;
  }>;
};

export type PTMealPlanTemplatePreview = {
  details?: Array<{
    foodId: number;
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    dayOfWeek: number;
    quantity?: number;
    food?: FoodItem | null;
  }>;
  notes?: string;
};

export type PTProgressCheckin = {
  id: number;
  workspaceId: number;
  userId: number;
  recordedByUserId?: number | null;
  weight?: number | null;
  bodyFat?: number | null;
  waist?: number | null;
  photoUrl?: string | null;
  note?: string | null;
  recordedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
      height?: number | null;
      weight?: number | null;
    } | null;
  };
  recordedBy?: { id: number; name: string; email: string } | null;
};

export type PTWorkspaceChatMessage = {
  id: number;
  workspaceId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
    } | null;
  };
};

export type PTAssignedMealPlanPreview = {
  assignment: {
    id: number;
    workspaceId: number;
    templateId: number;
    userId: number;
    assignedByUserId: number;
    assignedMealPlanId?: number | null;
    startDate: string;
    endDate?: string | null;
    status: MealPlanAssignmentStatus;
    template?: {
      id: number;
      name: string;
      goalType: string;
      targetCalories: number;
      targetProtein: number;
      targetFat: number;
      targetCarbs: number;
      macroStrategy: string;
    } | null;
    user?: { id: number; name: string; email: string } | null;
  };
  mealPlan: {
    id: number;
    userId: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    details: Array<{
      id: number;
      mealPlanId: number;
      foodId: number;
      mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
      dayOfWeek: number;
      quantity: number;
      food: FoodItem;
    }>;
  };
};

export const getMyWorkspaces = async (): Promise<PTWorkspace[]> => {
  const response = await api.get('/pt/workspaces');
  return response.data.data;
};

export const createWorkspace = async (payload: { name: string; description?: string }): Promise<PTWorkspace> => {
  const response = await api.post('/pt/workspaces', payload);
  return response.data.data;
};

export const deleteWorkspace = async (id: number): Promise<PTWorkspace> => {
  const response = await api.delete(`/pt/workspaces/${id}`);
  return response.data.data;
};

export const getWorkspaceById = async (id: number) => {
  const response = await api.get(`/pt/workspaces/${id}`);
  return response.data.data as PTWorkspace & {
    members: PTWorkspaceMember[];
    templates: PTMealPlanTemplate[];
  };
};

export const updateWorkspace = async (id: number, payload: { name?: string; description?: string; isActive?: boolean }) => {
  const response = await api.patch(`/pt/workspaces/${id}`, payload);
  return response.data.data as PTWorkspace;
};

export const regenerateInviteCode = async (id: number) => {
  const response = await api.post(`/pt/workspaces/${id}/invite-code`);
  return response.data.data as PTWorkspace;
};

export const joinWorkspaceByCode = async (inviteCode: string) => {
  const response = await api.post('/pt/workspaces/join', { inviteCode });
  return response.data.data;
};

export const inviteWorkspaceMemberByEmail = async (workspaceId: number, email: string) => {
  const response = await api.post(`/pt/workspaces/${workspaceId}/invite-email`, { email });
  return response.data.data as PTWorkspaceMember;
};

export const leaveWorkspace = async (id: number) => {
  await api.post(`/pt/workspaces/${id}/leave`);
};

export const listWorkspaceMembers = async (id: number): Promise<PTWorkspaceMember[]> => {
  const response = await api.get(`/pt/workspaces/${id}/members`);
  return response.data.data;
};

export const listMealPlanTemplates = async (id: number): Promise<PTMealPlanTemplate[]> => {
  const response = await api.get(`/pt/workspaces/${id}/templates`);
  return response.data.data;
};

export const createMealPlanTemplate = async (
  id: number,
  payload: {
    name: string;
    goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
    targetCalories: number;
    targetProtein: number;
    targetFat: number;
    targetCarbs: number;
    macroStrategy?: string;
    targetUserId?: number | null;
    status?: MealPlanTemplateStatus;
    previewData?: {
      details?: Array<{
        foodId: number;
        mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
        dayOfWeek: number;
        quantity?: number;
      }>;
      notes?: string;
    };
  }
): Promise<PTMealPlanTemplate> => {
  const response = await api.post(`/pt/workspaces/${id}/templates`, payload);
  return response.data.data;
};

export const updateMealPlanTemplate = async (
  workspaceId: number,
  templateId: number,
  payload: Partial<{
    name: string;
    goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
    targetCalories: number;
    targetProtein: number;
    targetFat: number;
    targetCarbs: number;
    macroStrategy: string;
    targetUserId?: number | null;
    status: MealPlanTemplateStatus;
    previewData: unknown;
  }>
) => {
  const response = await api.patch(`/pt/workspaces/${workspaceId}/templates/${templateId}`, payload);
  return response.data.data as PTMealPlanTemplate;
};

export const deleteMealPlanTemplate = async (workspaceId: number, templateId: number) => {
  const response = await api.delete(`/pt/workspaces/${workspaceId}/templates/${templateId}`);
  return response.data.data as { deleted: PTMealPlanTemplate; assignmentCount: number };
};

export const previewMealPlanTemplate = async (workspaceId: number, templateId: number) => {
  const response = await api.get(`/pt/workspaces/${workspaceId}/templates/${templateId}`);
  return response.data.data as {
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
};

export const assignMealPlanTemplate = async (
  workspaceId: number,
  templateId: number,
  payload: {
    userIds: number[];
    startDate?: string;
    endDate?: string;
    activate?: boolean;
  },
) => {
  const response = await api.post(`/pt/workspaces/${workspaceId}/templates/${templateId}/assign`, payload);
  return response.data.data as {
    templateId: number;
    assignments: Array<{ userId: number; status: string; mealPlanId?: number; assignmentId?: number; reason?: string }>;
  };
};

export const getProgressCheckins = async (workspaceId: number): Promise<PTProgressCheckin[]> => {
  const response = await api.get(`/pt/workspaces/${workspaceId}/checkins`);
  return response.data.data;
};

export const getMemberAssignedMealPlan = async (workspaceId: number, userId: number): Promise<PTAssignedMealPlanPreview> => {
  const response = await api.get(`/pt/workspaces/${workspaceId}/members/${userId}/meal-plan`);
  return response.data.data;
};

export const addAssignedMealPlanDetail = async (
  workspaceId: number,
  userId: number,
  payload: { foodId: number; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; dayOfWeek: number; quantity?: number }
) => {
  const response = await api.post(`/pt/workspaces/${workspaceId}/members/${userId}/meal-plan/details`, payload);
  return response.data.data as { id: number };
};

export const updateAssignedMealPlanDetail = async (
  workspaceId: number,
  userId: number,
  detailId: number,
  payload: Partial<{ foodId: number; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; dayOfWeek: number; quantity: number }>
) => {
  const response = await api.patch(`/pt/workspaces/${workspaceId}/members/${userId}/meal-plan/details/${detailId}`, payload);
  return response.data.data;
};

export const deleteAssignedMealPlanDetail = async (workspaceId: number, userId: number, detailId: number) => {
  await api.delete(`/pt/workspaces/${workspaceId}/members/${userId}/meal-plan/details/${detailId}`);
};

export const createProgressCheckin = async (
  workspaceId: number,
  payload: {
    userId: number;
    weight?: number;
    bodyFat?: number;
    waist?: number;
    note?: string;
    photoUrl?: string;
  }
) => {
  const response = await api.post(`/pt/workspaces/${workspaceId}/checkins`, payload);
  return response.data.data as PTProgressCheckin;
};

export const getWorkspaceChatMessages = async (workspaceId: number): Promise<PTWorkspaceChatMessage[]> => {
  const response = await api.get(`/pt/workspaces/${workspaceId}/chat/messages`);
  return response.data.data;
};

export const sendWorkspaceChatMessage = async (workspaceId: number, content: string): Promise<PTWorkspaceChatMessage> => {
  const response = await api.post(`/pt/workspaces/${workspaceId}/chat/messages`, { content });
  return response.data.data;
};
