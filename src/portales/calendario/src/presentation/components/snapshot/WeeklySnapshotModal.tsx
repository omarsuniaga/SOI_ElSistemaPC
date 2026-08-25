import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../../context/AppContainerContext';
import { useUIStore } from '../../state/uiStore';
import { WeeklySnapshotDTO } from '../../../application/calendar/dtos/CalendarItemDTO';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { KindBadge } from '../common/KindBadge';
import { DepartmentCode, DEPARTMENTS } from '../../../domain/shared/types';
import {
  FileSpreadsheet,
  X,
  Printer,
  Calendar,
  AlertOctagon,
  FileText,
  BarChart3,
  Globe2,
} from 'lucide-react';
import {
  formatInstitutionalDate,
  getTimeZoneAbbr,
} from '../../utils/dateTimeFormatter';

export const WeeklySnapshotModal: React.FC = () => {
  const container = useAppContainer();
  const { isWeeklySnapshotOpen, closeWeeklySnapshot, preferredTimeZone } = useUIStore();
  const [snapshot, setSnapshot] = useState<WeeklySnapshotDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isWeeklySnapshotOpen) {
      setLoading(true);
      container.generateWeeklySnapshot
        .execute()
        .then(setSnapshot)
        .finally(() => setLoading(false));
    }
  }, [isWeeklySnapshotOpen]);

  if (!isWeeklySnapshotOpen || !snapshot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                  Snapshot Semanal Oficial
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Semana {snapshot.weekNumber} ({snapshot.startDate} al {snapshot.endDate})
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 mt-1 font-mono">
                Informe Operativo y Ejecutivo — El Sistema Punta Cana
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 text-xs hover:bg-zinc-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={closeWeeklySnapshot}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* 1. Academic Period Context */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Marco Académico Activo:</span>
              <span className="font-bold text-zinc-200">{snapshot.academicPeriodName}</span>
            </div>
          </div>

          {/* 2. Department Load Matrix */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Carga Operativa por Departamento
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(snapshot.departmentLoadSummary) as DepartmentCode[]).map(code => {
                const data = snapshot.departmentLoadSummary[code];
                const meta = DEPARTMENTS[code];
                return (
                  <div key={code} className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30">
                    <div className="flex items-center justify-between">
                      <DepartmentBadge code={code} size="sm" />
                      <span className="text-[10px] font-mono text-zinc-500">{meta.name.split(' ')[0]}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between font-mono text-xs">
                      <span className="text-zinc-400">{data.eventCount} eventos</span>
                      <span className="font-bold text-zinc-200">{data.taskCount} tareas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Confirmed Events & Seasons */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" /> Hitos y Eventos Confirmados
            </h4>
            <div className="space-y-2">
              {snapshot.confirmedEvents.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <KindBadge kind={item.kind} size="sm" />
                    <div>
                      <div className="font-semibold text-zinc-200">{item.title}</div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {formatInstitutionalDate(item.startAt, preferredTimeZone)} ({getTimeZoneAbbr(preferredTimeZone)}) • {item.location || 'Sede Central'}
                      </div>
                    </div>
                  </div>
                  <DepartmentBadge code={item.departmentOwner} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Critical Alerts & Follow-ups */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-3">
              <AlertOctagon className="w-4 h-4 text-rose-400" /> Alertas Críticas de Escalamiento
            </h4>
            <div className="space-y-2">
              {snapshot.criticalAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/20 bg-rose-950/20 text-xs text-rose-200"
                >
                  <span className="font-mono font-bold text-rose-400 shrink-0">#{idx + 1}</span>
                  <span className="leading-relaxed">{alert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Operational Notes */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-emerald-400" /> Minuta de Notas Operativas
            </h4>
            <ul className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 space-y-2 text-xs text-zinc-300">
              {snapshot.operationalNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 font-mono">
          <span>Generado automáticamente por el Motor de Orquestación Temporal SOI</span>
          <span>El Sistema Punta Cana — FUNEYCA</span>
        </div>
      </div>
    </div>
  );
};
