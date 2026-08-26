import React, { useState } from 'react';
import { useUIStore } from '../../state/uiStore';
import { useAppContainer } from '../../context/AppContainerContext';
import { toast } from '../../state/toastStore';
import { ClassSchedule, DayOfWeek } from '../../../domain/schedule/entities/ClassSchedule';
import { Clock, X, BookOpen, User, Building2 } from 'lucide-react';

export const ScheduleClassModal: React.FC = () => {
  const container = useAppContainer();
  const { isScheduleClassModalOpen, closeScheduleClassModal, currentRole } = useUIStore();

  const [chairName, setChairName] = useState('Cátedra de Cuerdas Frotadas');
  const [instrument, setInstrument] = useState('Violín I');
  const [teacherName, setTeacherName] = useState('Mtro. Carlos Rondón');
  const [studentGroup, setStudentGroup] = useState('Orquesta Sinfónica Juvenil');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venueName, setVenueName] = useState('Aula 101 - Cátedras de Cuerdas');
  const [maxStudents, setMaxStudents] = useState(15);
  const [currentEnrolled, setCurrentEnrolled] = useState(12);
  const [submitting, setSubmitting] = useState(false);

  if (!isScheduleClassModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const perm = container.permissionService.checkPermission(currentRole, 'SAVE_SCHEDULE_DRAFT');
    if (!perm.allowed) {
      toast.error('Acción denegada por permisos', perm.reason);
      return;
    }

    try {
      setSubmitting(true);
      const newClass = new ClassSchedule({
        id: `sched-cls-${Date.now()}`,
        chairName,
        teacherName,
        teacherId: `teacher-${Date.now()}`,
        instrument,
        studentGroup,
        dayOfWeek,
        startTime,
        endTime,
        venueId: `venue-${venueName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        venueName,
        academicPeriodId: 'period-2026-s2',
        maxStudents: Number(maxStudents),
        currentEnrolled: Number(currentEnrolled),
      });

      await container.saveClassSchedule.execute(newClass);
      toast.success(
        'Franja Académica Registrada',
        `${chairName} (${instrument}) programada los ${dayOfWeek} de ${startTime} a ${endTime}.`
      );
      closeScheduleClassModal();
    } catch (err: any) {
      toast.error('Error al guardar horario', err?.message || 'Error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 sm:p-7 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100">
                Programar Franja de Cátedra / Ensayo
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Integrar clase regular a la matriz semanal y detección de conflictos
              </p>
            </div>
          </div>
          <button
            onClick={closeScheduleClassModal}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Cátedra / Programa *
              </label>
              <input
                type="text"
                required
                value={chairName}
                onChange={e => setChairName(e.target.value)}
                placeholder="Ej: Cátedra de Viento Madera..."
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Instrumento / Sección *
              </label>
              <input
                type="text"
                required
                value={instrument}
                onChange={e => setInstrument(e.target.value)}
                placeholder="Ej: Clarinete, Fagot, Percusión..."
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Docente / Catedrático *
              </label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="Ej: Mtro. Rafael Gómez..."
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Agrupación / Cohorte
              </label>
              <input
                type="text"
                value={studentGroup}
                onChange={e => setStudentGroup(e.target.value)}
                placeholder="Ej: Semillero Infantil A..."
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Día de la Semana
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="MONDAY">Lunes</option>
                <option value="TUESDAY">Martes</option>
                <option value="WEDNESDAY">Miércoles</option>
                <option value="THURSDAY">Jueves</option>
                <option value="FRIDAY">Viernes</option>
                <option value="SATURDAY">Sábado</option>
                <option value="SUNDAY">Domingo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Hora Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full h-9 px-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Hora Fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full h-9 px-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
              Aula / Sala Asignada
            </label>
            <input
              type="text"
              value={venueName}
              onChange={e => setVenueName(e.target.value)}
              placeholder="Ej: Aula 102 - Cátedras de Viento..."
              className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Cupo Máximo
              </label>
              <input
                type="number"
                value={maxStudents}
                onChange={e => setMaxStudents(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Alumnos Inscritos
              </label>
              <input
                type="number"
                value={currentEnrolled}
                onChange={e => setCurrentEnrolled(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={closeScheduleClassModal}
              className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-indigo-950/30"
            >
              <Clock className="w-4 h-4" />
              <span>{submitting ? 'Guardando...' : 'Asignar Horario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
