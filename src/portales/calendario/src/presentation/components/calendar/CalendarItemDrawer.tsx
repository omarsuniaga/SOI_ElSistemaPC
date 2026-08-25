import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../../context/AppContainerContext';
import { useUIStore } from '../../state/uiStore';
import { CalendarItemDetailDTO } from '../../../application/calendar/dtos/CalendarItemDTO';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { KindBadge } from '../common/KindBadge';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { HealthIndicator } from '../common/HealthIndicator';
import { toast } from '../../state/toastStore';
import {
  formatInstitutionalDate,
  formatInstitutionalDateTime,
  getTimeZoneAbbr,
} from '../../utils/dateTimeFormatter';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Workflow,
  CheckSquare,
  GitFork,
  Building2,
  FileCheck,
  History,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Plus,
  Play,
  Share2,
  FolderOpen,
} from 'lucide-react';

const DRAWER_TABS = [
  { id: 'overview', label: 'General' },
  { id: 'timeline', label: 'Línea de Tiempo' },
  { id: 'protocols', label: 'Protocolos' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'dependencies', label: 'Dependencias' },
  { id: 'people', label: 'Equipo & Roles' },
  { id: 'venue', label: 'Sede & Espacio' },
  { id: 'evidence', label: 'Evidencia' },
  { id: 'history', label: 'Historial' },
];

