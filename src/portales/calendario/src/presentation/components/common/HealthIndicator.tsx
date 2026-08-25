import React, { useState } from 'react';
import { HealthEvaluationResult, HealthStatus } from '../../../domain/orchestration/services/OperationalHealthService';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface HealthIndicatorProps {
  health: HealthEvaluationResult;
  showScore?: boolean;
  showReasons?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  health,
  showScore = true,
  showReasons = false,
  size = 'md',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const statusConfig: Record<
    HealthStatus,
    { label: string; bg: string; text: string; border: string; icon: typeof ShieldCheck }
  > = {
    HEALTHY: {
      label: 'Saludable',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: ShieldCheck,
    },
    ATTENTION: {
      label: 'Atención',
      bg: 'bg-yellow-500/10 dark:bg-yellow-950/40',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500/30',
      icon: Info,
    },
    AT_RISK: {
      label: 'En Riesgo',
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30',
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: 'Crítico',
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: ShieldAlert,
    },
  };

  const cfg = statusConfig[health.status] || statusConfig.HEALTHY;
  const IconComponent = cfg.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-1 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-mono',
    lg: 'text-sm px-3 py-1.5 gap-2 font-mono',
  };

  return (
    <div className={`relative inline-flex flex-col shrink-0 ${className}`}>
      <div
        className={`inline-flex items-center rounded-md border font-medium cursor-help transition-all duration-150 atomic-text badge-chip shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses[size]}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <IconComponent className="w-3.5 h-3.5 shrink-0" />
        {showScore && (
          <span className="font-bold atomic-text">
            {health.score}
            <span className="text-[10px] opacity-70">/100</span>
          </span>
        )}
        <span className="text-[11px] uppercase tracking-wider font-sans font-semibold border-l border-current/20 pl-1.5 atomic-text">
          {cfg.label}
        </span>
      </div>

      {(showReasons || showTooltip) && (
        <div
          className={`${
            showReasons
              ? 'mt-2'
              : 'absolute z-50 bottom-full mb-2 left-0 w-72 shadow-xl bg-zinc-900 border border-zinc-800 text-zinc-200'
          } rounded-lg p-3 text-xs`}
        >
          <div className="flex items-center justify-between font-semibold pb-1.5 border-b border-zinc-800 text-zinc-300">
            <span className="atomic-text">Diagnóstico de Salud Operativa</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] atomic-text ${cfg.bg} ${cfg.text}`}>
              {health.score}%
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-zinc-400">
            {health.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-content">
                <span className="text-zinc-600 shrink-0">•</span>
                <span className="leading-snug text-content">{reason}</span>
              </li>
            ))}
          </ul>
          {health.metrics && (
            <div className="mt-2.5 pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-1.5 text-[10px] text-zinc-500 font-mono">
              <div className="atomic-text">Completadas: {health.metrics.completedTasks}/{health.metrics.totalTasks}</div>
              <div className="atomic-text">Vencidas: {health.metrics.overdueTasks}</div>
              <div className="atomic-text">Bloqueadas: {health.metrics.blockedTasks}</div>
              <div className="atomic-text">Faltan: {health.metrics.daysRemaining}d</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
