import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { ScheduleViewDTO } from '../../application/schedule/useCases/GetClassSchedules';
import { toast } from '../state/toastStore';
import {
  Clock,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';

const DAYS = [
  { id: 'MONDAY', label: 'Lunes' },
  { id: 'TUESDAY', label: 'Martes' },
  { id: 'WEDNESDAY', label: 'Miércoles' },
  { id: 'THURSDAY', label: 'Jueves' },
  { id: 'FRIDAY', label: 'Viernes' },
  { id: 'SATURDAY', label: 'Sábado' },
];

export const ScheduleBuilderPage: React.FC = () => {
  const container = useAppContainer();
  const {
    openScheduleClassModal,
    isScheduleClassModalOpen,
    openConfirmModal,
    currentRole,
  } = useUIStore();

  const [scheduleData, setScheduleData] = useState<ScheduleViewDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('MONDAY');
  const [publishing, setPublishing] = useState(false);

  const fetchSchedules = () => {
    setLoading(true);
    container.getClassSchedules
      .execute()
      .then(setScheduleData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchedules();
  }, [isScheduleClassModalOpen]);

  const handlePublish = () => {
    if (!scheduleData?.activePeriod) return;

    const perm = container.permissionService.checkPermission(currentRole, 'PUBLISH_SCHEDULE');
    if (!perm.allowed) {
      toast.error('Acción denegada por política de permisos', perm.reason);
      return;
    }

    openConfirmModal({
      title: '¿Publicar Matriz Académica Oficial?',
      description: `Esta acción fijará los horarios del periodo "${scheduleData.activePeriod.name}" y notificará a catedráticos y directores de orquesta. Los horarios entrarán en vigencia institucional.`,
      confirmLabel: 'Publicar Horario Oficial',
      cancelLabel: 'Seguir Editando',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setPublishing(true);
          await container.publishSchedule.execute(scheduleData.activePeriod!.id);
          toast.success(
            'Matriz Académica Publicada',
            `El periodo "${scheduleData.activePeriod!.name}" ha sido publicado oficialmente.`
          );
          fetchSchedules();
        } catch (err: any) {
          toast.error('Error al publicar horario', err?.message);
        } finally {
          setPublishing(false);
        }
      },
    });
  };

  if (loading || !scheduleData) {
    return (
      <div className="flex h-96 items-center justify-center text-xs font-mono text-zinc-500">
        Cargando matriz de programación académica...
      </div>
    );
  }

  const daySchedules = scheduleData.schedules.filter(s => s.dayOfWeek === selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Schedule Builder — Matriz Académica Semanal
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Programación de cátedras, orquestas, ensambles y detección de colisiones espaciales
          </p>
        </div>

        {/* Actions & Period Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openScheduleClassModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-950/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Programar Franja</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-emerald-950/30"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{publishing ? 'Publicando...' : 'Publicar Horario'}</span>
          </button>
        </div>
      </div>

      {/* Conflict Resolution Banner */}
      {scheduleData.conflicts.length > 0 ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Colisiones de Horario / Sala Detectadas ({scheduleData.conflicts.length})</span>
          </div>
          <div className="space-y-1.5">
            {scheduleData.conflicts.map((c, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-zinc-950/60 border border-rose-900/40 text-xs text-zinc-300 flex items-start gap-2"
              >
                <span className="font-mono text-rose-400 text-[11px] font-bold shrink-0">
                  [{c.conflictType}]
                </span>
                <span>{c.description}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3.5 flex items-center gap-2 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>Matriz académica sin colisiones ni solapamientos docentes/espaciales.</span>
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-950/80 p-1 rounded-xl">
        {DAYS.map(d => {
          const count = scheduleData.schedules.filter(s => s.dayOfWeek === d.id).length;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                selectedDay === d.id
                  ? 'bg-zinc-800 text-amber-400 font-bold shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{d.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {daySchedules.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-xs font-mono text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800">
            No hay clases programadas para este día. Haz clic en "Programar Franja" para agregar una.
          </div>
        ) : (
          daySchedules.map(item => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {item.chairName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 font-mono mt-1.5">
                    {item.instrument} — {item.studentGroup}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center gap-1.5 truncate">
                  <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{item.teacherName}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{item.venueName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                <span>Cupo: {item.currentEnrolled} / {item.maxStudents} alumnos</span>
                <span className="text-emerald-400 font-semibold">Activo</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
