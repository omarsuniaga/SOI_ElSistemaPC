import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { TaskWithDAGInfo } from '../../application/tasks/useCases/GetTasks';
import { DepartmentBadge } from '../components/common/DepartmentBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { TaskStatus } from '../../domain/tasks/entities/InstitutionalTask';
import { DepartmentCode, DEPARTMENTS } from '../../domain/shared/types';
import { toast } from '../state/toastStore';
import {
  CheckSquare,
  Lock,
  ArrowRight,
  PlusCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { formatInstitutionalDate } from '../utils/dateTimeFormatter';

const COLUMNS: Array<{ id: TaskStatus; label: string; bg: string }> = [
  { id: 'BLOCKED', label: 'Bloqueadas (DAG)', bg: 'border-rose-500/30 bg-rose-950/10' },
  { id: 'PENDING', label: 'Por Iniciar', bg: 'border-zinc-800 bg-zinc-950/40' },
  { id: 'IN_PROGRESS', label: 'En Progreso', bg: 'border-amber-500/30 bg-amber-950/10' },
  { id: 'WAITING_APPROVAL', label: 'En Aprobación', bg: 'border-indigo-500/30 bg-indigo-950/10' },
  { id: 'COMPLETED', label: 'Completadas', bg: 'border-emerald-500/30 bg-emerald-950/10' },
];

export const HermesTasksPage: React.FC = () => {
  const container = useAppContainer();
  const {
    openItemDrawer,
    selectedDepartmentFilter,
    setDepartmentFilter,
    searchQuery,
    openCreateTaskModal,
    isCreateTaskModalOpen,
    openConfirmModal,
    preferredTimeZone,
    currentRole,
  } = useUIStore();

  const [tasksWithDag, setTasksWithDag] = useState<TaskWithDAGInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await container.getTasks.execute({
        department: selectedDepartmentFilter === 'ALL' ? undefined : selectedDepartmentFilter,
      });
      setTasksWithDag(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDepartmentFilter, isCreateTaskModalOpen]);

  const handleUpdateStatus = async (e: React.MouseEvent, taskId: string, taskTitle: string, nextStatus: TaskStatus) => {
    e.stopPropagation();
    try {
      await container.updateTaskStatus.execute(taskId, nextStatus);
      toast.success(
        'Estado de Tarea Actualizado',
        `"${taskTitle}" movida a ${nextStatus}.`
      );
      await fetchTasks();
    } catch (err: any) {
      toast.error('Error al actualizar estado', err?.message);
    }
  };

  const handleEscalateTask = (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();

    openConfirmModal({
      title: `¿Escalar Incidencia en "${taskTitle}"?`,
      description: `Esta acción elevará la prioridad a CRÍTICA y emitirá una alerta directa a la Dirección Ejecutiva y Coordinación Operativa para destrabar el proceso.`,
      confirmLabel: 'Escalar a Dirección',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await container.escalateTask.execute(
            taskId,
            'Escalación operativa por riesgo de bloqueo temporal o falta de recursos.'
          );
          toast.warning(
            'Tarea Escalada a Dirección',
            `Alerta de alta prioridad enviada para "${taskTitle}".`
          );
          fetchTasks();
        } catch (err: any) {
          toast.error('Error al escalar tarea', err?.message);
        }
      },
    });
  };

  const filteredTasks = tasksWithDag.filter(({ task }) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.ownerRole.toLowerCase().includes(q) ||
        task.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Hermes Tasks — Tablero Kanban & Resolución DAG
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestión operacional con bloqueo topológico de precedencias y trazabilidad de evidencias
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateTaskModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-950/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-800/80">
        <button
          onClick={() => setDepartmentFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
            selectedDepartmentFilter === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
          }`}
        >
          TODOS LOS DEPARTAMENTOS ({tasksWithDag.length})
        </button>
        {Object.entries(DEPARTMENTS).map(([code, meta]) => (
          <button
            key={code}
            onClick={() => setDepartmentFilter(code as DepartmentCode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              selectedDepartmentFilter === code
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            [{code}] {meta.name}
          </button>
        ))}
      </div>

      {/* Kanban Columns — fixed-width columns in a horizontally scrolling row, so a column
          never gets squeezed narrower than its content can handle (5 columns need more room
          than the sidebar-constrained viewport reliably has; scrolling beats cramming). */}
      <div className="flex gap-3.5 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(({ task, dag }) => {
            if (col.id === 'BLOCKED') {
              return dag.isBlocked && task.status !== 'COMPLETED';
            }
            if (dag.isBlocked && task.status !== 'COMPLETED') {
              return false;
            }
            return task.status === col.id;
          });

          return (
            <div
              key={col.id}
              className={`rounded-xl border p-3 flex flex-col min-h-[500px] w-[240px] sm:w-[270px] shrink-0 ${col.bg}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80 mb-3">
                <span className="font-mono text-xs font-bold text-zinc-200">{col.label}</span>
                <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-[11px] font-mono text-zinc-600">
                    Sin tareas
                  </div>
                ) : (
                  colTasks.map(({ task, dag }) => (
                    <div
                      key={task.id}
                      onClick={() => task.calendarItemId && openItemDrawer(task.calendarItemId, 'Tasks')}
                      className="group cursor-pointer rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-3 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all text-xs space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <DepartmentBadge code={task.department} size="sm" />
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>

                      <h4 className="font-medium text-zinc-100 group-hover:text-amber-300 transition-colors leading-snug break-words">
                        {task.title}
                      </h4>

                      {dag.isBlocked && dag.blockingTaskTitles.length > 0 && (
                        <div className="p-1.5 rounded bg-rose-950/60 border border-rose-800/50 text-[10px] font-mono text-rose-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">Bloqueo: {dag.blockingTaskTitles[0]}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>{task.ownerRole}</span>
                        <span>{formatInstitutionalDate(task.dueAt, preferredTimeZone, { month: 'numeric', day: 'numeric' })}</span>
                      </div>

                      {/* Quick Move and Escalate Actions */}
                      <div className="flex items-center gap-1 pt-1">
                        {!dag.isBlocked && task.status !== 'COMPLETED' && (
                          <button
                            onClick={e =>
                              handleUpdateStatus(
                                e,
                                task.id,
                                task.title,
                                task.status === 'PENDING'
                                  ? 'IN_PROGRESS'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'WAITING_APPROVAL'
                                  : 'COMPLETED'
                              )
                            }
                            className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors border border-zinc-700/60"
                            title="Avanzar etapa en el flujo operativo"
                          >
                            <ArrowRight className="w-3 h-3 text-amber-400" />
                            <span>
                              {task.status === 'PENDING'
                                ? 'Iniciar'
                                : task.status === 'IN_PROGRESS'
                                ? 'Aprobar'
                                : 'Completar'}
                            </span>
                          </button>
                        )}

                        {task.status !== 'COMPLETED' && (
                          <button
                            onClick={e => handleEscalateTask(e, task.id, task.title)}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[10px] font-mono flex items-center gap-1 transition-colors"
                            title="Escalar bloqueo o riesgo a Dirección"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span>Escalar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
