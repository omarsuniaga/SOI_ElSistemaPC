import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../../context/AppContainerContext';
import { useUIStore } from '../../state/uiStore';
import { HermesInsight } from '../../../domain/orchestration/entities/HermesInsight';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { AutomationBadge } from '../common/AutomationBadge';
import { toast } from '../../state/toastStore';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const HermesPanel: React.FC = () => {
  const container = useAppContainer();
  const {
    isHermesPanelOpen,
    toggleHermesPanel,
    openItemDrawer,
    openProtocolPreview,
    openWeeklySnapshot,
    openCreateTaskModal,
    openVenueDetailModal,
  } = useUIStore();

  const [insights, setInsights] = useState<HermesInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await container.getHermesRecommendations.execute();
      setInsights(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleAction = async (action: any, insight: HermesInsight) => {
    if (action.actionType === 'OPEN_DRAWER' && action.payload?.itemId) {
      openItemDrawer(action.payload.itemId, action.payload.tab || 'Overview');
    } else if (action.actionType === 'TRIGGER_WORKFLOW') {
      openProtocolPreview(insight.protocolRunId || 'ADM-P01');
      toast.info('Protocolo SOI Desplegado', 'Revise las fases de ejecución y confirme el lanzamiento.');
    } else if (action.actionType === 'ESCALATE_TASK') {
      if (insight.calendarItemId) {
        openItemDrawer(insight.calendarItemId, 'Tasks');
      } else {
        openCreateTaskModal();
      }
    } else if (action.actionType === 'RESERVE_VENUE') {
      openVenueDetailModal('venue-aula-magna');
    } else if (insight.id === 'insight-weekly-snapshot' || action.actionType === 'WEEKLY_SNAPSHOT') {
      openWeeklySnapshot();
    } else {
      toast.success('Acción Aprobada', `La recomendación "${action.label}" ha sido procesada por Hermes.`);
    }
  };

  const handleDismiss = async (id: string) => {
    await container.getHermesRecommendations.dismiss(id);
    setInsights(prev => prev.filter(i => i.id !== id));
    toast.info('Recomendación Archivada', 'El ítem ha sido descartado de la vista activa.');
  };

  if (!isHermesPanelOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center gap-2">
              Hermes Orchestration Intelligence
            </h3>
            <p className="text-xs text-zinc-400">
              Capa de inferencia temporal y supervisión institucional
            </p>
          </div>
        </div>
        <button
          onClick={toggleHermesPanel}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Governance Philosophy Notice */}
      <div className="px-5 py-2.5 bg-indigo-950/20 border-b border-indigo-900/30 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Hermes propone diagnósticos. <strong>Los humanos deciden.</strong></span>
        <span className="font-mono text-indigo-400 text-[10px]">AGT-SOI</span>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-xs font-mono">
            Evaluando matrices de orquestación...
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <ShieldCheck className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-xs font-mono">No hay riesgos temporales ni alertas activas pendientes.</p>
          </div>
        ) : (
          insights.map(insight => {
            const isRisk = insight.type === 'RISK';
            return (
              <div
                key={insight.id}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  isRisk
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isRisk ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : insight.type === 'DETECTION' ? (
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-zinc-100 font-mono leading-tight">
                      {insight.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                    title="Descartar sugerencia"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Badges */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <DepartmentBadge code={insight.department} size="sm" />
                  <AutomationBadge level={insight.automationLevel} size="sm" />
                  {insight.correlationId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {insight.correlationId}
                    </span>
                  )}
                </div>

                {/* Summary */}
                <p className="mt-2.5 text-xs text-zinc-300 leading-relaxed">
                  {insight.summary}
                </p>

                {/* Detailed Analysis if present */}
                {insight.detailedAnalysis && (
                  <p className="mt-2 text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed font-sans">
                    {insight.detailedAnalysis}
                  </p>
                )}

                {/* Metrics Breakdown */}
                {insight.metrics && insight.metrics.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {insight.metrics.map((m, idx) => (
                      <div key={idx} className="p-2 rounded bg-zinc-950/40 border border-zinc-800 text-xs">
                        <div className="text-[10px] font-mono text-zinc-500">{m.label}</div>
                        <div className="font-bold font-mono text-zinc-200 mt-0.5 flex items-center justify-between">
                          <span>{m.value}</span>
                          {m.badge && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Proposed Actions */}
                {insight.proposedActions && insight.proposedActions.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex flex-wrap gap-2">
                    {insight.proposedActions.map(act => (
                      <button
                        key={act.id}
                        onClick={() => handleAction(act, insight)}
                        className={`text-xs font-mono px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                          act.isPrimary
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
