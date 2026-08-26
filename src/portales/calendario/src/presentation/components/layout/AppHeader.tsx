import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../state/uiStore';
import {
  Sparkles,
  FileSpreadsheet,
  Moon,
  Sun,
  Search,
  Clock,
  Globe2,
  Layers,
  X,
  Shield,
  Menu,
} from 'lucide-react';
import {
  getCurrentTimeInZone,
  getTimeZoneAbbr,
  DEFAULT_INSTITUTION_TIMEZONE,
} from '../../utils/dateTimeFormatter';
import { INSTITUTIONAL_ROLES, UserRole } from '../../../domain/shared/ActionPermission';

export const AppHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    openWeeklySnapshot,
    toggleHermesPanel,
    isHermesPanelOpen,
    openSettingsModal,
    preferredTimeZone,
    use24HourFormat,
    searchQuery,
    setSearchQuery,
    currentRole,
    setCurrentRole,
    toggleMobileNav,
  } = useUIStore();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(getCurrentTimeInZone(preferredTimeZone, !use24HourFormat));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [preferredTimeZone, use24HourFormat]);

  const tzAbbr = getTimeZoneAbbr(preferredTimeZone);
  const isHQ = preferredTimeZone === DEFAULT_INSTITUTION_TIMEZONE;
  const currentRoleMeta = INSTITUTIONAL_ROLES[currentRole];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          id="mobile-nav-toggle-btn"
          onClick={toggleMobileNav}
          className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 md:hidden transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-xs sm:text-sm font-extrabold tracking-wider text-zinc-100">
              SOI
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest px-1 sm:px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Motor Temporal
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate max-w-[130px] sm:max-w-[220px] lg:max-w-none">
            El Sistema Punta Cana — FUNEYCA
          </p>
        </div>
      </div>

      {/* Center: Search & Temporal Clock */}
      <div className="hidden md:flex items-center gap-3 max-w-md lg:max-w-lg w-full mx-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar evento, protocolo, tarea, cátedra o espacio..."
            className="w-full h-8 pl-8 pr-7 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60 font-sans transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Localized Temporal Clock Button */}
        <button
          id="header-timezone-clock-btn"
          onClick={openSettingsModal}
          className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-[11px] font-mono text-zinc-300 atomic-text shrink-0 transition-all"
          title={`Zona activa: ${preferredTimeZone}. Haz clic para configurar zona horaria y sincronización.`}
        >
          <Clock className="w-3 h-3 text-amber-400 group-hover:animate-pulse shrink-0" />
          <span className="font-bold text-zinc-200 atomic-text time-value tabular-nums">{currentTime || '00:00:00'}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-bold atomic-text shrink-0 ${
              isHQ
                ? 'bg-zinc-800 text-zinc-400'
                : 'bg-indigo-950 border border-indigo-800 text-indigo-300'
            }`}
          >
            {tzAbbr}
          </span>
        </button>
      </div>

      {/* Right: Role Selector & Action CTAs */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Role Selector with Security Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900 shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold atomic-text">Rol:</span>
          <select
            id="user-role-select"
            value={currentRole}
            onChange={e => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none cursor-pointer atomic-text"
            title={`${currentRoleMeta.title} - ${currentRoleMeta.description}`}
          >
            {Object.entries(INSTITUTIONAL_ROLES).map(([code, meta]) => (
              <option key={code} value={code} className="bg-zinc-900 text-zinc-200">
                {code} — {meta.title.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Time Zone Settings Modal Trigger */}
        <button
          id="open-settings-modal-btn"
          onClick={openSettingsModal}
          className={`flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-md border text-xs font-medium shrink-0 atomic-text transition-colors ${
            !isHQ
              ? 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/40'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
          }`}
          title="Configuración de Zona Horaria & Coordinación Institucional"
          aria-label="Configuración de Zona Horaria"
        >
          <Globe2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline font-mono atomic-text">{tzAbbr}</span>
        </button>

        {/* Weekly Snapshot Action Button */}
        <button
          id="header-open-snapshot-btn"
          onClick={openWeeklySnapshot}
          className="flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium shrink-0 atomic-text transition-colors"
          title="Generar Informe Semanal Ejecutivo"
          aria-label="Generar Snapshot Semanal"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline atomic-text">Informe Semanal</span>
        </button>

        {/* Hermes Intelligence Toggle Button */}
        <button
          id="header-toggle-hermes-btn"
          onClick={toggleHermesPanel}
          className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md border text-xs font-semibold font-mono shrink-0 atomic-text transition-all ${
            isHermesPanelOpen
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
          }`}
          title="Panel de Inteligencia Hermes"
          aria-label="Alternar Panel Hermes"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
          <span className="hidden sm:inline atomic-text">Hermes</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
        </button>

        {/* Theme Switcher */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          aria-label="Alternar Tema Claro / Oscuro"
          title="Alternar Tema Claro / Oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>
      </div>
    </header>
  );
};
