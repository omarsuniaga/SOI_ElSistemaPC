import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { SeasonRoadmapDTO } from '../../application/calendar/useCases/GetSeasons';
import { CalendarItem } from '../../domain/calendar/entities/CalendarItem';
import { DepartmentBadge } from '../components/common/DepartmentBadge';
import { KindBadge } from '../components/common/KindBadge';
import { CalendarItemKind } from '../../domain/calendar/valueObjects/CalendarItemKind';
import {
  CalendarRange,
  Info,
  PlusCircle,
  Filter,
} from 'lucide-react';
import { formatInstitutionalDate } from '../utils/dateTimeFormatter';

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const SeasonsPage: React.FC = () => {
  const container = useAppContainer();
  const { openItemDrawer, openCreateItemModal, isCreateItemModalOpen, preferredTimeZone } = useUIStore();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [selectedKind, setSelectedKind] = useState<CalendarItemKind | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchSeasons = () => {
    setLoading(true);
    container.getSeasons
      .execute()
      .then((data: SeasonRoadmapDTO) => {
        setItems([
          ...data.seasons,
          ...data.windows,
          ...data.deadlines,
          ...data.events,
          ...data.blockouts,
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSeasons();
  }, [isCreateItemModalOpen]);

  const filteredItems = items.filter(item => {
    if (selectedKind !== 'ALL' && item.kind !== selectedKind) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Partitura Institucional Anual (Roadmap 2026)
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visualización longitudinal de Temporadas, Ventanas de Gestión, Hitos y Recesos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateItemModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-amber-950/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Estructura Temporal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-800/80">
        {[
          { id: 'ALL', label: 'Todos' },
          { id: 'SEASON', label: 'Temporadas' },
          { id: 'WINDOW', label: 'Ventanas' },
          { id: 'DEADLINE', label: 'Deadlines' },
          { id: 'EVENT', label: 'Eventos' },
          { id: 'BLOCKOUT', label: 'Recesos / Bloqueos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedKind(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              selectedKind === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 12-Month Longitudinal Visual Bar Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl space-y-4">
        {/* Months Bar Header */}
        <div className="grid grid-cols-12 border-b border-zinc-800 pb-3 text-center text-xs font-mono font-bold text-zinc-400">
          {MONTHS.map((m, idx) => (
            <div key={idx} className={idx >= 7 ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
              {m}
            </div>
          ))}
        </div>

        {/* Dynamic Timeline Tracks */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="text-center py-12 text-xs font-mono text-zinc-500">
              Construyendo partitura anual...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-zinc-500">
              No hay elementos para el filtro seleccionado.
            </div>
          ) : (
            filteredItems.map(s => {
              const startMonth = new Date(s.startAt).getMonth(); // 0-11
              const endMonth = new Date(s.endAt).getMonth();

              return (
                <div
                  key={s.id}
                  onClick={() => openItemDrawer(s.id, 'Overview')}
                  className="group cursor-pointer rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <DepartmentBadge code={s.departmentOwner} size="sm" />
                      <KindBadge kind={s.kind} size="sm" />
                      <span className="font-mono font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                        {s.title}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {formatInstitutionalDate(s.startAt, preferredTimeZone)} al{' '}
                      {formatInstitutionalDate(s.endAt, preferredTimeZone)}
                    </span>
                  </div>

                  {/* Visual Timeline Span */}
                  <div className="grid grid-cols-12 gap-1 h-3 rounded bg-zinc-950/80 p-0.5 border border-zinc-800">
                    {Array.from({ length: 12 }).map((_, mIdx) => {
                      const isActiveMonth = mIdx >= startMonth && mIdx <= endMonth;
                      return (
                        <div
                          key={mIdx}
                          className={`h-full rounded-sm transition-all ${
                            isActiveMonth
                              ? s.kind === 'SEASON'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                                : s.kind === 'WINDOW'
                                ? 'bg-cyan-500'
                                : s.kind === 'BLOCKOUT'
                                ? 'bg-zinc-600'
                                : 'bg-amber-500'
                              : 'bg-transparent'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend & Guide */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 text-xs font-mono text-zinc-400">
        <h4 className="font-bold text-zinc-300 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" /> Jerarquía de Tipos Temporales
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <strong className="text-purple-400 block mb-0.5">SEASON (Temporada):</strong>
            Marco programático amplio que agrupa conciertos, giras y proyectos.
          </div>
          <div>
            <strong className="text-cyan-400 block mb-0.5">WINDOW (Ventana):</strong>
            Periodo operativo estricto con fecha de inicio y cierre formal.
          </div>
          <div>
            <strong className="text-rose-400 block mb-0.5">DEADLINE (Plazo Fatal):</strong>
            Fecha límite de cumplimiento estricto con activación de alarmas.
          </div>
          <div>
            <strong className="text-zinc-400 block mb-0.5">BLOCKOUT (Receso):</strong>
            Periodo de inactividad, vacaciones institucionales o mantenimiento de salas.
          </div>
        </div>
      </div>
    </div>
  );
};
