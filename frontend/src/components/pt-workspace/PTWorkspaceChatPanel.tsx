import { Loader2, MessageSquare, Send } from 'lucide-react';
import type { PTWorkspaceChatMessage } from '../../services/pt.service';

type PTWorkspaceChatPanelProps = {
  draft: string;
  loading: boolean;
  messages: PTWorkspaceChatMessage[];
  sending: boolean;
  currentUserId?: number;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  variant?: 'user' | 'trainer';
};

const headerAccent = {
  trainer: {
    icon: 'text-cyan-300',
    label: 'text-cyan-200',
  },
  user: {
    icon: 'text-indigo-600',
    label: 'text-indigo-700',
  },
} as const;

const variantStyles = {
  trainer: {
    wrapper:
      'rounded-[30px] border border-cyan-400/30 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,47,73,0.96))] p-6 shadow-[0_20px_45px_rgba(8,145,178,0.18)]',
    list:
      'mt-4 max-h-[360px] space-y-3 overflow-y-auto rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-slate-900/70 via-slate-950/70 to-cyan-950/40 p-4',
    bubbleMine: 'bg-cyan-500 text-white',
    bubbleMineLabel: 'text-cyan-50',
    bubbleMineMeta: 'text-cyan-100',
    bubbleOther: 'bg-slate-800/95 text-slate-100 ring-1 ring-cyan-400/15',
    bubbleOtherLabel: 'text-cyan-300',
    textarea:
      'w-full rounded-2xl border border-cyan-400/25 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10',
    button:
      'inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60',
    dashed: 'border-cyan-400/25 text-cyan-200',
    messageWidth: 'max-w-[88%]',
  },
  user: {
    wrapper:
      'mt-10 rounded-[30px] border border-indigo-200 bg-[linear-gradient(180deg,rgba(238,242,255,0.98),rgba(255,255,255,1))] p-6 shadow-lg shadow-indigo-500/10 dark:border-indigo-900/40 dark:bg-[linear-gradient(180deg,rgba(28,18,48,0.96),rgba(15,23,42,0.92))]',
    list:
      'mt-5 max-h-[260px] space-y-3 overflow-y-auto rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white p-4 dark:border-indigo-900/40 dark:from-slate-950/40 dark:to-slate-950/70',
    bubbleMine: 'bg-indigo-500 text-white',
    bubbleMineLabel: 'text-indigo-50',
    bubbleMineMeta: 'text-indigo-100',
    bubbleOther: 'bg-white/95 text-gray-900 dark:bg-slate-900 dark:text-slate-100',
    bubbleOtherLabel: 'text-indigo-700',
    textarea:
      'w-full rounded-2xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100',
    button:
      'inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60',
    dashed: 'border-indigo-200 text-indigo-700 dark:border-slate-700 dark:text-slate-300',
    messageWidth: 'max-w-[92%]',
  },
} as const;

const participantColorPresets = [
  {
    trainer: 'text-rose-300',
    user: 'text-rose-700 dark:text-rose-300',
    meta: 'text-rose-200/80',
  },
  {
    trainer: 'text-amber-300',
    user: 'text-amber-700 dark:text-amber-300',
    meta: 'text-amber-200/80',
  },
  {
    trainer: 'text-emerald-300',
    user: 'text-emerald-700 dark:text-emerald-300',
    meta: 'text-emerald-200/80',
  },
  {
    trainer: 'text-sky-300',
    user: 'text-sky-700 dark:text-sky-300',
    meta: 'text-sky-200/80',
  },
  {
    trainer: 'text-fuchsia-300',
    user: 'text-fuchsia-700 dark:text-fuchsia-300',
    meta: 'text-fuchsia-200/80',
  },
  {
    trainer: 'text-orange-300',
    user: 'text-orange-700 dark:text-orange-300',
    meta: 'text-orange-200/80',
  },
];

const getParticipantColor = (userId: number | undefined, variant: 'user' | 'trainer') => {
  const preset = participantColorPresets[Math.abs(userId || 0) % participantColorPresets.length];
  return {
    label: variant === 'trainer' ? preset.trainer : preset.user,
    meta: preset.meta,
  };
};

const PTWorkspaceChatPanel = ({
  draft,
  loading,
  messages,
  sending,
  currentUserId,
  onDraftChange,
  onSubmit,
  variant = 'trainer',
}: PTWorkspaceChatPanelProps) => {
  const styles = variantStyles[variant];
  const accent = headerAccent[variant];

  return (
    <div className={styles.wrapper}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className={accent.icon} />
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${accent.label}`}>Group chat</p>
            <h3 className="mt-1 text-xl font-black text-white">Trao đổi trong workspace</h3>
          </div>
        </div>
        <span className="text-xs font-bold text-cyan-100/70">{messages.length} tin nhắn</span>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={`rounded-2xl border border-dashed p-4 text-sm ${styles.dashed}`}>
            Đang tải group chat...
          </div>
        ) : messages.length ? (
          messages.map((item) => {
            const isMine = item.userId === currentUserId;
            const participantColor = getParticipantColor(item.userId, variant);
            return (
              <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`${styles.messageWidth} rounded-3xl px-4 py-3 shadow-sm ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-black uppercase tracking-[0.16em] ${
                        isMine ? styles.bubbleMineLabel : `${styles.bubbleOtherLabel} ${participantColor.label}`
                      }`}
                    >
                      {isMine ? 'Bạn' : item.user.name}
                    </p>
                    <span
                      className={`text-[10px] font-semibold ${
                        isMine ? styles.bubbleMineMeta : `text-gray-400 dark:text-slate-500 ${variant === 'trainer' ? participantColor.meta : ''}`
                      }`}
                    >
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`rounded-2xl border border-dashed p-4 text-sm ${styles.dashed}`}>
            Chưa có tin nhắn nào trong workspace này.
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Nhắn vào group chat..."
          rows={3}
          className={styles.textarea}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className={styles.button}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Gửi tin nhắn
          </button>
        </div>
      </form>
    </div>
  );
};

export default PTWorkspaceChatPanel;
