import React from 'react';
import { DepartmentCode, DEPARTMENTS } from '../../../domain/shared/types';

interface DepartmentBadgeProps {
  code: DepartmentCode;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  code,
  showName = false,
  size = 'md',
  className = '',
}) => {
  const meta = DEPARTMENTS[code] || {
    code,
    name: code,
    shortDescription: '',
    colorHex: '#71717a',
    bgHex: 'rgba(113, 113, 122, 0.1)',
    borderHex: 'rgba(113, 113, 122, 0.3)',
    badgeClass: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider font-semibold font-mono rounded',
    md: 'text-xs px-2 py-0.5 tracking-wide font-semibold font-mono rounded-md',
    lg: 'text-sm px-2.5 py-1 tracking-wide font-bold font-mono rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border atomic-text badge-chip dept-code shrink-0 ${meta.badgeClass} ${sizeClasses[size]} ${className}`}
      title={`${meta.code} — ${meta.name}: ${meta.shortDescription}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
        style={{ backgroundColor: meta.colorHex }}
      />
      <span className="atomic-text dept-code">{meta.code}</span>
      {showName && <span className="opacity-80 font-sans font-normal border-l border-current/20 pl-1.5 text-[11px] atomic-text">{meta.name}</span>}
    </span>
  );
};
