export type CalendarItemStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'CLOSING'
  | 'CLOSED'
  | 'CANCELLED';

export interface CalendarItemStatusMeta {
  status: CalendarItemStatus;
  label: string;
  badgeClass: string;
  allowsTriggers: boolean;
}

export const CALENDAR_ITEM_STATUSES: Record<CalendarItemStatus, CalendarItemStatusMeta> = {
  DRAFT: {
    status: 'DRAFT',
    label: 'Borrador',
    badgeClass: 'text-zinc-400 bg-zinc-800/60 border-zinc-700/60',
    allowsTriggers: false,
  },
  PLANNED: {
    status: 'PLANNED',
    label: 'Planificado',
    badgeClass: 'text-sky-400 bg-sky-900/30 border-sky-600/40',
    allowsTriggers: false,
  },
  CONFIRMED: {
    status: 'CONFIRMED',
    label: 'Confirmado',
    badgeClass: 'text-emerald-400 bg-emerald-900/30 border-emerald-600/40',
    allowsTriggers: true,
  },
  ACTIVE: {
    status: 'ACTIVE',
    label: 'En Curso',
    badgeClass: 'text-amber-400 bg-amber-900/30 border-amber-600/40',
    allowsTriggers: true,
  },
  CLOSING: {
    status: 'CLOSING',
    label: 'Cierre Operativo',
    badgeClass: 'text-indigo-400 bg-indigo-900/30 border-indigo-600/40',
    allowsTriggers: true,
  },
  CLOSED: {
    status: 'CLOSED',
    label: 'Cerrado / Concluido',
    badgeClass: 'text-zinc-500 bg-zinc-800/40 border-zinc-700/30',
    allowsTriggers: false,
  },
  CANCELLED: {
    status: 'CANCELLED',
    label: 'Cancelado',
    badgeClass: 'text-rose-400 bg-rose-900/30 border-rose-600/40',
    allowsTriggers: false,
  },
};
