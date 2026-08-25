import React from 'react';
import { CalendarItemStatus, CALENDAR_ITEM_STATUSES } from '../../../domain/calendar/valueObjects/CalendarItemStatus';

interface StatusBadgeProps {
  status: CalendarItemStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const meta = CALENDAR_ITEM_STATUSES[status] || {
    status,
    label: status,
    badgeClass: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    allowsTriggers: false,
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider font-mono atomic-text badge-chip shrink-0 ${meta.badgeClass} ${sizeClasses[size]} ${className}`}
    >
      {meta.label}
    </span>
  );
};
