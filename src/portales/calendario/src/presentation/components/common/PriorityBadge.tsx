import React from 'react';
import { PriorityLevel } from '../../../domain/shared/types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md', className = '' }) => {
  const configs: Record<PriorityLevel, { label: string; cls: string }> = {
    LOW: { label: 'Baja', cls: 'text-zinc-400 bg-zinc-800/60 border-zinc-700/60' },
    NORMAL: { label: 'Normal', cls: 'text-sky-400 bg-sky-950/40 border-sky-700/40' },
    HIGH: { label: 'Alta', cls: 'text-amber-400 bg-amber-950/40 border-amber-700/40' },
    CRITICAL: { label: 'Crítica', cls: 'text-rose-400 bg-rose-950/40 border-rose-700/40 font-bold' },
  };

  const cfg = configs[priority] || configs.NORMAL;
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono uppercase tracking-wider atomic-text badge-chip shrink-0 ${cfg.cls} ${sizeClasses[size]} ${className}`}
    >
      {cfg.label}
    </span>
  );
};
