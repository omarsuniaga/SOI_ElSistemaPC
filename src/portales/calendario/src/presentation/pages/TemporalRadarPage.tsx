import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { RadarSummaryDTO, RadarHorizonGroup } from '../../application/calendar/dtos/CalendarItemDTO';
import { DepartmentBadge } from '../components/common/DepartmentBadge';
import { HealthIndicator } from '../components/common/HealthIndicator';
import { ReenrollmentFunnel } from '../components/hermes/ReenrollmentFunnel';
import { toast } from '../state/toastStore';
import {
  Radio,
  Zap,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Globe2,
  Download,
  Eye,
  Power,
} from 'lucide-react';
import {
  formatInstitutionalDate,
  formatInstitutionalTime,
  getTimeZoneAbbr,
} from '../utils/dateTimeFormatter';

export const TemporalRadarPage: React.FC = () => {
  const container = useAppContainer();
  const {
    openItemDrawer,
    selectedDepartmentFilter,
    toggleHermesPanel,
    preferredTimeZone,
    openSettingsModal,
    openExportModal,
    openProtocolPreview,
    currentRole,
  } = useUIStore();
  const [radar, setRadar] = useState<RadarSummaryDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('ALL');
  const [executingTriggerId, setExecutingTriggerId] = useState<string | null>(null);

  const fetchRadar = async () => {
    setLoading(true);
    try {
      const data = await container.getTemporalRadar.execute();
      setRadar(data);
    } catch (err: any) {
      toast.error('Error al sincronizar radar', err?.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, []);

  const handleExecuteTrigger = async (e: React.MouseEvent, triggerId: string, label: string) => {
    e.stopPropagation();

    const perm = container.permissionService.checkPermission(currentRole, 'EXECUTE_TRIGGER');
    if (!perm.allowed) {
      toast.error('Acción denegada por política institucional', perm.reason);
      return;
    }

    setExecutingTriggerId(triggerId);
    try {
      await container.executeTrigger.execute(triggerId);
      toast.success(
        'Protocolo Disparado Exitosamente',
        `El trigger "${label}" ha emitido sus órdenes operativas al canal Hermes.`
      );
      await fetchRadar();
    } catch (err: any) {
      toast.error('Fallo en la ejecución del trigger', err?.message || 'Error inesperado.');
    } finally {
      setExecutingTriggerId(null);
    }
  };

  const handleToggleTriggerStatus = async (e: React.MouseEvent, triggerId: string, currentActive: boolean) => {
    e.stopPropagation();
    try {
      await container.toggleTriggerStatus.execute(triggerId, !currentActive);
      toast.info(
        currentActive ? 'Trigger Pausado' : 'Trigger Reactivado',
        `El estado de supervisión temporal ha sido actualizado.`
      );
      await fetchRadar();
    } catch (err: any) {
      toast.error('Error al cambiar estado del trigger', err?.message);
    }
  };

  if (loading || !radar) {
    return (
      <div className="flex h-96 items-center justify-center text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>Sincronizando radar de orquestación temporal...</span>
        </div>
      </div>
    );
  }

  // Filter groups
  const horizonGroups = radar.horizons.filter(h => {
    if (selectedHorizon !== 'ALL' && h.horizon !== selectedHorizon) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Radar Header & Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Temporal Radar — Orquestación Anticipatoria
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Supervisión continua de horizontes T-X y disparo automatizado de protocolos
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-radar-export-insights"
            onClick={openExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs hover:bg-amber-500/20 font-mono transition-all"
            title="Exportar radar e insights en formato CSV o PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar Insights</span>
          </button>
          <button
            onClick={fetchRadar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs hover:bg-zinc-800 font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalcular</span>
          </button>
        </div>
      </div>

      {/* 2. Demonstration Funnel Scenario (ADM-P01 Reinscripciones) */}
      <ReenrollmentFunnel
        onTriggerAssistedCalls={() => {
          toggleHermesPanel();
        }}
      />

      {/* 3. Horizon Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedHorizon('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
            selectedHorizon === 'ALL'
              ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700'
              : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
          }`}
        >
          TODOS LOS HORIZONTES ({radar.horizons.reduce((acc, h) => acc + h.items.length, 0)})
        </button>
        {radar.horizons.map(h => (
          <button
            key={h.horizon}
            onClick={() => setSelectedHorizon(h.horizon)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              selectedHorizon === h.horizon
                ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            <span>{h.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
              {h.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Horizon Groups Timeline Stream */}
      <div className="space-y-6">
        {horizonGroups.map(group => {
          const filteredItems = group.items.filter(entry => {
            if (
              selectedDepartmentFilter !== 'ALL' &&
              entry.trigger.department !== selectedDepartmentFilter
            ) {
              return false;
            }
            return true;
          });

          if (filteredItems.length === 0) return null;

          const isOverdue = group.horizon === 'OVERDUE';
          const isToday = group.horizon === 'TODAY';

          return (
            <div
              key={group.horizon}
              className={`rounded-xl border p-4 sm:p-5 transition-all ${
                isOverdue
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : isToday
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-zinc-800/80 bg-zinc-950/40'
              }`}
            >
              {/* Group Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-md font-mono text-xs font-bold ${
                      isOverdue
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isToday
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {group.horizon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 font-mono">{group.label}</h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {filteredItems.length} acciones temporales programadas
                    </p>
                  </div>
                </div>
              </div>

              {/* Triggers Cards Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredItems.map(entry => {
                  const trig = entry.trigger;
                  const health = entry.health;
                  return (
                    <div
                      key={trig.id}
                      onClick={() => openItemDrawer(trig.calendarItemId, 'Timeline')}
                      className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <DepartmentBadge code={trig.department} size="sm" />
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 atomic-text shrink-0">
                            {trig.offsetValue === 0
                              ? 'T0'
                              : trig.offsetValue > 0
                              ? `T+${trig.offsetValue}${trig.offsetUnit[0]}`
                              : `T${trig.offsetValue}${trig.offsetUnit[0]}`}
                          </span>
                          {health && <HealthIndicator health={health} size="sm" showReasons={false} />}
                        </div>

                        {/* Trigger Action CTAs */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {trig.isExecuted ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 atomic-text shrink-0">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> EJECUTADO
                            </span>
                          ) : (
                            <button
                              onClick={e => handleExecuteTrigger(e, trig.id, trig.label)}
                              disabled={executingTriggerId === trig.id}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-[10px] font-bold transition-all shrink-0 atomic-text shadow-sm shadow-amber-950/30"
                              title="Disparar orquestación automática"
                            >
                              <Zap className="w-2.5 h-2.5 shrink-0" />
                              <span className="atomic-text">{executingTriggerId === trig.id ? 'Ejecutando...' : 'Disparar'}</span>
                            </button>
                          )}

                          {/* Quick Protocol Preview */}
                          {trig.associatedProtocolCode && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                openProtocolPreview(trig.associatedProtocolCode!);
                              }}
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-indigo-300 transition-colors shrink-0"
                              title={`Previsualizar protocolo ${trig.associatedProtocolCode}`}
                            >
                              <Eye className="w-3 h-3 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Title & Calendar Item */}
                      <h4 className="mt-2.5 text-xs font-bold text-zinc-100 font-mono group-hover:text-amber-400 transition-colors text-content">
                        {trig.label}
                      </h4>
                      <p className="mt-1 text-[11px] text-zinc-400 leading-snug line-clamp-2 text-content">
                        {trig.description}
                      </p>

                      {/* Footer Info */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
                        <span className="truncate min-w-0">Hito: {entry.calendarItem.title}</span>
                        <span className="flex items-center gap-1 text-zinc-400 shrink-0 atomic-text" title={`Disparo local: ${formatInstitutionalDate(trig.fireAt, preferredTimeZone)} ${formatInstitutionalTime(trig.fireAt, preferredTimeZone)}`}>
                          <span className="date-value atomic-text">{formatInstitutionalDate(trig.fireAt, preferredTimeZone)}</span>
                          <span className="text-[9px] text-zinc-500 atomic-text">{getTimeZoneAbbr(preferredTimeZone)}</span>
                          <ArrowRight className="w-3 h-3 opacity-60 shrink-0" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