export const CalendarItemDrawer: React.FC = () => {
  const container = useAppContainer();
  const {
    selectedCalendarItemId,
    closeItemDrawer,
    drawerTab,
    setDrawerTab,
    openProtocolPreview,
    openCreateTaskModal,
    openConfirmModal,
    preferredTimeZone,
    currentRole,
  } = useUIStore();

  const [detail, setDetail] = useState<CalendarItemDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [executingTriggerId, setExecutingTriggerId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceList, setEvidenceList] = useState<string[]>([
    'drive.google.com/drive/folders/funeyca-soi-audit-2026',
  ]);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    try {
      const data = await container.getCalendarItemDetails.execute(id);
      setDetail(data);
    } catch (err: any) {
      toast.error('Error al cargar detalle del hito', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCalendarItemId) {
      fetchDetail(selectedCalendarItemId);
    } else {
      setDetail(null);
    }
  }, [selectedCalendarItemId]);

  if (!selectedCalendarItemId) return null;

  const handleToggleTask = async (taskId: string, currentStatus: string, taskTitle: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await container.updateTaskStatus.execute(taskId, nextStatus as any);
      toast.success(
        'Tarea Actualizada',
        `"${taskTitle}" marcada como ${nextStatus === 'COMPLETED' ? 'Completada' : 'Pendiente'}.`
      );
      if (selectedCalendarItemId) {
        fetchDetail(selectedCalendarItemId);
      }
    } catch (err: any) {
      toast.error('Error al actualizar tarea', err?.message);
    }
  };

  const handleExecuteTrigger = async (triggerId: string, label: string) => {
    const perm = container.permissionService.checkPermission(currentRole, 'EXECUTE_TRIGGER');
    if (!perm.allowed) {
      toast.error('Acción denegada por política de permisos', perm.reason);
      return;
    }

    setExecutingTriggerId(triggerId);
    try {
      await container.executeTrigger.execute(triggerId);
      toast.success(
        'Trigger Ejecutado',
        `El trigger "${label}" se ha disparado satisfactoriamente.`
      );
      if (selectedCalendarItemId) {
        await fetchDetail(selectedCalendarItemId);
      }
    } catch (err: any) {
      toast.error('Fallo en la ejecución del trigger', err?.message);
    } finally {
      setExecutingTriggerId(null);
    }
  };

  const handleDeleteItem = () => {
    if (!detail) return;

    const perm = container.permissionService.checkPermission(currentRole, 'DELETE_CALENDAR_ITEM');
    if (!perm.allowed) {
      toast.error('Acción denegada por política de permisos', perm.reason);
      return;
    }

    openConfirmModal({
      title: `¿Eliminar "${detail.item.title}"?`,
      description: `Esta acción removerá el hito del Calendario Maestro y archivará todos los triggers y tareas vinculadas. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar Hito Permanentemente',
      cancelLabel: 'Conservar Hito',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await container.deleteCalendarItem.execute(detail.item.id);
          toast.success(
            'Hito Eliminado',
            `El evento "${detail.item.title}" ha sido removido del sistema.`
          );
          closeItemDrawer();
        } catch (err: any) {
          toast.error('Error al eliminar hito', err?.message);
        }
      },
    });
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim()) return;
    setEvidenceList(prev => [...prev, evidenceUrl.trim()]);
    setEvidenceUrl('');
    toast.success('Evidencia Anexada', 'El enlace al repositorio de auditoría ha sido registrado.');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[640px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {detail && (
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <DepartmentBadge code={detail.item.departmentOwner} size="sm" />
              <KindBadge kind={detail.item.kind} size="sm" />
              <StatusBadge status={detail.item.status} size="sm" />
              {detail.health && (
                <HealthIndicator health={detail.health} size="sm" />
              )}
            </div>
          )}
          <h2 className="text-lg font-bold text-zinc-100 font-mono leading-tight truncate">
            {detail?.item.title || 'Cargando...'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono flex items-center gap-2 flex-wrap">
            <span className="atomic-text">ID: {selectedCalendarItemId}</span>
            {detail?.item.location && (
              <span className="flex items-center gap-1 atomic-text">
                • <MapPin className="w-3 h-3 text-zinc-500 shrink-0" /> <span className="atomic-text">{detail.item.location}</span>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {detail && (
            <button
              onClick={handleDeleteItem}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
              title="Eliminar este hito institucional"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeItemDrawer}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 px-4 border-b border-zinc-800 bg-zinc-950/80 overflow-x-auto no-scrollbar py-2">
        {DRAWER_TABS.map(tab => {
          const isSelected =
            drawerTab.toLowerCase() === tab.id.toLowerCase() ||
            drawerTab.toLowerCase() === tab.label.toLowerCase() ||
            (tab.id === 'overview' && (drawerTab === 'Overview' || drawerTab === 'General'));

          return (
            <button
              key={tab.id}
              onClick={() => setDrawerTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-colors shrink-0 atomic-text ${
                isSelected
                  ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'tasks' && detail?.tasks.length ? ` (${detail.tasks.length})` : ''}
              {tab.id === 'timeline' && detail?.triggers.length ? ` (${detail.triggers.length})` : ''}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading || !detail ? (
          <div className="text-center py-20 text-xs font-mono text-zinc-500">
            Cargando expediente operativo...
          </div>
        ) : (
          <div>
            {/* 1. OVERVIEW TAB */}
            {(drawerTab.toLowerCase() === 'overview' ||
              drawerTab.toLowerCase() === 'general' ||
              drawerTab === 'General' ||
              drawerTab === 'Overview') && (
              <div className="space-y-5">
                {/* Health Breakdown */}
                {detail.health && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-xs font-bold font-mono text-zinc-300">
                        Índice de Salud Operativa SOI
                      </span>
                      <HealthIndicator health={detail.health} size="sm" showReasons={false} />
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                      {detail.health.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                    Descripción & Alcance
                  </h4>
                  <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/80">
                    {detail.item.description || 'Sin descripción detallada.'}
                  </p>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                    <span className="text-zinc-500 font-mono text-[11px] block atomic-text">Inicio del Hito:</span>
                    <span className="font-mono text-zinc-200 font-bold mt-1 block atomic-text">
                      {formatInstitutionalDateTime(detail.item.startAt, preferredTimeZone)}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 atomic-text">{getTimeZoneAbbr(preferredTimeZone)}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                    <span className="text-zinc-500 font-mono text-[11px] block atomic-text">Cierre del Hito:</span>
                    <span className="font-mono text-zinc-200 font-bold mt-1 block atomic-text">
                      {formatInstitutionalDateTime(detail.item.endAt, preferredTimeZone)}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 atomic-text">{getTimeZoneAbbr(preferredTimeZone)}</span>
                  </div>
                </div>

                {/* Category & Family */}
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase atomic-text">Categoría SOI:</span>
                    <span className="font-mono text-zinc-200 font-bold atomic-text">{detail.item.category}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase atomic-text">Rol Responsable:</span>
                    <span className="font-mono text-zinc-200 font-bold atomic-text">{detail.item.ownerRole}</span>
                  </div>
                </div>

                {/* Audience & Tags */}
                {detail.item.tags && detail.item.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-2">
                      Etiquetas Semánticas
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px] font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. TIMELINE & TRIGGERS TAB */}
            {(drawerTab.toLowerCase() === 'timeline' ||
              drawerTab.toLowerCase() === 'línea de tiempo' ||
              drawerTab === 'Timeline') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                    Disparadores Temporales Derivados ({detail.triggers.length})
                  </h4>
                  <span className="text-[11px] font-mono text-amber-400">Horizonte T-X</span>
                </div>

                <div className="space-y-2.5">
                  {detail.triggers.map(trig => (
                    <div
                      key={trig.id}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        trig.isExecuted
                          ? 'border-emerald-500/30 bg-emerald-950/10'
                          : 'border-zinc-800 bg-zinc-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {trig.offsetValue === 0
                              ? 'T0'
                              : trig.offsetValue > 0
                              ? `T+${trig.offsetValue}${trig.offsetUnit[0]}`
                              : `T${trig.offsetValue}${trig.offsetUnit[0]}`}
                          </span>
                          <span className="font-mono font-semibold text-zinc-200">
                            {trig.label}
                          </span>
                        </div>
                        {trig.isExecuted ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> EJECUTADO
                          </span>
                        ) : (
                          <button
                            onClick={() => handleExecuteTrigger(trig.id, trig.label)}
                            disabled={executingTriggerId === trig.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-[11px] font-bold shadow-sm transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>{executingTriggerId === trig.id ? 'Ejecutando...' : 'Ejecutar Disparador'}</span>
                          </button>
                        )}
                      </div>

                      <p className="text-zinc-400 mt-2 leading-snug">{trig.description}</p>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>Disparo: {formatInstitutionalDate(trig.fireAt, preferredTimeZone)} ({getTimeZoneAbbr(preferredTimeZone)})</span>
                        {trig.actionProcessCode && (
                          <span className="text-indigo-400">Protocolo: {trig.actionProcessCode}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PROTOCOLS TAB */}
            {(drawerTab.toLowerCase() === 'protocols' ||
              drawerTab.toLowerCase() === 'protocolos' ||
              drawerTab === 'Protocols') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                    Protocolos SOP Asociados
                  </h4>
                  <button
                    onClick={() => openProtocolPreview('ADM-P01')}
                    className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Workflow className="w-3 h-3" /> Previsualizar Protocolo
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        PRD-P02
                      </span>
                      <span className="font-mono text-zinc-200 font-bold">
                        Protocolo de Montaje de Sala y Ensayo General
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px]">80% Progreso</span>
                  </div>
                  <p className="text-zinc-400">
                    Orquestación automática activada en T-15. Coordina logística de atriles, afinación de piano y permisos.
                  </p>
                </div>
              </div>
            )}

            {/* 4. TASKS TAB */}
            {(drawerTab.toLowerCase() === 'tasks' ||
              drawerTab.toLowerCase() === 'tareas' ||
              drawerTab === 'Tasks') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                    Tareas Institucionales ({detail.tasks.length})
                  </h4>
                  <button
                    onClick={() => openCreateTaskModal(detail.item.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-mono font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Asignar Tarea</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {detail.tasks.map(t => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTask(t.id, t.status, t.title)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              t.status === 'COMPLETED'
                                ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                                : 'border-zinc-700 bg-zinc-950 text-transparent hover:border-emerald-400'
                            }`}
                          >
                            <CheckSquare className="w-3 h-3" />
                          </button>
                          <span
                            className={`font-medium ${
                              t.status === 'COMPLETED' ? 'line-through text-zinc-500' : 'text-zinc-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <PriorityBadge priority={t.priority} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                        <span>Responsable: {t.ownerRole}</span>
                        <span>Plazo: {formatInstitutionalDate(t.dueAt, preferredTimeZone)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. DEPENDENCIES TAB */}
            {(drawerTab.toLowerCase() === 'dependencies' ||
              drawerTab.toLowerCase() === 'dependencias' ||
              drawerTab === 'Dependencies') && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                  Grafo Dirigido Acíclico (DAG de Tareas)
                </h4>
                <div className="space-y-2 text-xs">
                  {detail.tasks.map(t => {
                    const dag = detail.dagMap?.[t.id];
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-zinc-200 font-bold">{t.title}</span>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                              dag?.isBlocked
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {dag?.isBlocked ? 'BLOQUEADA' : 'DESBLOQUEADA'}
                          </span>
                        </div>
                        {dag?.blockingTaskTitles && dag.blockingTaskTitles.length > 0 ? (
                          <div className="mt-2 text-[11px] text-zinc-400 font-mono">
                            Depende de:
                            <ul className="list-disc list-inside text-amber-400 mt-1">
                              {dag.blockingTaskTitles.map((bTitle, idx) => (
                                <li key={idx}>{bTitle}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mt-1 text-[10px] text-zinc-500 font-mono">
                            Sin dependencias precedentes directas.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. PEOPLE TAB */}
            {(drawerTab.toLowerCase() === 'people' ||
              drawerTab.toLowerCase() === 'equipo' ||
              drawerTab === 'People') && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                  Equipo Responsable & Gobernanza
                </h4>
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 text-xs space-y-2">
                  <div className="text-zinc-400">
                    <span className="font-mono text-zinc-500">Líder / Propietario:</span>{' '}
                    <strong className="text-zinc-200">{detail.item.ownerRole}</strong>
                  </div>
                  <div className="text-zinc-400">
                    <span className="font-mono text-zinc-500">Departamento Principal:</span>{' '}
                    <DepartmentBadge code={detail.item.departmentOwner} size="sm" showName />
                  </div>
                  {detail.item.secondaryDepartments && detail.item.secondaryDepartments.length > 0 && (
                    <div className="text-zinc-400 flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-zinc-500">Departamentos Secundarios:</span>
                      {detail.item.secondaryDepartments.map(d => (
                        <DepartmentBadge key={d} code={d} size="sm" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. VENUE TAB */}
            {(drawerTab.toLowerCase() === 'venue' ||
              drawerTab.toLowerCase() === 'sede' ||
              drawerTab === 'Venue') && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                  Sede & Logística Espacial
                </h4>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-zinc-200 font-mono text-sm">
                      {detail.item.location || 'Sede Principal FUNEYCA'}
                    </span>
                  </div>
                  <p className="text-zinc-400">
                    Asignación confirmada en calendario institucional. No se detectan conflictos de solapamiento con ensayos regulares en este horario.
                  </p>
                </div>
              </div>
            )}

            {/* 8. EVIDENCE TAB */}
            {(drawerTab.toLowerCase() === 'evidence' ||
              drawerTab.toLowerCase() === 'evidencia' ||
              drawerTab === 'Evidence') && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                  Carpeta de Evidencia & Auditoría
                </h4>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs space-y-3">
                  <div className="space-y-2">
                    {evidenceList.map((url, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 flex items-center justify-between"
                      >
                        <span className="truncate max-w-[280px] sm:max-w-[340px]">{url}</span>
                        <a
                          href={`https://${url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddEvidence} className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={evidenceUrl}
                      onChange={e => setEvidenceUrl(e.target.value)}
                      placeholder="Registrar enlace a evidencia (Drive, PDF, Acta)..."
                      className="flex-1 h-8 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono"
                    >
                      Anexar
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 9. HISTORY TAB */}
            {(drawerTab.toLowerCase() === 'history' ||
              drawerTab.toLowerCase() === 'historial' ||
              drawerTab === 'History') && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                  Trazabilidad & Logs de Eventos
                </h4>
                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800 flex items-center justify-between">
                    <span>Creación del Hito en Calendario</span>
                    <span className="text-zinc-500">{formatInstitutionalDateTime(detail.item.startAt, preferredTimeZone)}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800 flex items-center justify-between">
                    <span>Evaluación de Salud Hermes</span>
                    <span className="text-emerald-400">Score {detail.health?.score}/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
