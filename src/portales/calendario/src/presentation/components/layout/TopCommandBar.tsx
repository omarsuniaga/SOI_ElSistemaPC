import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { useUIStore } from '../../state/uiStore';
import {
  CalendarDays,
  Zap,
  Workflow,
  AlertTriangle,
  Flame,
  Radio,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

interface TopCommandBarProps {
  upcomingCount: number;
  activeTriggersCount: number;
  protocolRunsCount: number;
  riskCount: number;
  criticalCount: number;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  upcomingCount,
  activeTriggersCount,
  protocolRunsCount,
  riskCount,
  criticalCount,
}) => {
  const { setActiveScreen, activeScreen, openExportModal } = useUIStore();

  return (
    <div className="border-b border-zinc-800/80 bg-zinc-950/40 p-3 sm:p-4">
      {/* Top Bar Header with Export Data Action */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/50">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-300">PULSO OPERATIVO INSTITUCIONAL</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-500">Evaluación de Horizontes T-0 a T-90</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-topbar-export-data"
            onClick={openExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-medium transition-all shadow-sm shadow-amber-950/20 group cursor-pointer"
            title="Exportar datos del Radar Temporal en formatos CSV o PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Exportar Datos</span>
            <span className="hidden sm:inline text-[10px] text-amber-400/80 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              CSV / PDF
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 sm:gap-2 lg:gap-3">
        <MetricCard
          label="Próximos Hitos"
          value={upcomingCount}
          subValue="En horizonte anual"
          icon={CalendarDays}
          badge="TEMPORAL"
          onClick={() => setActiveScreen('calendar')}
        />
        <MetricCard
          label="Triggers Activos"
          value={activeTriggersCount}
          subValue="Evaluación T-X"
          icon={Zap}
          badge="HORIZONTE"
          badgeVariant="indigo"
          onClick={() => setActiveScreen('radar')}
        />
        <MetricCard
          label="Protocolos SOP"
          value={protocolRunsCount}
          subValue="En ejecución activa"
          icon={Workflow}
          badge="HERMES"
          badgeVariant="default"
          onClick={() => setActiveScreen('protocols')}
        />
        <MetricCard
          label="En Atención"
          value={riskCount}
          subValue="Riesgo de retraso"
          icon={AlertTriangle}
          badge="RIESGO"
          badgeVariant="warning"
          onClick={() => setActiveScreen('radar')}
        />
        <MetricCard
          label="Puntos Críticos"
          value={criticalCount}
          subValue="Bloqueos de DAG"
          icon={Flame}
          badge="CRÍTICO"
          badgeVariant="danger"
          onClick={() => setActiveScreen('tasks')}
        />
      </div>
    </div>
  );
};
