import { API_BASE_URL } from './api';
import { getAdminToken, getUserToken } from './authStorage';
import type { PTProgressCheckin, PTWorkspaceChatMessage } from './pt.service';

type WorkspaceEvent =
  | {
      type: 'chat_message_created';
      workspaceId: number;
      payload: PTWorkspaceChatMessage;
      timestamp: string;
    }
  | {
      type: 'progress_checkin_created';
      workspaceId: number;
      payload: PTProgressCheckin;
      timestamp: string;
    };

export const subscribeWorkspaceEvents = (
  workspaceId: number,
  handlers: {
    onChatMessage?: (message: PTWorkspaceChatMessage) => void;
    onCheckin?: (checkin: PTProgressCheckin) => void;
    onError?: () => void;
  },
) => {
  const token = getUserToken() || getAdminToken();
  if (!token || typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  const url = `${API_BASE_URL}/pt/workspaces/${workspaceId}/events?token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);

  source.addEventListener('chat_message_created', (event) => {
    const payload = JSON.parse((event as MessageEvent).data) as WorkspaceEvent;
    handlers.onChatMessage?.(payload.payload);
  });

  source.addEventListener('progress_checkin_created', (event) => {
    const payload = JSON.parse((event as MessageEvent).data) as WorkspaceEvent;
    handlers.onCheckin?.(payload.payload);
  });

  source.onerror = () => {
    handlers.onError?.();
  };

  return () => source.close();
};
