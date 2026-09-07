import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  CalendarCheck,
  Music4,
  Wallet,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Guitar,
  UserCheck,
  ShieldCheck,
  Phone,
  MapPin,
  FileText,
  Wrench,
  Sparkles,
  Search,
  Award,
  CheckCircle2,
  Plus,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ArrowUpRight,
  PlusCircle,
  Coins
} from 'lucide-react';
import { formatDOP, getISPEtiqueta } from '../lib/financialMath';
import {
  fetchResumenAcademico,
  computePctAsistencia,
  computeResumenSolvencia,
  ResumenAcademico,
} from '../lib/alumno360';
import { Alumno } from '../types';

interface AlumnoFichaModalProps {
  alumno: Alumno;
  onClose: () => void;
  onSelectOtroAlumno?: (alumno: Alumno) => void;
}

const ESTADO_LABEL: Record<string, string> = {
  EN_PROGRESO: 'En progreso',
  LOGRADO: 'Logrado con honores',
  INICIADO: 'Iniciado',
  DIFICULTAD: 'Con dificultad / Requiere refuerzo',
};

const PRESET_MOTIVOS_BECA = [
  'Mérito artístico y rendimiento pedagógico excepcional',
  'Situación de vulnerabilidad socioeconómica familiar',
  'Monitor o tutor del instrumento / apoyo pedagógico en cátedra',
  'Familia numerosa con múltiples hermanos en la academia',
  'Convenio de patrocinio directo con donante institucional',
  'Exoneración extraordinaria por apoyo a eventos y ensambles institucionales',
];

