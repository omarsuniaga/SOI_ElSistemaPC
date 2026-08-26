export type CalendarItemKind =
  | 'EVENT'
  | 'SEASON'
  | 'WINDOW'
  | 'DEADLINE'
  | 'MILESTONE'
  | 'RECURRENCE'
  | 'BLOCKOUT';

export interface CalendarItemKindMeta {
  kind: CalendarItemKind;
  label: string;
  description: string;
  iconName: string;
  badgeClass: string;
}

export const CALENDAR_ITEM_KINDS: Record<CalendarItemKind, CalendarItemKindMeta> = {
  EVENT: {
    kind: 'EVENT',
    label: 'Evento',
    description: 'Hito puntual o concierto con horario y sala definida',
    iconName: 'Music',
    badgeClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  },
  SEASON: {
    kind: 'SEASON',
    label: 'Temporada',
    description: 'Ciclo institucional extendido (ej. Reinscripciones, Temporada de Conciertos)',
    iconName: 'CalendarRange',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  WINDOW: {
    kind: 'WINDOW',
    label: 'Ventana',
    description: 'Periodo de apertura operativo (ej. Audiciones semestrales, Entregas)',
    iconName: 'Clock',
    badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  DEADLINE: {
    kind: 'DEADLINE',
    label: 'Fecha Límite',
    description: 'Vencimiento crítico e ineludible (Fiscal, Pago de Servicios, Reportes)',
    iconName: 'AlertTriangle',
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  MILESTONE: {
    kind: 'MILESTONE',
    label: 'Hito',
    description: 'Punto de control institucional o entrega de cuentas (Cierre de Actas, Reunión de Junta)',
    iconName: 'Flag',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  RECURRENCE: {
    kind: 'RECURRENCE',
    label: 'Recurrencia',
    description: 'Ciclo operativo repetitivo (Cierre de Caja diario, Ensayos generales)',
    iconName: 'Repeat',
    badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  BLOCKOUT: {
    kind: 'BLOCKOUT',
    label: 'Bloqueo Institucional',
    description: 'Periodo inhábil o receso institucional sin actividades públicas',
    iconName: 'Ban',
    badgeClass: 'text-zinc-400 bg-zinc-700/30 border-zinc-600/40',
  },
};
