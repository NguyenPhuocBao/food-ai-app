import { GoalType, MealType, MealPlanAssignmentStatus, MealPlanTemplateStatus, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import {
  addWorkspaceEventClient,
  publishWorkspaceEvent,
  removeWorkspaceEventClient,
} from '../services/pt-workspace-events.service';

type PreviewDetail = {
  foodId: number;
  mealType: MealType;
  dayOfWeek: number;
  quantity?: number;
};

type TemplatePreview = {
  details?: PreviewDetail[];
  notes?: string;
};

const generateInviteCode = () => `PT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const isWorkspaceOwnerOrAdmin = async (workspaceId: number, userId: number, role: string) => {
  if (role === 'ADMIN') return true;
  const workspace = await prisma.trainerWorkspace.findFirst({ where: { id: workspaceId, ownerUserId: userId } });
  return Boolean(workspace);
};

const canViewWorkspace = async (workspaceId: number, userId: number, role: string) => {
  if (role === 'ADMIN') return true;
  const membership = await prisma.trainerWorkspaceMember.findFirst({
    where: { workspaceId, userId, status: 'ACTIVE' },
    select: { id: true },
  });
  return Boolean(membership);
};

const getWorkspaceDetails = async (workspaceId: number) =>
  prisma.trainerWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true, profile: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
      templates: {
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          targetUser: { select: { id: true, name: true, email: true } },
          assignments: { select: { id: true, userId: true, status: true, startDate: true, endDate: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

export const getMyWorkspaces = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const where = role === 'ADMIN'
      ? {}
      : {
          OR: [
            { ownerUserId: userId },
            {
              members: {
                some: {
                  userId,
                  status: 'ACTIVE' as const,
                },
              },
            },
          ],
        };
    const workspaces = await prisma.trainerWorkspace.findMany({
      where: {
        ...where,
        isActive: true,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, templates: true, assignments: true, checkins: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: workspaces });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkspace = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim() || null;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const inviteCode = await (async () => {
      for (let i = 0; i < 5; i += 1) {
        const code = generateInviteCode();
        const existing = await prisma.trainerWorkspace.findUnique({ where: { inviteCode: code } });
        if (!existing) return code;
      }
      return `${generateInviteCode()}-${Date.now().toString(36).toUpperCase()}`;
    })();

    const workspace = await prisma.trainerWorkspace.create({
      data: {
        ownerUserId: userId,
        name,
        description,
        inviteCode,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { members: true, templates: true, assignments: true, checkins: true } },
      },
    });

    if (role !== 'ADMIN') {
      await prisma.trainerWorkspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
        create: {
          workspaceId: workspace.id,
          userId,
          status: 'ACTIVE',
        },
        update: { status: 'ACTIVE' },
      });
    }

    res.status(201).json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWorkspace = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const data: any = {};
    if (typeof req.body?.name === 'string') data.name = req.body.name.trim();
    if (typeof req.body?.description === 'string') data.description = req.body.description.trim();
    if (typeof req.body?.isActive === 'boolean') data.isActive = req.body.isActive;

    const workspace = await prisma.trainerWorkspace.update({
      where: { id: workspaceId },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { members: true, templates: true, assignments: true, checkins: true } },
      },
    });

    res.json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteWorkspace = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const workspace = await prisma.trainerWorkspace.update({
      where: { id: workspaceId },
      data: { isActive: false },
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { members: true, templates: true, assignments: true, checkins: true } },
      },
    });

    res.json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const regenerateInviteCode = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const inviteCode = await (async () => {
      for (let i = 0; i < 5; i += 1) {
        const code = generateInviteCode();
        const existing = await prisma.trainerWorkspace.findUnique({ where: { inviteCode: code } });
        if (!existing) return code;
      }
      return `${generateInviteCode()}-${Date.now().toString(36).toUpperCase()}`;
    })();

    const workspace = await prisma.trainerWorkspace.update({
      where: { id: workspaceId },
      data: { inviteCode },
    });
    res.json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkspaceById = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const allowed = await canViewWorkspace(workspaceId, req.user.id, req.user.role) || req.user.role === 'ADMIN';
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    const workspace = await getWorkspaceDetails(workspaceId);
    if (!workspace || !workspace.isActive) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const joinWorkspaceByCode = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const code = String(req.body?.inviteCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'inviteCode is required' });

    const workspace = await prisma.trainerWorkspace.findUnique({ where: { inviteCode: code } });
    if (!workspace || !workspace.isActive) return res.status(404).json({ error: 'Workspace not found' });

    const member = await prisma.trainerWorkspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
      create: {
        workspaceId: workspace.id,
        userId,
        status: 'ACTIVE',
      },
      update: { status: 'ACTIVE', leftAt: null },
      include: {
        workspace: { select: { id: true, name: true, ownerUserId: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteWorkspaceMemberByEmail = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email is required' });

    const targetUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (!targetUser.isActive) return res.status(400).json({ error: 'User is inactive' });

    const member = await prisma.trainerWorkspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId: targetUser.id } },
      create: {
        workspaceId,
        userId: targetUser.id,
        status: 'ACTIVE',
      },
      update: {
        status: 'ACTIVE',
        leftAt: null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        workspace: { select: { id: true, name: true, inviteCode: true } },
      },
    });

    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveWorkspace = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    await prisma.trainerWorkspaceMember.updateMany({
      where: { workspaceId, userId },
      data: { status: 'LEFT', leftAt: new Date() },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listWorkspaceMembers = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role) || await canViewWorkspace(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const members = await prisma.trainerWorkspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMealPlanTemplate = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const name = String(req.body?.name || '').trim();
    const goalType = String(req.body?.goalType || 'MAINTENANCE').toUpperCase();
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!Object.values(GoalType).includes(goalType as GoalType)) {
      return res.status(400).json({ error: 'Invalid goalType' });
    }

    const previewData = (req.body?.previewData && typeof req.body.previewData === 'object') ? req.body.previewData : {};
    const template = await prisma.mealPlanTemplate.create({
      data: {
        workspaceId,
        createdByUserId: userId,
        targetUserId: req.body?.targetUserId ? Number(req.body.targetUserId) : null,
        name,
        goalType: goalType as GoalType,
        targetCalories: Number(req.body?.targetCalories || 2000),
        targetProtein: Number(req.body?.targetProtein || 150),
        targetFat: Number(req.body?.targetFat || 55),
        targetCarbs: Number(req.body?.targetCarbs || 250),
        macroStrategy: String(req.body?.macroStrategy || 'BALANCED'),
        previewData,
        status: String(req.body?.status || 'DRAFT').toUpperCase() as MealPlanTemplateStatus,
      },
    });

    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMealPlanTemplate = async (req: any, res: Response) => {
  try {
    const templateId = Number(req.params.templateId || req.params.id);
    const template = await prisma.mealPlanTemplate.findUnique({ where: { id: templateId } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const allowed = await isWorkspaceOwnerOrAdmin(template.workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const data: any = {};
    ['name', 'macroStrategy', 'previewData'].forEach((key) => {
      if (req.body?.[key] !== undefined) data[key] = req.body[key];
    });
    if (req.body?.goalType && Object.values(GoalType).includes(String(req.body.goalType).toUpperCase() as GoalType)) {
      data.goalType = String(req.body.goalType).toUpperCase() as GoalType;
    }
    if (req.body?.status && Object.values(MealPlanTemplateStatus).includes(String(req.body.status).toUpperCase() as MealPlanTemplateStatus)) {
      data.status = String(req.body.status).toUpperCase() as MealPlanTemplateStatus;
    }
    ['targetCalories', 'targetProtein', 'targetFat', 'targetCarbs', 'targetUserId'].forEach((key) => {
      if (req.body?.[key] !== undefined && req.body?.[key] !== null && req.body?.[key] !== '') {
        data[key] = Number(req.body[key]);
      }
    });

    const updated = await prisma.mealPlanTemplate.update({
      where: { id: templateId },
      data,
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMealPlanTemplate = async (req: any, res: Response) => {
  try {
    const templateId = Number(req.params.templateId || req.params.id);
    const template = await prisma.mealPlanTemplate.findUnique({ where: { id: templateId } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const allowed = await isWorkspaceOwnerOrAdmin(template.workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const assignmentCount = await prisma.mealPlanAssignment.count({ where: { templateId } });
    const deleted = await prisma.mealPlanTemplate.delete({ where: { id: templateId } });

    res.json({
      success: true,
      data: {
        deleted,
        assignmentCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listMealPlanTemplates = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role) || await canViewWorkspace(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const templates = await prisma.mealPlanTemplate.findMany({
      where: { workspaceId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } },
        assignments: { select: { id: true, userId: true, status: true, startDate: true, endDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const previewMealPlanTemplate = async (req: any, res: Response) => {
  try {
    const templateId = Number(req.params.templateId || req.params.id);
    const template = await prisma.mealPlanTemplate.findUnique({ where: { id: templateId } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const allowed = await isWorkspaceOwnerOrAdmin(template.workspaceId, req.user.id, req.user.role) || await canViewWorkspace(template.workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const previewData = (template.previewData && typeof template.previewData === 'object' ? template.previewData : {}) as TemplatePreview;
    const details = Array.isArray(previewData.details) ? previewData.details : [];
    const foodIds = Array.from(
      new Set(
        details
          .map((detail) => Number(detail.foodId))
          .filter((value) => Number.isFinite(value) && value > 0)
      )
    );
    const foods = foodIds.length
      ? await prisma.foodItem.findMany({
          where: { id: { in: foodIds } },
          select: {
            id: true,
            name: true,
            calories: true,
            protein: true,
            fat: true,
            carbs: true,
            imageUrl: true,
            category: true,
          },
        })
      : [];
    const foodMap = new Map(foods.map((food) => [food.id, food]));
    const hydratedDetails = details.map((detail) => {
      const quantity = Number(detail.quantity || 1);
      const food = foodMap.get(Number(detail.foodId)) || null;
      return {
        ...detail,
        quantity,
        food,
      };
    });
    const summary = hydratedDetails.reduce(
      (acc, detail) => {
        const quantity = Number(detail.quantity || 1);
        acc.totalMeals += 1;
        acc.totalQuantity += quantity;
        acc.totalCalories += Number(detail.food?.calories || 0) * quantity;
        acc.totalProtein += Number(detail.food?.protein || 0) * quantity;
        acc.totalFat += Number(detail.food?.fat || 0) * quantity;
        acc.totalCarbs += Number(detail.food?.carbs || 0) * quantity;
        return acc;
      },
      { totalMeals: 0, totalQuantity: 0, totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
    );

    res.json({
      success: true,
      data: {
        template,
        preview: {
          ...previewData,
          details: hydratedDetails,
        },
        summary,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignMealPlanTemplate = async (req: any, res: Response) => {
  try {
    const templateId = Number(req.params.templateId || req.params.id);
    const template = await prisma.mealPlanTemplate.findUnique({ where: { id: templateId } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const allowed = await isWorkspaceOwnerOrAdmin(template.workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const userIdsInput = Array.isArray(req.body?.userIds) ? req.body.userIds : (req.body?.userId ? [req.body.userId] : []);
    const userIds = Array.from(new Set(userIdsInput.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value)))) as number[];
    if (!userIds.length) return res.status(400).json({ error: 'userIds is required' });

    const startDate = req.body?.startDate ? new Date(req.body.startDate) : new Date();
    const endDate = req.body?.endDate ? new Date(req.body.endDate) : new Date(Date.now() + 6 * 86400000);
    const activate = req.body?.activate !== false;
    const previewData = (template.previewData && typeof template.previewData === 'object' ? template.previewData : {}) as TemplatePreview;
    const details = Array.isArray(previewData.details) ? previewData.details : [];

    const assignments = await prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const userId of userIds) {
        const member = await tx.trainerWorkspaceMember.findFirst({
          where: { workspaceId: template.workspaceId, userId, status: 'ACTIVE' },
        });
        if (!member) {
          results.push({ userId, status: 'SKIPPED', reason: 'User is not an active workspace member' });
          continue;
        }

        if (activate) {
          await tx.mealPlan.updateMany({ where: { userId }, data: { isActive: false } });
        }

        const mealPlan = await tx.mealPlan.create({
          data: {
            userId,
            name: template.name,
            startDate,
            endDate,
            isActive: activate,
          },
        });

        if (details.length) {
          await tx.mealPlanDetail.createMany({
            data: details.map((detail) => ({
              mealPlanId: mealPlan.id,
              foodId: Number(detail.foodId),
              mealType: detail.mealType,
              dayOfWeek: Number(detail.dayOfWeek),
              quantity: Number(detail.quantity || 1),
            })),
          });
        }

        const assignment = await tx.mealPlanAssignment.create({
          data: {
            workspaceId: template.workspaceId,
            templateId,
            userId,
            assignedByUserId: req.user.id,
            assignedMealPlanId: mealPlan.id,
            startDate,
            endDate,
            status: activate ? MealPlanAssignmentStatus.ACTIVE : MealPlanAssignmentStatus.PAUSED,
          },
        });

        results.push({
          userId,
          status: 'ASSIGNED',
          mealPlanId: mealPlan.id,
          assignmentId: assignment.id,
        });
      }
      return results;
    });

    await prisma.mealPlanTemplate.update({
      where: { id: templateId },
      data: { status: MealPlanTemplateStatus.ASSIGNED },
    });

    res.json({ success: true, data: { templateId, assignments } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressCheckins = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role) || await canViewWorkspace(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const checkins = await prisma.progressCheckin.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, profile: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { recordedAt: 'desc' },
    });
    res.json({ success: true, data: checkins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkspaceChatMessages = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role) || await canViewWorkspace(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const messages = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        m.id,
        m."workspaceId",
        m."userId",
        m.content,
        m."createdAt",
        m."updatedAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'role', u.role,
          'profile', json_build_object(
            'fullName', p."fullName",
            'avatar', p.avatar
          )
        ) AS "user"
      FROM workspace_chat_messages m
      JOIN users u ON u.id = m."userId"
      LEFT JOIN user_profiles p ON p."userId" = u.id
      WHERE m."workspaceId" = ${workspaceId}
      ORDER BY m."createdAt" ASC
      LIMIT 200
    `);

    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const streamWorkspaceEvents = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role) || await canViewWorkspace(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    addWorkspaceEventClient(workspaceId, res);
    res.write(`event: connected\ndata: ${JSON.stringify({ workspaceId, timestamp: new Date().toISOString() })}\n\n`);

    const heartbeat = setInterval(() => {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      removeWorkspaceEventClient(workspaceId, res);
      res.end();
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkspaceChatMessage = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, userId, role) || await canViewWorkspace(workspaceId, userId, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ error: 'content is required' });

    const [message] = await prisma.$queryRaw<any[]>(Prisma.sql`
      WITH inserted AS (
        INSERT INTO workspace_chat_messages ("workspaceId", "userId", content, "createdAt", "updatedAt")
        VALUES (${workspaceId}, ${userId}, ${content}, NOW(), NOW())
        RETURNING id, "workspaceId", "userId", content, "createdAt", "updatedAt"
      )
      SELECT
        i.id,
        i."workspaceId",
        i."userId",
        i.content,
        i."createdAt",
        i."updatedAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'role', u.role,
          'profile', json_build_object(
            'fullName', p."fullName",
            'avatar', p.avatar
          )
        ) AS "user"
      FROM inserted i
      JOIN users u ON u.id = i."userId"
      LEFT JOIN user_profiles p ON p."userId" = u.id
    `);

    publishWorkspaceEvent({
      type: 'chat_message_created',
      workspaceId,
      payload: message,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberAssignedMealPlan = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const role = req.user.role;
    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, req.user.id, role) || await canViewWorkspace(workspaceId, req.user.id, role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    if (!Number.isFinite(memberUserId)) return res.status(400).json({ error: 'Invalid user id' });

    const assignment = await prisma.mealPlanAssignment.findFirst({
      where: {
        workspaceId,
        userId: memberUserId,
        assignedMealPlanId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            goalType: true,
            targetCalories: true,
            targetProtein: true,
            targetFat: true,
            targetCarbs: true,
            macroStrategy: true,
          },
        },
        assignedMealPlan: {
          include: {
            details: {
              include: { food: true },
              orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (assignment?.assignedMealPlan) {
      return res.json({
        success: true,
        data: {
          assignment,
          mealPlan: assignment.assignedMealPlan,
        },
      });
    }
    return res.status(404).json({ error: 'Học viên chưa được PT gán meal plan' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberOwnedMealPlans = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    if (!Number.isFinite(workspaceId) || !Number.isFinite(memberUserId)) {
      return res.status(400).json({ error: 'Invalid workspace or user id' });
    }

    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const membership = await prisma.trainerWorkspaceMember.findFirst({
      where: {
        workspaceId,
        userId: memberUserId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Workspace member not found' });
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        userId: memberUserId,
        trainerAssignments: {
          none: {},
        },
      },
      include: {
        details: {
          include: { food: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: mealPlans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const resolveAssignedMealPlanForMember = async (workspaceId: number, memberUserId: number) => {
  return prisma.mealPlanAssignment.findFirst({
    where: {
      workspaceId,
      userId: memberUserId,
      assignedMealPlanId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedMealPlan: {
        include: {
          details: {
            include: { food: true },
            orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
          },
        },
      },
    },
  });
};

export const addAssignedMealPlanDetail = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const mealPlan = await resolveAssignedMealPlanForMember(workspaceId, memberUserId);
    if (!mealPlan?.assignedMealPlanId) return res.status(404).json({ error: 'Assigned meal plan not found' });

    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const foodId = Number(req.body?.foodId);
    const mealType = String(req.body?.mealType || '').toUpperCase();
    const dayOfWeek = Number(req.body?.dayOfWeek);
    const quantity = Number(req.body?.quantity || 1);
    if (!Number.isFinite(foodId) || !Object.values(MealType).includes(mealType as MealType) || !Number.isInteger(dayOfWeek)) {
      return res.status(400).json({ error: 'Invalid detail payload' });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const detail = await prisma.mealPlanDetail.create({
      data: {
        mealPlanId: mealPlan.assignedMealPlanId,
        foodId,
        mealType: mealType as MealType,
        dayOfWeek,
        quantity,
      },
      include: { food: true },
    });

    res.status(201).json({ success: true, data: detail });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAssignedMealPlanDetail = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const detailId = Number(req.params.detailId);
    const mealPlan = await resolveAssignedMealPlanForMember(workspaceId, memberUserId);
    if (!mealPlan?.assignedMealPlanId) return res.status(404).json({ error: 'Assigned meal plan not found' });

    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const detail = await prisma.mealPlanDetail.findFirst({
      where: { id: detailId, mealPlanId: mealPlan.assignedMealPlanId },
    });
    if (!detail) return res.status(404).json({ error: 'Meal plan detail not found' });

    const data: any = {};
    if (req.body?.foodId !== undefined) {
      const foodId = Number(req.body.foodId);
      const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
      if (!food) return res.status(404).json({ error: 'Food not found' });
      data.foodId = foodId;
    }
    if (req.body?.mealType !== undefined) {
      const mealType = String(req.body.mealType).toUpperCase();
      if (!Object.values(MealType).includes(mealType as MealType)) {
        return res.status(400).json({ error: 'Invalid mealType' });
      }
      data.mealType = mealType as MealType;
    }
    if (req.body?.dayOfWeek !== undefined) {
      data.dayOfWeek = Number(req.body.dayOfWeek);
    }
    if (req.body?.quantity !== undefined) {
      data.quantity = Number(req.body.quantity);
    }

    const updated = await prisma.mealPlanDetail.update({
      where: { id: detailId },
      data,
      include: { food: true },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAssignedMealPlanDetail = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const detailId = Number(req.params.detailId);
    const mealPlan = await resolveAssignedMealPlanForMember(workspaceId, memberUserId);
    if (!mealPlan?.assignedMealPlanId) return res.status(404).json({ error: 'Assigned meal plan not found' });

    const allowed = await isWorkspaceOwnerOrAdmin(workspaceId, req.user.id, req.user.role);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const detail = await prisma.mealPlanDetail.findFirst({
      where: { id: detailId, mealPlanId: mealPlan.assignedMealPlanId },
      select: { id: true },
    });
    if (!detail) return res.status(404).json({ error: 'Meal plan detail not found' });

    await prisma.mealPlanDetail.delete({ where: { id: detailId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProgressCheckin = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.body?.workspaceId || req.params.id);
    const userId = Number(req.body?.userId || req.user.id);
    const recordedByUserId = req.user.id;
    const role = req.user.role;
    const workspace = await prisma.trainerWorkspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, ownerUserId: true, isActive: true },
    });
    if (!workspace || !workspace.isActive) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const targetMember = await prisma.trainerWorkspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
      select: { id: true },
    });
    const actorIsOwner = workspace.ownerUserId === recordedByUserId;
    const actorIsAdmin = role === 'ADMIN';
    const actorIsSelf = recordedByUserId === userId && Boolean(targetMember);
    const allowed = actorIsAdmin || actorIsOwner || actorIsSelf;
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const createdCheckin = await prisma.progressCheckin.create({
      data: {
        workspaceId,
        userId,
        recordedByUserId,
        weight: req.body?.weight !== undefined ? Number(req.body.weight) : null,
        bodyFat: req.body?.bodyFat !== undefined ? Number(req.body.bodyFat) : null,
        waist: req.body?.waist !== undefined ? Number(req.body.waist) : null,
        photoUrl: req.body?.photoUrl || null,
        note: req.body?.note || null,
      },
    });

    const checkin = await prisma.progressCheckin.findUnique({
      where: { id: createdCheckin.id },
      include: {
        user: { select: { id: true, name: true, email: true, profile: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
    });

    publishWorkspaceEvent({
      type: 'progress_checkin_created',
      workspaceId,
      payload: checkin,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: checkin });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
