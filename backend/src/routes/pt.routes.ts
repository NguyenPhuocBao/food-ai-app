import { Router } from 'express';
import {
  assignMealPlanTemplate,
  createMealPlanTemplate,
  createProgressCheckin,
  createWorkspaceChatMessage,
  createWorkspace,
  deleteWorkspace,
  deleteMealPlanTemplate,
  deleteAssignedMealPlanDetail,
  getMyWorkspaces,
  getMemberAssignedMealPlan,
  getProgressCheckins,
  getWorkspaceChatMessages,
  getWorkspaceById,
  joinWorkspaceByCode,
  inviteWorkspaceMemberByEmail,
  leaveWorkspace,
  listMealPlanTemplates,
  listWorkspaceMembers,
  previewMealPlanTemplate,
  regenerateInviteCode,
  updateMealPlanTemplate,
  addAssignedMealPlanDetail,
  updateAssignedMealPlanDetail,
  updateWorkspace,
  streamWorkspaceEvents,
} from '../controllers/pt.controller';
import { authMiddleware, authMiddlewareAllowQueryToken, trainerOrAdminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/workspaces', authMiddleware, getMyWorkspaces);
router.post('/workspaces', authMiddleware, trainerOrAdminMiddleware, createWorkspace);
router.get('/workspaces/:id', authMiddleware, getWorkspaceById);
router.patch('/workspaces/:id', authMiddleware, trainerOrAdminMiddleware, updateWorkspace);
router.delete('/workspaces/:id', authMiddleware, trainerOrAdminMiddleware, deleteWorkspace);
router.post('/workspaces/:id/invite-code', authMiddleware, trainerOrAdminMiddleware, regenerateInviteCode);
router.post('/workspaces/:id/invite-email', authMiddleware, trainerOrAdminMiddleware, inviteWorkspaceMemberByEmail);
router.get('/workspaces/:id/members', authMiddleware, listWorkspaceMembers);
router.get('/workspaces/:id/members/:userId/meal-plan', authMiddleware, getMemberAssignedMealPlan);
router.post('/workspaces/:id/members/:userId/meal-plan/details', authMiddleware, addAssignedMealPlanDetail);
router.patch('/workspaces/:id/members/:userId/meal-plan/details/:detailId', authMiddleware, updateAssignedMealPlanDetail);
router.delete('/workspaces/:id/members/:userId/meal-plan/details/:detailId', authMiddleware, deleteAssignedMealPlanDetail);
router.post('/workspaces/join', authMiddleware, joinWorkspaceByCode);
router.post('/workspaces/:id/leave', authMiddleware, leaveWorkspace);

router.get('/workspaces/:id/templates', authMiddleware, listMealPlanTemplates);
router.post('/workspaces/:id/templates', authMiddleware, trainerOrAdminMiddleware, createMealPlanTemplate);
router.get('/workspaces/:id/templates/:templateId', authMiddleware, previewMealPlanTemplate);
router.patch('/workspaces/:id/templates/:templateId', authMiddleware, trainerOrAdminMiddleware, updateMealPlanTemplate);
router.delete('/workspaces/:id/templates/:templateId', authMiddleware, trainerOrAdminMiddleware, deleteMealPlanTemplate);
router.post('/workspaces/:id/templates/:templateId/assign', authMiddleware, trainerOrAdminMiddleware, assignMealPlanTemplate);

router.get('/workspaces/:id/checkins', authMiddleware, getProgressCheckins);
router.post('/workspaces/:id/checkins', authMiddleware, createProgressCheckin);
router.get('/workspaces/:id/events', authMiddlewareAllowQueryToken, streamWorkspaceEvents);
router.get('/workspaces/:id/chat/messages', authMiddleware, getWorkspaceChatMessages);
router.post('/workspaces/:id/chat/messages', authMiddleware, createWorkspaceChatMessage);

export default router;
