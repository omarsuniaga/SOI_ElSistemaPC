import React from 'react';
import { useUIStore, ActiveScreen } from '../../state/uiStore';
import { DepartmentCode, DEPARTMENTS } from '../../../domain/shared/types';
import {
  Radio,
  Calendar as CalendarIcon,
  CalendarRange,
  Clock,
  Workflow,
  CheckSquare,
  Building2,
  Filter,
  X,
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedDepartmentFilter,
    setDepartmentFilter,
    isMobileNavOpen,
    closeMobileNav,
  } = useUIStore();

  const navItems: Array<{
    id: ActiveScreen;
    label: string;
    icon: typeof Radio;
    badge?: string;
    badgeCls?: string;
  }> = [
    {
      id: 'radar',
      label: 'Radar Temporal',
      icon: Radio,
      badge: 'ACTIVO',
      badgeCls: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'calendar',
      label: 'Calendario Global',
      icon: CalendarIcon,
    },
    {
      id: 'seasons',
      label: 'Partitura Anual',
      icon: CalendarRange,
      badge: 'Salud',
    },
    {
      id: 'schedules',
      label: 'Matriz Semanal',
      icon: Clock,
    },
    {
      id: 'protocols',
      label: 'Ejecución de Protocolos',
      icon: Workflow,
      badge: '6',
      badgeCls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'tasks',
      label: 'Tablero Hermes',
      icon: CheckSquare,
      badge: 'DAG',
      badgeCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'venues',
      label: 'Espacios & Sedes',
      icon: Building2,
      badge: '10',
    },
  ];

  const departmentKeys = Object.keys(DEPARTMENTS) as DepartmentCode[];

  const handleNavClick = (id: ActiveScreen) => {
    setActiveScreen(id);
    closeMobileNav();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          id="mobile-nav-backdrop"
          onClick={closeMobileNav}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-in fade-in duration-150"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 md:top-14 z-50 md:z-20 h-full md:h-[calc(100vh-3.5rem)] w-64 md:w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 p-3.5 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800 md:hidden">
            <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              Navegación SOI
            </span>
            <button
              onClick={closeMobileNav}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              aria-label="Cerrar menú de navegación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation items */}
          <div className="space-y-1">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
              Orquestación Temporal
            </p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 atomic-text badge-chip ${
                        item.badgeCls || 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Department Filters Section */}
          <div className="mt-6 pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono flex items-center gap-1 atomic-text">
                <Filter className="w-3 h-3 text-amber-400 shrink-0" /> Departamentos
              </span>
              {selectedDepartmentFilter !== 'ALL' && (
                <button
                  id="reset-dept-filter-btn"
                  onClick={() => setDepartmentFilter('ALL')}
                  className="text-[10px] text-amber-400 hover:underline font-mono atomic-text"
                >
                  Restablecer
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button
                id="filter-dept-all-btn"
                onClick={() => setDepartmentFilter('ALL')}
                className={`text-[11px] font-mono py-1 px-2 rounded border text-left transition-colors atomic-text ${
                  selectedDepartmentFilter === 'ALL'
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-bold'
                    : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                TODOS
              </button>
              {departmentKeys.map(code => {
                const meta = DEPARTMENTS[code];
                const isSelected = selectedDepartmentFilter === code;
                return (
                  <button
                    key={code}
                    id={`filter-dept-${code}-btn`}
                    onClick={() => setDepartmentFilter(code)}
                    className={`text-[11px] font-mono py-1 px-2 rounded border text-left flex items-center gap-1.5 transition-colors atomic-text ${
                      isSelected
                        ? `${meta.badgeClass} font-bold`
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title={meta.name}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.colorHex }}
                    />
                    <span className="truncate dept-code">{code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer System Status */}
        <div className="mt-4 pt-3 border-t border-zinc-900 px-2 text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center justify-between gap-1">
            <span className="atomic-text">Estado del Motor</span>
            <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold atomic-text shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              OPERATIVO
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-0.5 truncate">SOI Kernel v2.4 (Hexagonal)</p>
        </div>
      </aside>
    </>
  );
};
