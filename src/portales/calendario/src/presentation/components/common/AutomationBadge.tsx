import React from 'react';
import { AutomationLevel } from '../../../domain/shared/types';
import { Bot, Sparkles, UserCheck } from 'lucide-react';

interface AutomationBadgeProps {
  level: AutomationLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export const AutomationBadge: React.FC<AutomationBadgeProps> = ({ level, size = 'md', className = '' }) => {
  const configs: Record<
    AutomationLevel,
    { label: string; cls: string; icon: typeof Bot; description: string }
  > = {
    AUTO: {
      label: 'Hermes Auto',
      cls: 'text-indigo-400 bg-indigo-950/40 border-indigo-700/40',
      icon: Bot,
      description: 'Hermes ejecuta cálculos y tareas derivadas de forma autónoma.',
    },
    PROPOSAL: {
      label: 'Propuesta Hermes',
      cls: 'text-amber-400 bg-amber-950/40 border-amber-700/40',
      icon: Sparkles,
      description: 'Hermes propone la acción y requiere aprobación humana para ejecutarse.',
    },
    HUMAN_REQUIRED: {
      label: 'Decisión Humana',
      cls: 'text-rose-400 bg-rose-950/40 border-rose-700/40 font-semibold',
      icon: UserCheck,
      description: 'Acción sensible de gobernanza/fondos: exclusivamente reservada a humanos.',
    },
  };

  const cfg = configs[level] || configs.PROPOSAL;
  const IconComp = cfg.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono atomic-text badge-chip shrink-0 ${cfg.cls} ${sizeClasses[size]} ${className}`}
      title={cfg.description}
    >
      <IconComp className="w-3 h-3 shrink-0 opacity-90" />
      <span className="atomic-text">{cfg.label}</span>
    </span>
  );
};
