import React from 'react';
import { useToastStore } from '../../state/toastStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        let borderCls = 'border-emerald-500/40 bg-zinc-900/95 text-zinc-100 shadow-emerald-950/30';
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;

        if (t.type === 'warning') {
          borderCls = 'border-amber-500/40 bg-zinc-900/95 text-zinc-100 shadow-amber-950/30';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        } else if (t.type === 'error') {
          borderCls = 'border-rose-500/50 bg-zinc-900/95 text-zinc-100 shadow-rose-950/40';
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        } else if (t.type === 'info') {
          borderCls = 'border-indigo-500/40 bg-zinc-900/95 text-zinc-100 shadow-indigo-950/30';
          icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderCls} shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs font-mono">{t.title}</div>
              {t.description && (
                <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed break-words font-sans">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
