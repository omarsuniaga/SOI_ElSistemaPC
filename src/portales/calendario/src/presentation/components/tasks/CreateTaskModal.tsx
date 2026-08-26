import React, { useState } from 'react';
import { useUIStore } from '../../state/uiStore';
import { useAppContainer } from '../../context/AppContainerContext';
import { toast } from '../../state/toastStore';
import { DepartmentCode, PriorityLevel, DEPARTMENTS } from '../../../domain/shared/types';
import { CheckSquare, X, Calendar, UserCheck, ShieldCheck } from 'lucide-react';

export const CreateTaskModal: React.FC = () => {
  const container = useAppContainer();
  const {
    isCreateTaskModalOpen,
    closeCreateTaskModal,
    createTaskPrefillItemId,
    currentRole,
  } = useUIStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<DepartmentCode>('DIR');
  const [ownerRole, setOwnerRole] = useState('Director Técnico');
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState('17:00');
  const [triggerLabel, setTriggerLabel] = useState('T-15');
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isCreateTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Campo requerido', 'Por favor ingrese un título para la tarea operativa.');
      return;
    }

    try {
      setSubmitting(true);
      const dueAtISO = `${dueDate}T${dueTime}:00Z`;

      await container.createTask.execute({
        calendarItemId: createTaskPrefillItemId || undefined,
        correlationId: createTaskPrefillItemId
          ? `SOI-ITEM-${createTaskPrefillItemId}`
          : `SOI-TASK-MANUAL-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'Tarea operativa generada desde la consola SOI.',
        department,
        ownerRole,
        status: 'PENDING',
        priority,
        dueAt: dueAtISO,
        evidenceRequired,
        evidenceItems: [],
        triggerLabel,
        progressPercentage: 0,
      });

      toast.success(
        'Tarea Institucional Asignada',
        `"${title}" ha sido registrada con fecha límite ${dueDate}.`
      );
      closeCreateTaskModal();
    } catch (err: any) {
      toast.error('Error al registrar la tarea', err?.message || 'Error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 sm:p-7 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100">
                Nueva Tarea Institucional
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Asignar entregable operativo con evidencia y correlación temporal
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateTaskModal}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
              Nombre del Entregable / Tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Verificación de atriles y microfonía para coro..."
              className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Departamento Responsable
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as DepartmentCode)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {Object.entries(DEPARTMENTS).map(([code, meta]) => (
                  <option key={code} value={code}>
                    [{code}] {meta.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Rol / Responsable
              </label>
              <input
                type="text"
                value={ownerRole}
                onChange={e => setOwnerRole(e.target.value)}
                placeholder="Ej: Jefe de Escenario, Administrador..."
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Prioridad
              </label>
              <select
                id="create-task-priority-select"
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="LOW">Baja (LOW)</option>
                <option value="MEDIUM">Media (MEDIUM)</option>
                <option value="HIGH">Alta (HIGH)</option>
                <option value="CRITICAL">Crítica / Urgente (CRITICAL)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Trigger Asociado (Horizonte)
              </label>
              <input
                type="text"
                value={triggerLabel}
                onChange={e => setTriggerLabel(e.target.value)}
                placeholder="Ej: T-30, T-15, T-7, T-0"
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Fecha Límite (Deadline)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Hora Límite
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40">
              <input
                type="checkbox"
                checked={evidenceRequired}
                onChange={e => setEvidenceRequired(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              />
              <span>Requiere Carga de Evidencia Verificada para cierre</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
              Descripción e Instrucciones
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Especificaciones técnicas o pasos del protocolo..."
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={closeCreateTaskModal}
              className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-950/30"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{submitting ? 'Asignando...' : 'Asignar Tarea'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