export const AlumnoFichaModal: React.FC<AlumnoFichaModalProps> = ({
  alumno,
  onClose,
  onSelectOtroAlumno
}) => {
  const {
    cuotas,
    familias,
    activos: activosInstrumentos,
    contratosComodato,
    fichasLutheria,
    alumnos: todosAlumnos,
    becas,
    crearSolicitudBeca,
    aprobarBeca,
    crearCargoCuota,
    agregarCreditoWallet
  } = useFinance();

  const [resumen, setResumen] = useState<ResumenAcademico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarSelector, setMostrarSelector] = useState(false);

  // Estados para gestión de beca
  const [mostrarFormBeca, setMostrarFormBeca] = useState(false);
  const [porcentajeBeca, setPorcentajeBeca] = useState<number>(100);
  const [motivoCategoriaBeca, setMotivoCategoriaBeca] = useState<string>(PRESET_MOTIVOS_BECA[0]);
  const [motivoDetalleBeca, setMotivoDetalleBeca] = useState<string>('');
  const [autoAprobarBeca, setAutoAprobarBeca] = useState<boolean>(true);
  const [isSubmittingBeca, setIsSubmittingBeca] = useState<boolean>(false);
  const [becaFeedback, setBecaFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Estados para Cargo Extraordinario (reposición, cuerdas, accesorios)
  const [mostrarFormCargo, setMostrarFormCargo] = useState(false);
  const [conceptoCargo, setConceptoCargo] = useState('Reposición de Cuerda (Violín)');
  const [montoCargoDop, setMontoCargoDop] = useState('350');
  const [notaCargo, setNotaCargo] = useState('');
  const [isSubmittingCargo, setIsSubmittingCargo] = useState(false);
  const [cargoFeedback, setCargoFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Estados para Abono de Crédito a Favor (fotocopias, donación, saldo a favor)
  const [mostrarFormCredito, setMostrarFormCredito] = useState(false);
  const [montoCreditoDop, setMontoCreditoDop] = useState('150');
  const [descripcionCredito, setDescripcionCredito] = useState('Abono por saldo de fotocopias / material');
  const [isSubmittingCredito, setIsSubmittingCredito] = useState(false);
  const [creditoFeedback, setCreditoFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);
    fetchResumenAcademico(alumno.id)
      .then(r => {
        if (!cancelado) setResumen(r);
      })
      .catch(err => {
        if (!cancelado) setError(err?.message || 'No se pudo cargar asistencia y progreso.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [alumno.id]);

  // Finanzas, Familia y Beca
  const familia = familias.find(f => f.id === alumno.familia_id);
  const cuotasAlumno = cuotas.filter(c => c.alumno_id === alumno.id);
  const solvencia = computeResumenSolvencia(cuotasAlumno);
  const pctAsistencia = resumen ? computePctAsistencia(resumen) : null;

  // Beca activa o más reciente del alumno
  const becasDelAlumno = becas.filter(b => b.alumno_id === alumno.id);
  const becaActiva = becasDelAlumno.find(b => b.activa || b.estado === 'activo');
  const becaReciente = becaActiva || becasDelAlumno[0] || null;

  const handleGuardarBeca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (porcentajeBeca <= 0 || porcentajeBeca > 100) {
      setBecaFeedback({ tipo: 'error', mensaje: 'El porcentaje de beca debe estar entre 1% y 100%.' });
      return;
    }

    setIsSubmittingBeca(true);
    setBecaFeedback(null);

    const motivoCompleto = motivoDetalleBeca.trim()
      ? `${motivoCategoriaBeca}. Justificación: ${motivoDetalleBeca.trim()}`
      : motivoCategoriaBeca;

    const res = await crearSolicitudBeca({
      alumno_id: alumno.id,
      porcentaje: porcentajeBeca,
      motivo_socioeconomico: motivoCompleto,
      autoAprobar: autoAprobarBeca,
    });

    setIsSubmittingBeca(false);
    if (res.success) {
      setBecaFeedback({
        tipo: 'success',
        mensaje: `✓ Beca del ${porcentajeBeca}% ${autoAprobarBeca ? 'asignada y aprobada' : 'solicitada'} exitosamente.`
      });
      setMostrarFormBeca(false);
      setMotivoDetalleBeca('');
      setTimeout(() => setBecaFeedback(null), 5000);
    } else {
      setBecaFeedback({ tipo: 'error', mensaje: res.error || 'Error al procesar la beca.' });
    }
  };

  const handleRevocarBeca = async (becaId: string) => {
    if (!window.confirm('¿Está seguro de que desea revocar la beca activa de este alumno?')) return;
    await aprobarBeca(becaId, false);
    setBecaFeedback({ tipo: 'success', mensaje: '✓ Beca revocada exitosamente.' });
    setTimeout(() => setBecaFeedback(null), 5000);
  };

  const handleCrearCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(montoCargoDop);
    if (isNaN(montoNum) || montoNum <= 0) {
      setCargoFeedback({ tipo: 'error', mensaje: 'Indique un monto válido mayor a RD$ 0.00.' });
      return;
    }
    if (!conceptoCargo.trim()) {
      setCargoFeedback({ tipo: 'error', mensaje: 'El concepto del cargo es obligatorio.' });
      return;
    }

    setIsSubmittingCargo(true);
    setCargoFeedback(null);

    const res = await crearCargoCuota({
      alumno_id: alumno.id,
      concepto: conceptoCargo.trim(),
      monto_centavos: Math.round(montoNum * 100),
      observaciones: notaCargo.trim() || undefined,
    });

    setIsSubmittingCargo(false);
    if (res.success) {
      setCargoFeedback({
        tipo: 'success',
        mensaje: `✓ Cargo de ${formatDOP(Math.round(montoNum * 100))} agregado a la cuenta del alumno.`
      });
      setMostrarFormCargo(false);
      setNotaCargo('');
      setTimeout(() => setCargoFeedback(null), 5000);
    } else {
      setCargoFeedback({ tipo: 'error', mensaje: res.error || 'Error al registrar el cargo.' });
    }
  };

  const handleAgregarCredito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumno.familia_id) {
      setCreditoFeedback({ tipo: 'error', mensaje: 'El alumno no tiene una familia asignada.' });
      return;
    }
    const montoNum = parseFloat(montoCreditoDop);
    if (isNaN(montoNum) || montoNum <= 0) {
      setCreditoFeedback({ tipo: 'error', mensaje: 'Indique un monto de crédito válido mayor a RD$ 0.00.' });
      return;
    }
    if (!descripcionCredito.trim()) {
      setCreditoFeedback({ tipo: 'error', mensaje: 'La descripción del abono es obligatoria.' });
      return;
    }

    setIsSubmittingCredito(true);
    setCreditoFeedback(null);

    const res = await agregarCreditoWallet({
      familia_id: alumno.familia_id,
      monto_centavos: Math.round(montoNum * 100),
      descripcion: descripcionCredito.trim(),
      origen: 'ajuste',
    });

    setIsSubmittingCredito(false);
    if (res.success) {
      setCreditoFeedback({
        tipo: 'success',
        mensaje: `✓ Crédito de ${formatDOP(Math.round(montoNum * 100))} acreditado a la cuenta del Padre / Tutor.`
      });
      setMostrarFormCredito(false);
      setTimeout(() => setCreditoFeedback(null), 5000);
    } else {
      setCreditoFeedback({ tipo: 'error', mensaje: res.error || 'Error al acreditar a la cuenta del tutor.' });
    }
  };

  // Luthería y Comodato
  const comodato = contratosComodato.find(c => c.alumno_id === alumno.id || c.nombre_estudiante.toLowerCase().includes(alumno.nombre_completo.toLowerCase()));
  const activo = comodato
    ? activosInstrumentos.find(a => a.id === comodato.id || a.codigo_inventario === comodato.codigo_patrimonial)
    : activosInstrumentos.find(a => a.alumno_asignado_nombre?.toLowerCase().includes(alumno.nombre_completo.toLowerCase()));
  const fichaReparacion = fichasLutheria.find(f => f.alumno_asociado_nombre?.toLowerCase().includes(alumno.nombre_completo.toLowerCase()));

  // Lista para buscador rápido
  const alumnosFiltrados = todosAlumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.instrumento_principal.toLowerCase().includes(busqueda.toLowerCase())
  );

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 rounded-[2.5rem] max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-800 space-y-6 max-h-[92vh] overflow-y-auto my-auto">

        {/* Encabezado con selector rápido de demo */}
        <div className="border-b border-zinc-800 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Ficha 360° Ejecutiva
                </span>
                {becaActiva ? (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-500/30 flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Becado ({becaActiva.porcentaje}%)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-400 text-[10px] font-medium rounded-full border border-zinc-700/50 flex items-center gap-1">
                    <span>Sin beca</span>
                  </span>
                )}
                <span className="text-[10px] font-mono text-zinc-400">ID: {alumno.id.slice(0, 8)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">{alumno.nombre_completo}</h2>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-indigo-300">{alumno.instrumento_principal}</span>
                <span>·</span>
                <span>{alumno.nivel}</span>
                <span>·</span>
                <span>Padre / Tutor: <strong className="text-zinc-200">{familia?.representante_principal?.nombre_completo || familia?.apellidos || 'Sin tutor asignado'}</strong> ({familia?.codigo_familia || 'TUT-N/D'})</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarSelector(!mostrarSelector)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Cambiar Alumno</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Acceso Rápido Demo:</span>
            {todosAlumnos.slice(0, 4).map(a => {
              const esActivo = a.id === alumno.id;
              return (
                <button
                  key={a.id}
                  onClick={() => onSelectOtroAlumno && onSelectOtroAlumno(a)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    esActivo
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950/60 ring-1 ring-indigo-400'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {a.nombre_completo.split(' ')[0]} ({a.instrumento_principal})
                </button>
              );
            })}
          </div>

          {/* Selector expandible de alumnos */}
          {mostrarSelector && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 mt-2 animate-in fade-in duration-150">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar alumno por nombre o cátedra..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {alumnosFiltrados.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onSelectOtroAlumno && onSelectOtroAlumno(a);
                      setMostrarSelector(false);
                    }}
                    className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl border border-zinc-800/80 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{a.nombre_completo}</div>
                      <div className="text-[10px] text-zinc-400">{a.instrumento_principal} · {a.nivel}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400">Ver ➔</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-zinc-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Cargando agregados de asistencia, luthería y progresos...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-5">
            {/* Grid 4 Cuadrantes Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Cuadrante 1: Asistencia & Regularidad */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400">
                    <CalendarCheck className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">1. Asistencia & Regularidad</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full">PWA Ponches</span>
                </div>

                {(!resumen || resumen.totalSesiones === 0) ? (
                  <div className="flex items-start gap-2 text-zinc-400 text-xs pt-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Sin ponches registrados en el aula todavía.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-mono font-bold text-white">
                        {pctAsistencia === null ? '—' : `${pctAsistencia}%`}
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                        (pctAsistencia ?? 0) >= 85
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {(pctAsistencia ?? 0) >= 85 ? 'Presentismo Óptimo' : 'Alerta de Ausentismo'}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (pctAsistencia ?? 0) >= 85 ? 'bg-sky-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.min(pctAsistencia ?? 0, 100)}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
                      <div className="flex justify-between">
                        <span>Presentes: <strong className="text-zinc-200">{resumen.presentes}</strong></span>
                        <span>Ausentes: <strong className="text-rose-400">{resumen.ausentes}</strong></span>
                        <span>Justificados: <strong className="text-zinc-200">{resumen.justificados}</strong></span>
                      </div>
                      <div className="text-zinc-400 text-[10px]">
                        Última sesión: {resumen.ultimaAsistencia || 'Sin fecha'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Cuadrante 2: Progreso Musical & Audiciones */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Music4 className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">2. Progreso Pedagógico & Audición</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full">ACM Suzuki</span>
                </div>

                {(!resumen || resumen.totalEvaluaciones === 0) ? (
                  <div className="flex items-start gap-2 text-zinc-400 text-xs pt-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Sin evaluaciones cualitativas cargadas aún.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-bold text-white">
                        {resumen.ultimoEstadoCualitativo ? (ESTADO_LABEL[resumen.ultimoEstadoCualitativo] || resumen.ultimoEstadoCualitativo) : 'Evaluado'}
                      </div>
                      {resumen.ultimaCalificacion !== null && (
                        <div className="text-2xl font-mono font-bold text-indigo-400">
                          {resumen.ultimaCalificacion} <span className="text-xs text-zinc-400 font-normal">/ 10</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 text-xs space-y-1">
                      <div className="text-zinc-300 font-medium">
                        {resumen.ultimoObjetivo || 'Audición semestral y postura técnica'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {resumen.totalEvaluaciones} evaluación(es) · Fecha: {resumen.ultimaFechaEvaluacion || '2026-08'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Cuadrante 3: Solvencia & Scoring Familiar */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Wallet className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">3. Solvencia & Historial de Pago</span>
                  </div>
                  {familia?.isp && (() => {
                    const etq = getISPEtiqueta(familia.isp?.categoria);
                    return (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${etq.badgeClass}`}
                        title={etq.descripcion}
                      >
                        {etq.titulo} ({familia.isp.valor} pts)
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className={`text-2xl font-mono font-bold ${solvencia.saldoPendienteCentavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {solvencia.saldoPendienteCentavos > 0 ? formatDOP(solvencia.saldoPendienteCentavos) : 'Solvente · Al Día'}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {solvencia.cuotasPagadas} de {solvencia.totalCuotas} cuotas
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
                  <div className="flex justify-between items-center">
                    <span>Estado Cartera: <strong className="text-zinc-200 capitalize">{familia?.estado_cartera || 'Normal'}</strong></span>
                    <div className="flex items-center gap-1.5">
                      <span>Crédito a Favor: <strong className="text-emerald-400">{formatDOP(familia?.credito_favor_centavos || 0)}</strong></span>
                      <button
                        type="button"
                        onClick={() => setMostrarFormCredito(!mostrarFormCredito)}
                        className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                        title="Abonar crédito a favor de la familia (fotocopias, donación, saldo positivo)"
                      >
                        <Coins className="w-3 h-3" />
                        <span>{mostrarFormCredito ? 'Cerrar' : '+ Abonar'}</span>
                      </button>
                    </div>
                  </div>
                  {familia?.isp?.ventana_pago_sugerida && (
                    <div className="text-zinc-400 text-[10px]">
                      Patrón de pago: Días {familia.isp.ventana_pago_sugerida.inicio_dia} al {familia.isp.ventana_pago_sugerida.fin_dia} del mes ({familia.isp.ventana_pago_sugerida.patron})
                    </div>
                  )}
                </div>

                {/* Feedback Crédito Wallet */}
                {creditoFeedback && (
                  <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    creditoFeedback.tipo === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {creditoFeedback.tipo === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{creditoFeedback.mensaje}</span>
                  </div>
                )}

                {/* Formulario Inline para Abonar Crédito a Favor */}
                {mostrarFormCredito && (
                  <form onSubmit={handleAgregarCredito} className="p-3.5 bg-zinc-900/95 rounded-2xl border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Abonar Saldo a Favor · Tutor: {familia?.representante_principal?.nombre_completo || familia?.apellidos || alumno.nombre_completo.split(' ')[0]}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">Saldo a Favor</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-300 font-medium block">
                          Monto a Favor (RD$): <span className="text-emerald-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-zinc-500 font-mono text-xs">RD$</span>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            required
                            value={montoCreditoDop}
                            onChange={e => setMontoCreditoDop(e.target.value)}
                            className="w-full pl-10 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
                            placeholder="150"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-300 font-medium block">
                          Concepto o Motivo: <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={descripcionCredito}
                          onChange={e => setDescripcionCredito(e.target.value)}
                          placeholder="Ej: Saldo de fotocopias / reintegro"
                          className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Saldo resultante: <strong className="text-emerald-300">{formatDOP((familia?.credito_favor_centavos || 0) + (parseFloat(montoCreditoDop) || 0) * 100)}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMostrarFormCredito(false)}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingCredito}
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                        >
                          {isSubmittingCredito ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Acreditando...</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Acreditar Saldo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Subsección: Beneficio de Beca y Justificación */}
                <div className="pt-3 mt-2 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Award className="w-3.5 h-3.5" />
                      <span>Beca & Beneficio Social</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {becaActiva && (
                        <button
                          type="button"
                          onClick={() => handleRevocarBeca(becaActiva.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-mono transition-colors cursor-pointer"
                        >
                          Revocar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarFormBeca(!mostrarFormBeca);
                          if (!mostrarFormBeca && becaActiva) {
                            setPorcentajeBeca(becaActiva.porcentaje);
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {mostrarFormBeca ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Cerrar</span>
                          </>
                        ) : (
                          <>
                            {becaActiva ? <Award className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            <span>{becaActiva ? 'Modificar Beca' : 'Becar Alumno'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Feedback toast inline */}
                  {becaFeedback && (
                    <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      becaFeedback.tipo === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {becaFeedback.tipo === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{becaFeedback.mensaje}</span>
                    </div>
                  )}

                  {/* Detalle de Beca Activa o Reciente */}
                  {!mostrarFormBeca && (
                    <div>
                      {becaReciente ? (
                        <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800/90 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <span>Exoneración: <strong>{becaReciente.porcentaje}%</strong></span>
                              <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold uppercase border ${
                                becaReciente.activa
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}>
                                {becaReciente.activa ? 'Activa' : 'Inactiva'}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Desde: {becaReciente.fecha_inicio}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-300">
                            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-mono">Nota / Justificación:</span>
                            <p className="mt-0.5 text-zinc-200 italic bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/60 leading-relaxed">
                              "{becaReciente.motivo || becaReciente.motivo_socioeconomico || 'Sin nota de justificación'}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 text-[11px] text-zinc-400 flex items-center justify-between">
                          <span>Alumno sin beca asignada en el ciclo actual.</span>
                          <span className="text-zinc-400 font-mono text-[10px]">100% arancel regular</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulario Inline para Becar / Asignar Justificación */}
                  {mostrarFormBeca && (
                    <form onSubmit={handleGuardarBeca} className="p-3.5 bg-zinc-900/95 rounded-2xl border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          <span>Configurar Beca para {alumno.nombre_completo.split(' ')[0]}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {autoAprobarBeca ? 'Aprobación Inmediata' : 'Pendiente de Aprobación'}
                        </span>
                      </div>

                      {/* Selector de Porcentaje */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-zinc-300 font-medium">Porcentaje de Exoneración:</label>
                          <span className="font-mono font-bold text-amber-400 text-sm">{porcentajeBeca}%</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[25, 50, 75, 100].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setPorcentajeBeca(pct)}
                              className={`flex-1 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                                porcentajeBeca === pct
                                  ? 'bg-amber-500 text-black shadow-md shadow-amber-950/40'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>

                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={porcentajeBeca}
                          onChange={e => setPorcentajeBeca(Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-1"
                        />
                      </div>

                      {/* Categoría Predefinida */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-300 font-medium block">
                          Criterio / Categoría de Beca:
                        </label>
                        <select
                          value={motivoCategoriaBeca}
                          onChange={e => setMotivoCategoriaBeca(e.target.value)}
                          className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {PRESET_MOTIVOS_BECA.map((motivo, idx) => (
                            <option key={idx} value={motivo} className="bg-zinc-900 text-zinc-200">
                              {motivo}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Justificación / Nota detallada */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-300 font-medium block">
                          Nota o Justificación Explicativa: <span className="text-amber-400">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={motivoDetalleBeca}
                          onChange={e => setMotivoDetalleBeca(e.target.value)}
                          placeholder="Explique detalladamente por qué el alumno califica para esta beca (condición socioeconómica, logros, respaldo familiar)..."
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Opción Auto-aprobar */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                          <input
                            type="checkbox"
                            checked={autoAprobarBeca}
                            onChange={e => setAutoAprobarBeca(e.target.checked)}
                            className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-amber-500/20"
                          />
                          <span>Aprobar y activar inmediatamente</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMostrarFormBeca(false)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingBeca || !motivoDetalleBeca.trim()}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                          >
                            {isSubmittingBeca ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Guardando...</span>
                              </>
                            ) : (
                              <>
                                <Award className="w-3.5 h-3.5" />
                                <span>Guardar Beca</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Cuadrante 4: Instrumento en Comodato & Luthería */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Guitar className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">4. Instrumento & Salud Luthería</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                    activo?.estado_uso === 'en_reparacion'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {activo?.estado_uso === 'en_reparacion' ? 'En Taller LUT' : (comodato ? 'Comodato Activo' : 'Sin Comodato')}
                  </span>
                </div>

                {activo ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <div className="text-base font-bold text-white">
                        {activo.marca || 'Instrumento'} {activo.modelo || activo.tipo_instrumento}
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {activo.codigo_inventario}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 text-xs space-y-1">
                      <div className="flex justify-between text-zinc-300 font-mono text-[11px]">
                        <span>Serie: <strong>{activo.numero_serie || 'N/D'}</strong></span>
                        <span>Conservación: <strong className="capitalize text-emerald-400">{activo.estado_conservacion}</strong></span>
                      </div>
                      {fichaReparacion ? (
                        <div className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-1 border-t border-zinc-800">
                          <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span>Taller: {fichaReparacion.reporte_usuario || 'Mantenimiento registrado'}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-400 font-mono pt-0.5">
                          Entrega de comodato: {comodato?.fecha_inicio || '2026-01-15'} · Estado verificado
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-zinc-400 text-xs pt-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>No tiene instrumento institucional asignado en inventario.</span>
                  </div>
                )}

                {/* Subsección: Cargo Extraordinario / Reposición de Cuerda / Accesorios */}
                <div className="pt-3 mt-2 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Cargos de Taller & Accesorios</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMostrarFormCargo(!mostrarFormCargo)}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                      title="Agregar cargo extraordinario a la cuenta del alumno (cuerda rota, puente, método, etc.)"
                    >
                      {mostrarFormCargo ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>Cerrar</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>+ Cargo (Cuerda / Daño)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feedback Cargo Cuota */}
                  {cargoFeedback && (
                    <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      cargoFeedback.tipo === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {cargoFeedback.tipo === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{cargoFeedback.mensaje}</span>
                    </div>
                  )}

                  {/* Formulario Inline para Crear Cargo Extraordinario */}
                  {mostrarFormCargo && (
                    <form onSubmit={handleCrearCargo} className="p-3.5 bg-zinc-900/95 rounded-2xl border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Emitir Cargo Extraordinario a {alumno.nombre_completo.split(' ')[0]}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">Cuota Pendiente</span>
                      </div>

                      {/* Botones de plantilla rápida */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 font-bold block">
                          Plantillas Rápidas:
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { concepto: 'Reposición de Cuerda (Violín)', monto: '350' },
                            { concepto: 'Ajuste de Clavijas y Puente', monto: '500' },
                            { concepto: 'Reposición de Cerda / Encordado Arco', monto: '650' },
                            { concepto: 'Método Suzuki Vol. 1 (Físico)', monto: '400' },
                          ].map(p => (
                            <button
                              key={p.concepto}
                              type="button"
                              onClick={() => {
                                setConceptoCargo(p.concepto);
                                setMontoCargoDop(p.monto);
                              }}
                              className="px-2 py-0.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] text-zinc-300 font-mono transition-colors cursor-pointer"
                            >
                              {p.concepto.split(' ')[0]} {p.concepto.split(' ')[1]} (${p.monto})
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-300 font-medium block">
                            Concepto del Cargo: <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={conceptoCargo}
                            onChange={e => setConceptoCargo(e.target.value)}
                            placeholder="Ej: Reposición de cuerda Mi"
                            className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-300 font-medium block">
                            Monto a Cobrar (RD$): <span className="text-amber-400">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-zinc-500 font-mono text-xs">RD$</span>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              required
                              value={montoCargoDop}
                              onChange={e => setMontoCargoDop(e.target.value)}
                              className="w-full pl-10 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500 font-bold"
                              placeholder="350"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-300 font-medium block">
                          Observación / Diagnóstico del Taller:
                        </label>
                        <input
                          type="text"
                          value={notaCargo}
                          onChange={e => setNotaCargo(e.target.value)}
                          placeholder="Ej: Rotura accidental de cuerda Mi durante ensayo general..."
                          className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Total a emitir: <strong className="text-amber-300">{formatDOP((parseFloat(montoCargoDop) || 0) * 100)}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMostrarFormCargo(false)}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingCargo}
                            className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                          >
                            {isSubmittingCargo ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Emitiendo...</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Emitir Cargo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Ficha Inferior: Identidad, Contacto & Legal */}
            <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold font-mono uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>5. Expediente de Identidad, Contacto & Representante Legal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{alumno.tiene_pasaporte ? 'Pasaporte Vigente' : 'Acta de Nacimiento'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-mono">Representante Principal</span>
                  <strong className="text-white text-sm block mt-0.5">
                    {familia?.representante_principal?.nombre_completo || alumno.representante_nombre || 'Carmen Morales'}
                  </strong>
                  <span className="text-zinc-400 font-mono text-[11px] block mt-0.5">
                    Cédula: {familia?.representante_principal?.cedula || alumno.representante_cedula || '001-1234567-8'}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-mono">Canales de Contacto</span>
                  <div className="flex items-center gap-1.5 text-zinc-200 mt-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{familia?.telefono_principal || alumno.representante_tlf || '+1 (809) 555-0101'}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] font-mono mt-0.5 truncate">
                    {familia?.email_principal || alumno.correo_representante || 'contacto@familia.do'}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-mono">Residencia & Emergencia</span>
                  <div className="flex items-start gap-1.5 text-zinc-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] line-clamp-2">{alumno.direccion || familia?.representante_principal?.direccion || 'Av. Principal #12, Punta Cana Village'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
            Sistema Operativo Institucional (SOI) · Visión 360 Unificada
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer ml-auto"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
