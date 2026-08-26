import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { ProtocolRun } from '../../domain/orchestration/entities/ProtocolRun';
import { DepartmentBadge } from '../components/common/DepartmentBadge';
import { toast } from '../state/toastStore';
import {
  Workflow,
  Plus,
  Play,
  XCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import {
  formatInstitutionalDate,
  getTimeZoneAbbr,
} from '../utils/dateTimeFormatter';

export const ProtocolRunsPage: React.FC = () => {
  const container = useAppContainer();
  const {
    openItemDrawer,
    openProtocolPreview,
    preferredTimeZone,
    openConfirmModal,
    currentRole,
  } = useUIStore();

  const [runs, setRuns] = useState<ProtocolRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const data = await container.getProtocolRuns.execute();
      setRuns(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleCancelRun = (e: React.MouseEvent, run: ProtocolRun) => {
    e.stopPropagation();

    const perm = container.permissionService.checkPermission(currentRole, 'CANCEL_PROTOCOL_RUN');
    if (!perm.allowed) {
      toast.error('Acción denegada por permisos', perm.reason);
      return;
    }

    openConfirmModal({
      title: `¿Cancelar Ejecución del Protocolo ${run.processCode}?`,
      description: `Esta acción detendrá las tareas no completadas asociadas a "${run.processName}" y registrará la cancelación en la bitácora institucional de auditoría.`,
      confirmLabel: 'Cancelar Ejecución',
      cancelLabel: 'Mantener Activo',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await container.cancelProtocolRun.execute(run.id, 'Cancelado por intervención de usuario.');
          toast.warning(
            'Protocolo Cancelado',
            `La ejecución ${run.processCode} ha sido detenida.`
          );
          fetchRuns();
        } catch (err: any) {
          toast.error('Error al cancelar protocolo', err?.message);
        }
      },
    });
  };

  const filteredRuns = runs.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Ejecuciones de Protocolo — Orquestaciones Activas
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Procesos operativos estandarizados (SOP), correlación y trazabilidad de tareas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openProtocolPreview('ADM-P01')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Lanzar Protocolo SOI</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-800/80">
        {[
          { id: 'ALL', label: 'Todos los Procesos' },
          { id: 'IN_PROGRESS', label: 'En Progreso' },
          { id: 'COMPLETED', label: 'Completados' },
          { id: 'CANCELLED', label: 'Cancelados' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              statusFilter === tab.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Runs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-16 text-xs font-mono text-zinc-500">
            Cargando ejecuciones de protocolos...
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-xs font-mono text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800">
            No hay protocolos para el filtro seleccionado.
          </div>
        ) : (
          filteredRuns.map(run => (
            <div
              key={run.id}
              onClick={() => openItemDrawer(run.calendarItemId, 'Protocols')}
              className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-indigo-500/50 hover:bg-zinc-800/40 transition-all space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                      {run.processCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        run.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : run.status === 'CANCELLED'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {run.status === 'COMPLETED' ? 'COMPLETADO' : run.status === 'CANCELLED' ? 'CANCELADO' : 'EN PROGRESO'}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-zinc-100 font-mono group-hover:text-indigo-300 transition-colors">
                    {run.processName}
                  </h3>
                </div>

                <div className="text-right font-mono">
                  <span className="text-lg font-bold text-zinc-100">{run.overallProgress}%</span>
                  <span className="text-[10px] text-zinc-500 block">Progreso Total</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${run.overallProgress}%` }}
                />
              </div>

              {/* Departments Breakdown */}
              {run.departmentBreakdown && run.departmentBreakdown.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {run.departmentBreakdown.map((dept, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono"
                    >
                      <DepartmentBadge code={dept.department} size="sm" />
                      <span className="text-zinc-300">{dept.completedTasks}/{dept.totalTasks} tareas</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Toolbar on Card */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>Iniciado: {formatInstitutionalDate(run.startedAt, preferredTimeZone)} ({getTimeZoneAbbr(preferredTimeZone)})</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openProtocolPreview(run.processCode);
                    }}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-indigo-300 transition-colors"
                    title="Previsualizar especificación SOP"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {run.status === 'IN_PROGRESS' && (
                    <button
                      onClick={e => handleCancelRun(e, run)}
                      className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 transition-colors"
                      title="Cancelar ejecución del protocolo"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
