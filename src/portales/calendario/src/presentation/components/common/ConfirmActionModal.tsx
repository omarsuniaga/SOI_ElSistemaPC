import React, { useState } from 'react';
import { useUIStore } from '../../state/uiStore';
import { AlertTriangle, X, Check, ShieldAlert } from 'lucide-react';

export const ConfirmActionModal: React.FC = () => {
  const { confirmModalOptions, closeConfirmModal } = useUIStore();
  const [loading, setLoading] = useState(false);

  if (!confirmModalOptions) return null;

  const {
    title,
    message,
    description,
    confirmLabel = 'Confirmar Acción',
    cancelLabel = 'Cancelar',
    isDanger = false,
    variant,
    onConfirm,
  } = confirmModalOptions;

  const danger = isDanger || variant === 'danger';
  const bodyText = message || description || '';

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      closeConfirmModal();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="confirm-action-modal-backdrop"
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={closeConfirmModal}
    >
      <div
        id="confirm-action-modal-container"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-xl border shrink-0 ${
              danger
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {danger ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold font-mono text-zinc-100 leading-snug">{title}</h3>
            {bodyText && (
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed font-sans">{bodyText}</p>
            )}
          </div>
          <button
            onClick={closeConfirmModal}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg shrink-0 transition-colors"
            aria-label="Cerrar confirmación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
          <button
            type="button"
            id="cancel-confirm-btn"
            onClick={closeConfirmModal}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            id="accept-confirm-btn"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-950/50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Procesando...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
