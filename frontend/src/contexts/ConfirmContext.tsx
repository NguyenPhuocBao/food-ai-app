import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';

type ConfirmTone = 'danger' | 'warning' | 'info';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
};

type ConfirmRequest = ConfirmOptions & { id: number };

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const TONE_STYLES: Record<ConfirmTone, {
  icon: typeof AlertTriangle;
  iconWrap: string;
  iconClass: string;
  confirmClass: string;
}> = {
  danger: {
    icon: AlertTriangle,
    iconWrap: 'bg-rose-500/15',
    iconClass: 'text-rose-400',
    confirmClass: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25',
  },
  warning: {
    icon: ShieldAlert,
    iconWrap: 'bg-amber-500/15',
    iconClass: 'text-amber-300',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/25',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-cyan-500/15',
    iconClass: 'text-cyan-300',
    confirmClass: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-500/25',
  },
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const nextIdRef = useRef(1);

  const closeRequest = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setRequest({
        id: nextIdRef.current++,
        confirmText: 'Xác nhận',
        cancelText: 'Hủy',
        tone: 'danger',
        ...options,
      });
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);
  const tone = request?.tone || 'danger';
  const toneStyles = TONE_STYLES[tone];
  const Icon = toneStyles.icon;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {request && (
          <motion.div
            key={request.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={() => closeRequest(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneStyles.iconWrap}`}>
                    <Icon className={toneStyles.iconClass} size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{request.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{request.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => closeRequest(false)}
                  className="rounded-2xl bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => closeRequest(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/10"
                >
                  {request.cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => closeRequest(true)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${toneStyles.confirmClass}`}
                >
                  {request.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
};
