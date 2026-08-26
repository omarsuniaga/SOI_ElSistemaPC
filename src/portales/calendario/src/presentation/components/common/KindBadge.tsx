import React from 'react';
import { CalendarItemKind, CALENDAR_ITEM_KINDS } from '../../../domain/calendar/valueObjects/CalendarItemKind';
import { Music, CalendarRange, Clock, AlertTriangle, Flag, Repeat, Ban } from 'lucide-react';

const ICONS: Record<string, typeof Music> = {
  Music,
  CalendarRange,
  Clock,
  AlertTriangle,
  Flag,
  Repeat,
  Ban,
};

interface KindBadgeProps {
  kind: CalendarItemKind;
  size?: 'sm' | 'md';
  className?: string;
}

export const KindBadge: React.FC<KindBadgeProps> = ({ kind, size = 'md', className = '' }) => {
  const meta = CALENDAR_ITEM_KINDS[kind] || {
    kind,
    label: kind,
    description: '',
    iconName: 'Flag',
    badgeClass: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  };

  const IconComp = ICONS[meta.iconName] || Flag;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium atomic-text badge-chip shrink-0 ${meta.badgeClass} ${sizeClasses[size]} ${className}`}
      title={`${meta.label}: ${meta.description}`}
    >
      <IconComp className="w-3 h-3 shrink-0 opacity-80" />
      <span className="atomic-text">{meta.label}</span>
    </span>
  );
};
