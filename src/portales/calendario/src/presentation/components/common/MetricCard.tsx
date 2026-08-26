import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'success' | 'indigo';
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  badge,
  badgeVariant = 'default',
  onClick,
  className = '',
}) => {
  const badgeColors = {
    default: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    danger: 'text-rose-400 bg-rose-950/50 border-rose-700/50',
    warning: 'text-amber-400 bg-amber-950/50 border-amber-700/50',
    success: 'text-emerald-400 bg-emerald-950/50 border-emerald-700/50',
    indigo: 'text-indigo-400 bg-indigo-950/50 border-indigo-700/50',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-1.5 sm:p-2 transition-all duration-200 min-w-0 ${
        onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-lg' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-1 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[8px] sm:text-[9px] font-medium uppercase tracking-wide text-zinc-400 font-mono atomic-text">{label}</p>
          <p className="text-sm sm:text-lg font-extrabold tracking-tight text-zinc-100 font-mono atomic-text tabular-nums">{value}</p>
        </div>
        <Icon className="hidden md:block w-3.5 h-3.5 text-zinc-500 shrink-0" />
      </div>

      {badge && (
        <div className="mt-1 pt-1 border-t border-zinc-800/50 min-w-0">
          <span
            className={`block truncate font-mono text-[7px] sm:text-[8px] px-1 py-0.5 rounded border uppercase font-medium atomic-text badge-chip text-center ${badgeColors[badgeVariant]}`}
          >
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
