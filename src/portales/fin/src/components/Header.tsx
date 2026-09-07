import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { GlobalSearch } from './GlobalSearch';
import { computeEstadoGastoFijo } from '../lib/gastosFijos';
import { 
  Building2, 
  Calendar, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Menu,
  Zap
} from 'lucide-react';

interface HeaderProps {
  setActiveView: (view: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  setActiveView, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    periodoActivo, 
    setPeriodoActivo,
    tareas,
    gastosFijos,
    gastosFijosPagos,
    cuotas,
    resetearDatos
  } = useFinance();

  const tareasPendientes = tareas.filter(t => t.estado !== 'completada').length;
  const [hdrAnio, hdrMes] = periodoActivo.split('-').map(Number);
  const hdrHoy = new Date().getDate();
  const serviciosEnRiesgo = gastosFijos.filter(g => {
    if (!g.activo) return false;
    const pago = gastosFijosPagos.find(p => p.gasto_fijo_id === g.id && p.periodo_anio === hdrAnio && p.periodo_mes === hdrMes);
    const estado = computeEstadoGastoFijo({ diaInicio: g.dia_inicio, diaFin: g.dia_fin }, hdrHoy, pago?.estado === 'pagado');
    return estado.tone === 'warn' && g.dia_fin - hdrHoy <= 3;
  }).length;
  const cuotasVencidas = cuotas.filter(c => c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date()).length;

  return (
    <header className="bg-zinc-950/90 backdrop-blur-md text-white border-b border-zinc-800/80 sticky top-0 z-40 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Brand & Institution Info with Bento styling */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start shrink-0">
          <div className="flex items-center gap-3">
            {setSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 md:hidden text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer"
                aria-label="Abrir menú"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30 shrink-0">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-white">SOI Finanzas</span>
                <span className="text-zinc-500 font-normal text-xs">/ FUNEYCA-PC</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">
                El Sistema Punta Cana
              </p>
            </div>
          </div>

          {/* Quick Payment Button for Mobile */}
          <button
            onClick={() => setActiveView('registro_pago')}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Registrar Pago</span>
          </button>
        </div>

        {/* Global Search Bar Centerpiece */}
        <div className="w-full lg:flex-1 max-w-full lg:max-w-md xl:max-w-lg mx-0 lg:mx-3">
          <GlobalSearch setActiveView={setActiveView} />
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end shrink-0">
          
          {/* Critical Warnings Pill */}
          {serviciosEnRiesgo > 0 && (
            <button 
              onClick={() => setActiveView('gastos_fijos')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider animate-pulse hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Gastos fijos esenciales con ventana de pago por cerrar en menos de 3 días"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>{serviciosEnRiesgo} Riesgo 48h</span>
            </button>
          )}

          {/* Active Financial Period Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-500 font-medium hidden sm:inline">Período:</span>
            <select
              value={periodoActivo}
              onChange={(e) => setPeriodoActivo(e.target.value)}
              aria-label="Seleccionar período fiscal"
              className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="2026-08" className="bg-zinc-900 text-white">Agosto 2026</option>
              <option value="2026-09" className="bg-zinc-900 text-white">Septiembre 2026</option>
              <option value="2026-10" className="bg-zinc-900 text-white">Octubre 2026</option>
              <option value="2026-07" className="bg-zinc-900 text-white">Julio 2026</option>
            </select>
          </div>

          {/* Current User Info */}
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-200 font-medium max-w-[120px] sm:max-w-[150px] truncate">
                {currentUser.nombre}
              </span>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                {currentUser.rol}
              </span>
            </div>
          </div>

          {/* Quick Pay Action Button */}
          <button
            onClick={() => setActiveView('registro_pago')}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (confirm('¿Restablecer datos institucionales de demostración a su estado inicial?')) {
                resetearDatos();
              }
            }}
            title="Reiniciar datos de demostración"
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </header>
  );
};

