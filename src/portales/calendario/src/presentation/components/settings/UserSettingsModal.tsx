import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../state/uiStore';
import {
  INSTITUTIONAL_TIMEZONES,
  DEFAULT_INSTITUTION_TIMEZONE,
  getCurrentTimeInZone,
  formatInstitutionalDate,
  formatInstitutionalTime,
  getTimeZoneAbbr,
} from '../../utils/dateTimeFormatter';
import {
  Globe2,
  Clock,
  Check,
  Building2,
  Shield,
  Layers,
  X,
  Sparkles,
  Info,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const UserSettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    preferredTimeZone,
    setPreferredTimeZone,
    secondaryTimeZone,
    setSecondaryTimeZone,
    use24HourFormat,
    setUse24HourFormat,
  } = useUIStore();

  const [search, setSearch] = useState('');
  const [hqClock, setHqClock] = useState('');
  const [userClock, setUserClock] = useState('');
  const [secondaryClock, setSecondaryClock] = useState('');

  // Live ticking clocks
  useEffect(() => {
    if (!isSettingsModalOpen) return;

    const tick = () => {
      setHqClock(getCurrentTimeInZone(DEFAULT_INSTITUTION_TIMEZONE, !use24HourFormat));
      setUserClock(getCurrentTimeInZone(preferredTimeZone, !use24HourFormat));
      if (secondaryTimeZone) {
        setSecondaryClock(getCurrentTimeInZone(secondaryTimeZone, !use24HourFormat));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isSettingsModalOpen, preferredTimeZone, secondaryTimeZone, use24HourFormat]);

  if (!isSettingsModalOpen) return null;

  const filteredTimeZones = INSTITUTIONAL_TIMEZONES.filter(
    tz =>
      tz.name.toLowerCase().includes(search.toLowerCase()) ||
      tz.city.toLowerCase().includes(search.toLowerCase()) ||
      tz.region.toLowerCase().includes(search.toLowerCase()) ||
      tz.offsetLabel.toLowerCase().includes(search.toLowerCase()) ||
      tz.institutionRole.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTzObj =
    INSTITUTIONAL_TIMEZONES.find(t => t.id === preferredTimeZone) || INSTITUTIONAL_TIMEZONES[0];
  const secondaryTzObj = secondaryTimeZone
    ? INSTITUTIONAL_TIMEZONES.find(t => t.id === secondaryTimeZone)
    : null;

  // Sample upcoming institutional milestone date to preview
  const sampleMilestone = new Date(2026, 7, 10, 19, 30); // 10 Aug 2026 19:30:00

  return (
    <div
      id="user-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeSettingsModal}
    >
      <div
        id="user-settings-modal-container"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
                <span>Configuración de Zona Horaria & Coordinación Global</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Adapta todos los hitos, disparadores y tareas del SOI al contexto temporal de tu sede o rol
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={closeSettingsModal}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Synchronized Clocks Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sede Central (Punta Cana / Santo Domingo) */}
          <div className="p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Building2 className="w-3.5 h-3.5" /> Sede Central (FUNEYCA)
              </span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-300">
                AST (UTC-4)
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-zinc-100">{hqClock || '--:--:--'}</span>
              <span className="text-[11px] text-zinc-500">Punta Cana, Rep. Dom.</span>
            </div>
          </div>

          {/* User Preferred Local Time */}
          <div className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                <Compass className="w-3.5 h-3.5" /> Tu Vista Local Activa
              </span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-900/60 border border-indigo-700/50 text-[10px] text-indigo-300">
                {selectedTzObj.offsetLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-indigo-200">{userClock || '--:--:--'}</span>
              <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                {selectedTzObj.city}
              </span>
            </div>
          </div>
        </div>

        {/* Time Format Switcher (24h vs 12h) */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div>
            <div className="text-xs font-semibold font-mono text-zinc-200">Formato Horario</div>
            <div className="text-[11px] text-zinc-400">
              Alterna entre formato militar de 24 horas y estándar AM/PM
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
            <button
              id="format-24h-btn"
              onClick={() => setUse24HourFormat(true)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                use24HourFormat
                  ? 'bg-zinc-800 text-amber-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              24h
            </button>
            <button
              id="format-12h-btn"
              onClick={() => setUse24HourFormat(false)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                !use24HourFormat
                  ? 'bg-zinc-800 text-amber-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              12h (AM/PM)
            </button>
          </div>
        </div>

        {/* Primary Time Zone Selection */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold font-mono text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Zona Horaria Principal del Coordinador</span>
            </label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filtrar sede, país o huso..."
              className="h-7 px-2.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 w-full sm:w-56"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredTimeZones.map(tz => {
              const isSelected = preferredTimeZone === tz.id;
              return (
                <button
                  key={tz.id}
                  id={`tz-option-${tz.id.replace('/', '-')}`}
                  onClick={() => setPreferredTimeZone(tz.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 text-zinc-100 shadow-sm'
                      : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-100 truncate">
                        {tz.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                        {tz.offsetLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans truncate">
                      {tz.city} • <span className="text-zinc-500">{tz.institutionRole}</span>
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-zinc-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Context Preview of an Institutional Event */}
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Previsualización de Impacto en Fechas & Convocatorias</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs font-mono space-y-1">
            <div className="text-zinc-400 text-[11px]">
              Ejemplo: Concierto de Gala & Clausura Académica 2026
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-zinc-200 gap-1 pt-1">
              <div>
                <span className="text-zinc-500">Sede Central (AST): </span>
                <span className="text-amber-300 font-bold">
                  {formatInstitutionalDate(sampleMilestone, DEFAULT_INSTITUTION_TIMEZONE)},{' '}
                  {formatInstitutionalTime(sampleMilestone, DEFAULT_INSTITUTION_TIMEZONE, {
                    hour12: !use24HourFormat,
                  })}{' '}
                  AST
                </span>
              </div>
              <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-zinc-600" />
              <div>
                <span className="text-zinc-500">Tu Horario: </span>
                <span className="text-indigo-300 font-bold">
                  {formatInstitutionalDate(sampleMilestone, preferredTimeZone)},{' '}
                  {formatInstitutionalTime(sampleMilestone, preferredTimeZone, {
                    hour12: !use24HourFormat,
                  })}{' '}
                  {getTimeZoneAbbr(preferredTimeZone)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
          <button
            id="reset-tz-btn"
            onClick={() => {
              setPreferredTimeZone(DEFAULT_INSTITUTION_TIMEZONE);
              setSecondaryTimeZone(null);
            }}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Restablecer a Sede Punta Cana (AST)
          </button>
          <button
            id="save-tz-btn"
            onClick={closeSettingsModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
