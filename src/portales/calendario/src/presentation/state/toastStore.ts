import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  durationMs?: number;
}

let toasts: ToastMessage[] = [];
const listeners = new Set<(toasts: ToastMessage[]) => void>();

export const toast = {
  show: (msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...msg, id };
    toasts = [...toasts, newToast];
    listeners.forEach(l => l(toasts));

    setTimeout(() => {
      toast.dismiss(id);
    }, msg.durationMs || 4000);
  },
  success: (title: string, description?: string) => {
    toast.show({ title, description, type: 'success' });
  },
  info: (title: string, description?: string) => {
    toast.show({ title, description, type: 'info' });
  },
  warning: (title: string, description?: string) => {
    toast.show({ title, description, type: 'warning' });
  },
  error: (title: string, description?: string) => {
    toast.show({ title, description, type: 'error', durationMs: 6000 });
  },
  dismiss: (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(l => l(toasts));
  },
};

export function useToastStore() {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setCurrentToasts(newToasts);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts: currentToasts,
    dismiss: toast.dismiss,
  };
}
