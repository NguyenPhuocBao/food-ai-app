import type { Response } from 'express';

type WorkspaceEvent =
  | {
      type: 'chat_message_created';
      workspaceId: number;
      payload: unknown;
      timestamp: string;
    }
  | {
      type: 'progress_checkin_created';
      workspaceId: number;
      payload: unknown;
      timestamp: string;
    };

const workspaceClients = new Map<number, Set<Response>>();

export const addWorkspaceEventClient = (workspaceId: number, res: Response) => {
  const clients = workspaceClients.get(workspaceId) || new Set<Response>();
  clients.add(res);
  workspaceClients.set(workspaceId, clients);
};

export const removeWorkspaceEventClient = (workspaceId: number, res: Response) => {
  const clients = workspaceClients.get(workspaceId);
  if (!clients) return;
  clients.delete(res);
  if (!clients.size) {
    workspaceClients.delete(workspaceId);
  }
};

export const publishWorkspaceEvent = (event: WorkspaceEvent) => {
  const clients = workspaceClients.get(event.workspaceId);
  if (!clients?.size) return;

  const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  clients.forEach((client) => {
    client.write(data);
  });
};

