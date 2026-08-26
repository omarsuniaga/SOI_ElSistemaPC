import React, { useState } from 'react';
import { useUIStore } from '../../state/uiStore';
import { useAppContainer } from '../../context/AppContainerContext';
import { toast } from '../../state/toastStore';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';
import { CalendarItemKind } from '../../../domain/calendar/valueObjects/CalendarItemKind';
import { CategoryFamily } from '../../../domain/calendar/valueObjects/CategoryFamily';
import { DepartmentCode, PriorityLevel, DEPARTMENTS } from '../../../domain/shared/types';
import { PlusCircle, X, Calendar, Clock, MapPin, Layers } from 'lucide-react';

export const CreateCalendarItemModal: React.FC = () => {
  const container = useAppContainer();
  const {
    isCreateItemModalOpen,
    closeCreateItemModal,
    createItemPrefillDate,
    currentRole,
  } = useUIStore();

  const defaultDate = createItemPrefillDate
    ? createItemPrefillDate
    : new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CalendarItemKind>('EVENT');
  const [category, setCategory] = useState<CategoryFamily>('ARTISTIC');
  const [departmentOwner, setDepartmentOwner] = useState<DepartmentCode>('DIR');
  const [ownerRole, setOwnerRole] = useState('Coordinador de Eventos');
  const [startDate, setStartDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState(defaultDate);
  const [endTime, setEndTime] = useState('12:00');
  const [allDay, setAllDay] = useState(false);
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [location, setLocation] = useState('Sala Principal — Sede Punta Cana');
  const [submitting, setSubmitting] = useState(false);

  if (!isCreateItemModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Campo requerido', 'Por favor ingrese un título descriptivo para el hito.');
      return;
    }

    // Check permission
    const perm = container.permissionService.checkPermission(currentRole, 'CREATE_EVENT');
    if (!perm.allowed) {
      toast.error('Acción denegada por política de rol', perm.reason);
      return;
    }

    try {
      setSubmitting(true);
      const startAtISO = allDay
        ? `${startDate}T00:00:00Z`
        : `${startDate}T${startTime}:00Z`;
      const endAtISO = allDay
        ? `${endDate}T23:59:59Z`
        : `${endDate}T${endTime}:00Z`;

      const newItem = new CalendarItem({
        id: `item-${kind.toLowerCase()}-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'Hito registrado en la partitura temporal.',
        kind,
        category,
        departmentOwner,
        secondaryDepartments: [],
        ownerRole,
        startAt: startAtISO,
        endAt: endAtISO,
        allDay,
        status: 'CONFIRMED',
        priority,
        location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await container.saveCalendarItem.execute(newItem);
      toast.success('Hito Programado Exitosamente', `"${title}" ha sido incorporado al calendario institucional.`);
      closeCreateItemModal();
    } catch (err: any) {
      toast.error('Error al guardar el hito', err?.message || 'Error inesperado del repositorio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 sm:p-7 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100">
                Nuevo Hito Institucional
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Registrar evento, temporada, ventana o deadline en la partitura anual
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateItemModal}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
              Título del Hito / Evento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Gala Sinfónica de Apertura 2026..."
              className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Kind & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Naturaleza (Kind)
              </label>
              <select
                id="create-item-kind-select"
                value={kind}
                onChange={e => setKind(e.target.value as CalendarItemKind)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="EVENT">Evento Artístico / Concierto (EVENT)</option>
                <option value="SEASON">Temporada Semestral / Anual (SEASON)</option>
                <option value="WINDOW">Ventana Operativa / Matrícula (WINDOW)</option>
                <option value="DEADLINE">Límite Institucional / Entrega (DEADLINE)</option>
                <option value="MILESTONE">Hito Estratégico (MILESTONE)</option>
                <option value="BLOCKOUT">Bloqueo de Espacios / Receso (BLOCKOUT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Familia de Categoría
              </label>
              <select
                id="create-item-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as CategoryFamily)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="ARTISTIC">Producción Artística & Conciertos</option>
                <option value="ACADEMIC">Ciclo Académico & Formativo</option>
                <option value="INSTITUTIONAL">Gobernanza Institucional & Asambleas</option>
                <option value="ADMISSIONS">Admisiones & Reinscripciones</option>
                <option value="OPERATIONS">Logística & Mantenimiento</option>
                <option value="PARTNERSHIPS">Alianzas & Donantes</option>
                <option value="FINANCE">Finanzas & Pagos</option>
              </select>
            </div>
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Departamento Responsable
              </label>
              <select
                id="create-item-department-select"
                value={departmentOwner}
                onChange={e => setDepartmentOwner(e.target.value as DepartmentCode)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
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
                Nivel de Prioridad
              </label>
              <select
                id="create-item-priority-select"
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="LOW">Baja (LOW)</option>
                <option value="MEDIUM">Media (MEDIUM)</option>
                <option value="HIGH">Alta (HIGH)</option>
                <option value="CRITICAL">Crítica / Urgente (CRITICAL)</option>
              </select>
            </div>
          </div>

          {/* Dates & Times */}
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Cronograma y Horario
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 font-mono">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={e => setAllDay(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                />
                <span>Todo el día</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Inicio</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-24 h-8 px-2 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Finalización</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-24 h-8 px-2 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location / Venue */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Sede / Sala / Ubicación
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ej: Sala Principal, Auditorio Central, Salón Orquestal..."
              className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
              Descripción y Alcance
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles de repertorio, requerimientos de ensayos o coordinación interdepartamental..."
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={closeCreateItemModal}
              className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-amber-950/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Guardando...' : 'Programar Hito'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
