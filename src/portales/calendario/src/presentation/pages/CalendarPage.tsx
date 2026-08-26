import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { CalendarItem } from '../../domain/calendar/entities/CalendarItem';
import { DepartmentBadge } from '../components/common/DepartmentBadge';
import { KindBadge } from '../components/common/KindBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { HealthIndicator } from '../components/common/HealthIndicator';
import { CalendarItemKind } from '../../domain/calendar/valueObjects/CalendarItemKind';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  Grid,
  CalendarRange,
  Clock,
  Layers,
  MapPin,
  CheckCircle2,
  Globe2,
  PlusCircle,
} from 'lucide-react';
import {
  formatInstitutionalDate,
  formatInstitutionalTime,
  getTimeZoneAbbr,
} from '../utils/dateTimeFormatter';

type CalendarViewMode = 'month' | 'agenda';

export const CalendarPage: React.FC = () => {
  const container = useAppContainer();
  const {
    openItemDrawer,
    selectedDepartmentFilter,
    selectedKindFilter,
    setKindFilter,
    searchQuery,
    showClassesOverlay,
    toggleClassesOverlay,
    preferredTimeZone,
    openCreateItemModal,
    isCreateItemModalOpen,
  } = useUIStore();

  const [items, setItems] = useState<CalendarItem[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // August 2026 default
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await container.getCalendarItems.execute({
        department: selectedDepartmentFilter === 'ALL' ? undefined : selectedDepartmentFilter,
        kind: selectedKindFilter === 'ALL' ? undefined : selectedKindFilter,
        searchQuery: searchQuery || undefined,
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedDepartmentFilter, selectedKindFilter, searchQuery, isCreateItemModalOpen]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 1));
  };

  // Month grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });

  // Get items for a given calendar day
  const getItemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return items.filter(item => {
      const itemStart = item.startAt.slice(0, 10);
      const itemEnd = item.endAt.slice(0, 10);
      return dateStr >= itemStart && dateStr <= itemEnd;
    });
  };

  const kindOptions: Array<{ id: CalendarItemKind | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'Todos los tipos' },
    { id: 'EVENT', label: 'Eventos' },
    { id: 'SEASON', label: 'Temporadas' },
    { id: 'WINDOW', label: 'Ventanas' },
    { id: 'DEADLINE', label: 'Deadlines' },
    { id: 'MILESTONE', label: 'Hitos' },
    { id: 'BLOCKOUT', label: 'Bloqueos' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Calendario Institucional SOI
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Plan maestro anual, ventanas de gestión, plazos fatales y orquestación temporal
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Create Item Button */}
          <button
            id="btn-calendar-create-item"
            onClick={() => openCreateItemModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-amber-950/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Hito</span>
          </button>

          {/* Classes Overlay Toggle */}
          <button
            onClick={toggleClassesOverlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              showClassesOverlay
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mostrar u ocultar franjas de clases regulares en calendario"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Clases Regulares</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                viewMode === 'month'
                  ? 'bg-zinc-800 text-zinc-100 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mes</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-zinc-800 text-zinc-100 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-zinc-800/80 py-3">
        {/* Kind Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {kindOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setKindFilter(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                selectedKindFilter === opt.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:bg-zinc-800"
          >
            Hoy (Ago 2026)
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono text-xs font-bold text-zinc-200 capitalize min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/60 text-center text-xs font-mono font-bold text-zinc-400 py-2.5">
            <div>DOM</div>
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SÁB</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr bg-zinc-900/20 divide-x divide-y divide-zinc-800/60">
            {/* Empty leading cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-zinc-950/40 opacity-30" />
            ))}

            {/* Actual day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayItems = getItemsForDay(day);
              const isToday = day === 15 && month === 7 && year === 2026; // Aug 15 2026 simulation

              return (
                <div
                  key={`day-${day}`}
                  className={`group relative min-h-[120px] p-2 transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-amber-500/5 ring-1 ring-amber-500/30' : 'bg-zinc-950/80 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      onClick={() => openCreateItemModal(dayStr)}
                      title={`Programar hito el ${dayStr}`}
                      className={`text-xs font-mono font-bold transition-transform hover:scale-110 ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center'
                          : 'text-zinc-400 hover:text-amber-400'
                      }`}
                    >
                      {day}
                    </button>
                    <div className="flex items-center gap-1">
                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          {dayItems.length}
                        </span>
                      )}
                      <button
                        onClick={() => openCreateItemModal(dayStr)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-amber-400 transition-opacity"
                        title="Añadir hito en este día"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Day Events Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayItems.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        onClick={() => openItemDrawer(item.id, 'Overview')}
                        className="group/item cursor-pointer rounded px-1.5 py-1 text-[10px] font-mono leading-tight border transition-all truncate flex items-center gap-1 bg-zinc-900 border-zinc-700/80 hover:border-amber-400 hover:text-amber-300"
                        title={`${item.title} (${item.kind})`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              item.kind === 'EVENT'
                                ? '#3b82f6'
                                : item.kind === 'SEASON'
                                ? '#8b5cf6'
                                : item.kind === 'WINDOW'
                                ? '#06b6d4'
                                : item.kind === 'DEADLINE'
                                ? '#f43f5e'
                                : '#eab308',
                          }}
                        />
                        <span className="truncate text-zinc-200 group-hover/item:text-amber-300">{item.title}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div
                        onClick={() => openItemDrawer(dayItems[3].id, 'Overview')}
                        className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer pl-1"
                      >
                        +{dayItems.length - 3} más...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AGENDA / LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-xs font-mono text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800">
              No se encontraron hitos para los filtros seleccionados.
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => openItemDrawer(item.id, 'Overview')}
                className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-center min-w-[64px] shrink-0 font-mono atomic-text">
                    <span className="text-[10px] uppercase text-zinc-500 block atomic-text">
                      {formatInstitutionalDate(item.startAt, preferredTimeZone, { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-zinc-100 block atomic-text tabular-nums">
                      {formatInstitutionalDate(item.startAt, preferredTimeZone, { day: 'numeric' })}
                    </span>
                    <span className="text-[9px] text-zinc-600 block atomic-text">
                      {getTimeZoneAbbr(preferredTimeZone)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <DepartmentBadge code={item.departmentOwner} size="sm" />
                      <KindBadge kind={item.kind} size="sm" />
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 font-mono group-hover:text-amber-400 transition-colors text-content">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1 text-content">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {item.location && (
                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1 atomic-text">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="atomic-text">{item.location}</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 atomic-text shrink-0">
                    Ver Expediente
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
