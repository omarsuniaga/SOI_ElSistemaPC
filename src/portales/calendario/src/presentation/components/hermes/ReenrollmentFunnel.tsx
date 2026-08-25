import React from 'react';
import { Users, CheckCircle2, AlertCircle, PhoneCall, Sparkles } from 'lucide-react';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { AutomationBadge } from '../common/AutomationBadge';

interface ReenrollmentFunnelProps {
  onTriggerAssistedCalls?: () => void;
}

export const ReenrollmentFunnel: React.FC<ReenrollmentFunnelProps> = ({
  onTriggerAssistedCalls,
}) => {
  return (
    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-zinc-900/60 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              Funnel Inteligente de Reinscripción (2026-S2)
            </h4>
            <p className="text-xs text-zinc-400">
              Escenario Demostrativo: Auditoría de 137 estudiantes regulares y seguimiento escalonado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DepartmentBadge code="ADM" size="sm" />
          <AutomationBadge level="PROPOSAL" size="sm" />
        </div>
      </div>

      {/* Funnel Progress Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 my-4">
        {/* Step 1: Base */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
            <span className="atomic-text truncate min-w-0">T-14: Auditoría Base</span>
            <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-zinc-100 atomic-text tabular-nums">137</div>
          <p className="text-[11px] text-zinc-500 mt-1 text-content">Estudiantes activos analizados por Hermes</p>
          <div className="mt-2 space-y-0.5 text-[10px] font-mono text-zinc-400">
            <div className="text-emerald-400 atomic-text">✓ 119 Elegibles directos</div>
            <div className="text-amber-400 atomic-text">○ 11 Revisión financiera (resuelta)</div>
            <div className="text-zinc-500 atomic-text">○ 5 Incompletos | 2 Adm.</div>
          </div>
        </div>

        {/* Step 2: T0 & T+2 */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
            <span className="atomic-text truncate min-w-0">T+2: Avance Inicial</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-cyan-400 atomic-text tabular-nums">
            73 <span className="text-xs text-zinc-500 font-normal atomic-text">/ 119</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 text-content">61% completado en primeras 48h</p>
          <div className="mt-2 text-[10px] font-mono text-zinc-400 text-content">
            <div>46 pendientes tras recordatorio omnicanal</div>
          </div>
        </div>

        {/* Step 3: T+4 */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
            <span className="atomic-text truncate min-w-0">T+4: Segundo Corte</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-indigo-400 atomic-text tabular-nums">
            88 <span className="text-xs text-zinc-500 font-normal atomic-text">/ 119</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 text-content">74% formalizados</p>
          <div className="mt-2 text-[10px] font-mono text-zinc-400 text-content">
            <div className="text-amber-400">31 familias pendientes tras alerta de urgencia</div>
          </div>
        </div>

        {/* Step 4: T+6 Final Horizon */}
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 relative overflow-hidden min-w-0">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-amber-500/10 pointer-events-none" />
          <div className="flex items-center justify-between gap-2 text-xs text-amber-400 font-mono font-bold">
            <span className="atomic-text truncate min-w-0">T+6: Corte Actual</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-amber-300 atomic-text tabular-nums">
            14 <span className="text-xs text-zinc-400 font-normal atomic-text">familias</span>
          </div>
          <p className="text-[11px] text-zinc-300 mt-1 text-content">Requieren gestión telefónica asistida</p>
          <div className="mt-2 text-[10px] font-mono text-amber-300/80 atomic-text">
            <span>88% tasa de conversión global</span>
          </div>
        </div>
      </div>

      {/* Hermes Recommendation Callout */}
      <div className="mt-3 p-3 rounded-lg border border-indigo-500/20 bg-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <PhoneCall className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-content">
            <span className="font-semibold text-zinc-200">Recomendación Hermes: </span>
            <span className="text-zinc-400">
              No emitir más recordatorios automáticos masivos. Asignar las 14 familias restantes a Trabajo Social para acompañamiento humanizado individual.
            </span>
          </div>
        </div>
        <button
          onClick={onTriggerAssistedCalls}
          className="shrink-0 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono transition-colors shadow-sm shadow-indigo-600/30 atomic-text"
        >
          Ejecutar Asignación a Trabajo Social
        </button>
      </div>
    </div>
  );
};
