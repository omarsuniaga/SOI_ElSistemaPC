import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  CreditCard, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle, 
  Star, 
  CheckCircle2, 
  Sparkles,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { useAlumnosCartera, AlumnoCarteraRow, CuotaRow } from '../hooks/useAlumnosCartera';
import { useWhatsAppReminders } from '../hooks/useWhatsAppReminders';
import { WhatsAppCooldownButton } from '../components/WhatsAppCooldownButton';
import { WhatsAppReminderModal } from '../components/WhatsAppReminderModal';
import { AlumnoFichaModal } from '../components/AlumnoFichaModal';
import { Alumno, Cuota } from '../types';

interface CuotasViewProps {
  setActiveView?: (view: string) => void;
}

type TabType = 'pendientes' | 'al_dia' | 'retirados' | 'todos';

export const CuotasView: React.FC<CuotasViewProps> = ({ setActiveView }) => {
  const { 
    familias, 
    alumnos: financeAlumnos, 
    periodoActivo, 
    generarCuotasMensuales, 
    iniciarCobroFamilia 
  } = useFinance();

  const {
    alumnos: carteraRows,
    isLoading,
    isOnline,
    isReadCacheDegraded,
    lastSyncTimestamp,
    errorMessage,
    refresh,
    getCuotasByAlumno
  } = useAlumnosCartera();

  const [activeTab, setActiveTab] = useState<TabType>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [genMessage, setGenMessage] = useState<string | null>(null);

  const [expandedAlumnoIds, setExpandedAlumnoIds] = useState<Set<string>>(new Set());
  const [alumnoCuotasMap, setAlumnoCuotasMap] = useState<Record<string, CuotaRow[]>>({});
  const [loadingCuotasMap, setLoadingCuotasMap] = useState<Record<string, boolean>>({});

  const [selectedAlumnoForFicha, setSelectedAlumnoForFicha] = useState<Alumno | null>(null);

  const {
    config,
    getCuotaCooldownState,
    registrarEnvio,
    resetearCooldown
  } = useWhatsAppReminders();

  const [selectedCuotaForReminder, setSelectedCuotaForReminder] = useState<Cuota | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const today = new Date();

  const getDaysOverdue = (vencimientoStr: string | null | undefined) => {
    if (!vencimientoStr) return 0;
    const vDate = new Date(vencimientoStr);
    const diffTime = today.getTime() - vDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleToggleExpand = async (alumnoId: string) => {
    const nextSet = new Set(expandedAlumnoIds);
    if (nextSet.has(alumnoId)) {
      nextSet.delete(alumnoId);
      setExpandedAlumnoIds(nextSet);
      return;
    }

    nextSet.add(alumnoId);
    setExpandedAlumnoIds(nextSet);

    if (!alumnoCuotasMap[alumnoId]) {
      setLoadingCuotasMap(prev => ({ ...prev, [alumnoId]: true }));
      try {
        const rows = await getCuotasByAlumno(alumnoId);
        setAlumnoCuotasMap(prev => ({ ...prev, [alumnoId]: rows }));
      } finally {
        setLoadingCuotasMap(prev => ({ ...prev, [alumnoId]: false }));
      }
    }
  };

  const handleOpenFicha = (row: AlumnoCarteraRow) => {
    const existing = financeAlumnos.find(a => a.id === row.alumno_id);
    if (existing) {
      setSelectedAlumnoForFicha(existing);
    } else {
      const fallbackAlumno: Alumno = {
        id: row.alumno_id || '',
        nombre_completo: row.alumno_nombre || 'Estudiante',
        instrumento_principal: row.instrumento_principal || 'Violín',
        nivel: 'Iniciación',
        familia_id: row.familia_id || '',
        fecha_ingreso: '2026-01-15',
        exento_mensualidad: Boolean(row.exento_mensualidad),
        activo: Boolean(row.alumno_activo),
        representante_nombre: row.contacto_nombre || undefined,
        representante_cedula: row.contacto_cedula || undefined,
        representante_tlf: row.contacto_telefono || undefined,
        correo_representante: row.contacto_email || undefined,
      };
      setSelectedAlumnoForFicha(fallbackAlumno);
    }
  };

  const handleCobrarAlumno = (row: AlumnoCarteraRow) => {
    if (row.familia_id) {
      iniciarCobroFamilia(row.familia_id);
    }
    if (setActiveView) {
      setActiveView('registro_pago');
    }
  };

  const handleGenerarMes = () => {
    const res = generarCuotasMensuales(periodoActivo);
    setGenMessage(`Generación de cuotas ${periodoActivo}: ${res.generadas} cuota(s) creadas, ${res.omitidas} omitidas.`);
    setTimeout(() => setGenMessage(null), 5000);
    refresh();
  };

  const handleSendReminder = (params: {
    plantillaId: string;
    plantillaNombre: string;
    telefonoDestino: string;
    mensajeEnviado: string;
  }) => {
    if (!selectedCuotaForReminder) return;

    const record = registrarEnvio({
      cuotaId: selectedCuotaForReminder.id,
      familiaId: selectedCuotaForReminder.familia_id,
      alumnoId: selectedCuotaForReminder.alumno_id,
      plantillaId: params.plantillaId,
      plantillaNombre: params.plantillaNombre,
      telefonoDestino: params.telefonoDestino,
      mensajeEnviado: params.mensajeEnviado
    });

    setReminderToast(
      `✓ Recordatorio de Vuelta #${record.total_vueltas} registrado para ${selectedCuotaForReminder.alumno_nombre}.`
    );
    setTimeout(() => setReminderToast(null), 6000);
  };

  const filteredAlumnos = useMemo(() => {
    return carteraRows.filter(row => {
      if (activeTab === 'pendientes') {
        if (row.estado_pago !== 'debe' && row.estado_pago !== 'mora') return false;
      } else if (activeTab === 'al_dia') {
        if (row.estado_pago !== 'al_dia' && row.estado_pago !== 'exento') return false;
      } else if (activeTab === 'retirados') {
        if (!(row.estado_pago === 'inactivo' && (row.saldo_pendiente_centavos || 0) > 0)) return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNombre = (row.alumno_nombre || '').toLowerCase().includes(term);
        const matchContacto = (row.contacto_nombre || '').toLowerCase().includes(term);
        const matchFamilia = (row.nombre_familia || '').toLowerCase().includes(term);
        const matchCedula = (row.contacto_cedula || '').toLowerCase().includes(term);
        if (!matchNombre && !matchContacto && !matchFamilia && !matchCedula) {
          return false;
        }
      }

      return true;
    });
  }, [carteraRows, activeTab, searchTerm]);

  const countPendientes = useMemo(() => {
    return carteraRows.filter(r => r.estado_pago === 'debe' || r.estado_pago === 'mora').length;
  }, [carteraRows]);

  const countAlDia = useMemo(() => {
    return carteraRows.filter(r => r.estado_pago === 'al_dia' || r.estado_pago === 'exento').length;
  }, [carteraRows]);

  const countRetirados = useMemo(() => {
    return carteraRows.filter(r => r.estado_pago === 'inactivo' && (r.saldo_pendiente_centavos || 0) > 0).length;
  }, [carteraRows]);

  const renderSemaforo = (estado: string | null | undefined) => {
    switch (estado) {
      case 'al_dia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Al Día
          </span>
        );
      case 'exento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Exento
          </span>
        );
      case 'debe':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pendiente
          </span>
        );
      case 'mora':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            En Mora
          </span>
        );
      case 'inactivo':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Retirado
          </span>
        );
    }
  };

  const activeReminderFamily = selectedCuotaForReminder
    ? familias.find(f => f.id === selectedCuotaForReminder.familia_id)
    : undefined;

  const activeReminderStudent = selectedCuotaForReminder
    ? financeAlumnos.find(a => a.id === selectedCuotaForReminder.alumno_id)
    : undefined;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Cartera & Mensualidades
            </span>
            {isReadCacheDegraded && (
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20">
                Modo Caché
              </span>
            )}
            {isOnline && (
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                Supabase En Línea
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Gestión de Cuotas por Alumno
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Vista consolidada alumno-céntrica sobre <span className="font-mono text-zinc-300">vw_alumno_estado_pago</span>. Una fila por alumno con semáforo oficial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Refrescar cartera desde Supabase"
          >
            <RefreshCw className={`w-4 h-4 text-zinc-400 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            onClick={() => {
              if (setActiveView) setActiveView('registro_pago');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Ventanilla de Cobro</span>
          </button>
          
          <button
            onClick={handleGenerarMes}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-indigo-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generar Facturación ({periodoActivo})</span>
          </button>
        </div>
      </div>

      {genMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{genMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-400 flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {reminderToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
          <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'pendientes'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <span>Pendientes de Cobro</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'pendientes' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {countPendientes}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('al_dia')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'al_dia'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <span>Al Día / Becados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'al_dia' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {countAlDia}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('retirados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'retirados'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <span>Deudas de Retirados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'retirados' ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {countRetirados}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('todos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'todos'
              ? 'bg-indigo-600 text-white border border-indigo-500 shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <span>Todos los Alumnos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'todos' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {carteraRows.length}
          </span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        
        {/* Omnibox Search */}
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por alumno, representante, cédula o familia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="text-xs text-zinc-400 font-mono">
            {isLoading ? (
              <span className="flex items-center gap-2 text-indigo-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando cartera...
              </span>
            ) : (
              <span>Mostrando <strong className="text-white">{filteredAlumnos.length}</strong> alumnos ({lastSyncTimestamp ? `Sinc: ${lastSyncTimestamp}` : ''})</span>
            )}
          </div>
        </div>

        {/* Alumno-Centric Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Alumno</th>
                <th className="py-3 px-4">Padre / Tutor</th>
                <th className="py-3 px-4">Saldo Pendiente</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    {isLoading ? 'Cargando información de cartera...' : 'No se encontraron registros de alumnos para este filtro.'}
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map(row => {
                  const isExpanded = expandedAlumnoIds.has(row.alumno_id || '');
                  const cuotasList = row.alumno_id ? alumnoCuotasMap[row.alumno_id] : undefined;
                  const isCuotasLoading = row.alumno_id ? loadingCuotasMap[row.alumno_id] : false;
                  
                  const pendingCount = row.cuotas_pendientes_count || 0;
                  const overdueCount = row.cuotas_vencidas_count || 0;
                  const saldoCents = row.saldo_pendiente_centavos || 0;
                  const daysOverdue = getDaysOverdue(row.fecha_mas_antigua_vencida);

                  return (
                    <React.Fragment key={row.alumno_id || Math.random()}>
                      <tr className="hover:bg-zinc-950/40 transition-colors">
                        
                        {/* Expand Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleExpand(row.alumno_id || '')}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title={isExpanded ? 'Ocultar cuotas detalladas' : 'Ver cuotas del alumno'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Alumno */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenFicha(row)}
                              className="font-bold text-white hover:text-indigo-400 transition-colors text-left cursor-pointer"
                              title="Ver Ficha 360° del Alumno"
                            >
                              {row.alumno_nombre}
                            </button>
                            {pendingCount > 0 && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md text-[10px] font-mono font-bold">
                                {pendingCount} {pendingCount === 1 ? 'cuota' : 'cuotas'}
                              </span>
                            )}
                            {row.exento_mensualidad && (
                              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-md text-[10px] font-mono font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 text-sky-400" /> Exento
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {row.instrumento_principal}
                          </div>
                        </td>

                        {/* Padre / Tutor */}
                        <td className="py-3.5 px-4">
                          <div className="text-zinc-200 font-medium">
                            {row.contacto_nombre || row.nombre_familia?.replace(/^Familia\s+/i, '') || 'Sin tutor asignado'}
                          </div>
                          {row.contacto_telefono && (
                            <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                              Tel: {row.contacto_telefono}
                            </div>
                          )}
                        </td>

                        {/* Saldo Pendiente */}
                        <td className="py-3.5 px-4 font-mono">
                          {saldoCents > 0 ? (
                            <span className="font-bold text-rose-400 text-sm">
                              {formatDOP(saldoCents)}
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-400 text-xs">
                              Al Día (RD$ 0.00)
                            </span>
                          )}
                        </td>

                        {/* Vencimiento */}
                        <td className="py-3.5 px-4 font-mono">
                          {overdueCount > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                🔴 {daysOverdue} días
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                ({row.fecha_mas_antigua_vencida})
                              </span>
                            </div>
                          ) : pendingCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              🟠 Próximo a vencer
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              Sin deudas
                            </span>
                          )}
                        </td>

                        {/* Estado Semafórico */}
                        <td className="py-3.5 px-4">
                          {renderSemaforo(row.estado_pago)}
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCobrarAlumno(row)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                              title="Registrar Pago en Ventanilla"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Cobrar</span>
                            </button>
                          </div>
                        </td>

                      </tr>

                      {/* Lazy Expanded Row: Detalle de Cuotas del Alumno */}
                      {isExpanded && (
                        <tr className="bg-zinc-950/60 border-t border-b border-indigo-500/20">
                          <td colSpan={7} className="p-4 pl-12">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                  <span>Cuotas Liquidables de {row.alumno_nombre}</span>
                                  {isCuotasLoading && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono">
                                  {cuotasList ? `${cuotasList.length} cuota(s) registradas` : 'Consultando...'}
                                </div>
                              </div>

                              {isCuotasLoading ? (
                                <div className="p-4 text-center text-xs text-zinc-500">
                                  Cargando detalle de cuotas desde Supabase...
                                </div>
                              ) : !cuotasList || cuotasList.length === 0 ? (
                                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                                  No hay cuotas pendientes ni en mora abiertas para este alumno.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {cuotasList.map(c => {
                                    const cSaldo = (c.monto_final_centavos || 0) - (c.monto_pagado_centavos || 0);
                                    const cDays = getDaysOverdue(c.fecha_vencimiento);
                                    const isBecada = c.estado === 'becada' || (c.descuento_centavos || 0) > 0;
                                    
                                    const domainCuota: Cuota = {
                                      id: c.id,
                                      alumno_id: c.alumno_id || '',
                                      alumno_nombre: row.alumno_nombre || '',
                                      representante_id: '',
                                      familia_id: c.familia_id || '',
                                      arancel_concepto: c.concepto || 'Mensualidad Musical',
                                      periodo: `${c.ciclo_anio || 2026}-${String(c.ciclo_mes || 8).padStart(2, '0')}`,
                                      ciclo_academico: `${c.ciclo_anio || 2026}-2027`,
                                      monto_bruto_centavos: c.monto_base_centavos || 60000,
                                      descuento_beca_centavos: c.descuento_centavos || 0,
                                      monto_neto_centavos: c.monto_final_centavos || 60000,
                                      monto_pagado_centavos: c.monto_pagado_centavos || 0,
                                      saldo_centavos: cSaldo,
                                      fecha_emision: c.fecha_generacion || '',
                                      fecha_vencimiento: c.fecha_vencimiento || '',
                                      estado: (c.estado as any) || 'pendiente',
                                      es_prorrateada: false,
                                      version: 1
                                    };

                                    const cooldownState = getCuotaCooldownState(c.id);

                                    return (
                                      <div 
                                        key={c.id} 
                                        className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col justify-between gap-3 shadow-md"
                                      >
                                        <div>
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-zinc-200 text-xs">
                                              {c.concepto || 'Mensualidad'}
                                            </span>
                                            {isBecada && (
                                              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md text-[10px] font-mono font-bold">
                                                ⭐ Beca
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[11px] text-zinc-400 font-mono mt-1">
                                            Vence: {c.fecha_vencimiento} {cDays > 0 ? `(🔴 ${cDays}d)` : ''}
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                                          <div>
                                            <div className="text-[10px] text-zinc-500 font-mono">Saldo</div>
                                            <div className="text-xs font-mono font-bold text-rose-400">
                                              {formatDOP(cSaldo)}
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1.5">
                                            <WhatsAppCooldownButton
                                              cooldownState={cooldownState}
                                              onClick={() => setSelectedCuotaForReminder(domainCuota)}
                                            />

                                            <button
                                              onClick={() => handleCobrarAlumno(row)}
                                              className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                              <CreditCard className="w-3 h-3" />
                                              <span>Pagar</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ficha 360 del Alumno */}
      {selectedAlumnoForFicha && (
        <AlumnoFichaModal
          alumno={selectedAlumnoForFicha}
          onClose={() => setSelectedAlumnoForFicha(null)}
        />
      )}

      {/* WhatsApp Reminder Composer Modal */}
      {selectedCuotaForReminder && (
        <WhatsAppReminderModal
          cuota={selectedCuotaForReminder}
          familia={activeReminderFamily}
          alumno={activeReminderStudent}
          cooldownState={getCuotaCooldownState(selectedCuotaForReminder.id)}
          config={config}
          onClose={() => setSelectedCuotaForReminder(null)}
          onSendReminder={handleSendReminder}
          onResetCooldown={() => resetearCooldown(selectedCuotaForReminder.id)}
        />
      )}

    </div>
  );
};

