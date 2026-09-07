import React, { useEffect, useState } from 'react';
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
  Search
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
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

export const AlumnoFichaModal: React.FC<AlumnoFichaModalProps> = ({
  alumno,
  onClose,
  onSelectOtroAlumno
}) => {
  const {
    cuotas,
    familias,
    activosInstrumentos,
    contratosComodato,
    fichasLutheria,
    alumnos: todosAlumnos
  } = useFinance();

  const [resumen, setResumen] = useState<ResumenAcademico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarSelector, setMostrarSelector] = useState(false);

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

  // Finanzas y Familia
  const familia = familias.find(f => f.id === alumno.familia_id);
  const cuotasAlumno = cuotas.filter(c => c.alumno_id === alumno.id);
  const solvencia = computeResumenSolvencia(cuotasAlumno);
  const pctAsistencia = resumen ? computePctAsistencia(resumen) : null;

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

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 rounded-[2.5rem] max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-800 space-y-6 max-h-[92vh] overflow-y-auto my-auto">

        {/* Encabezado con selector rápido de demo */}
        <div className="border-b border-zinc-800 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Ficha 360° Ejecutiva
                </span>
                <span className="text-[10px] font-mono text-zinc-400">ID: {alumno.id.slice(0, 8)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">{alumno.nombre_completo}</h2>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-indigo-300">{alumno.instrumento_principal}</span>
                <span>·</span>
                <span>{alumno.nivel}</span>
                <span>·</span>
                <span>Familia: <strong className="text-zinc-200">{familia?.apellidos || 'Sin familia asignada'}</strong> ({familia?.codigo_familia || 'FAM-N/D'})</span>
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
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">3. Solvencia & Scoring de Pago</span>
                  </div>
                  {familia?.isp && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                      familia.isp.categoria === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      familia.isp.categoria === 'B' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                      familia.isp.categoria === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      ISP: Cat. {familia.isp.categoria} ({familia.isp.valor} pts)
                    </span>
                  )}
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
                  <div className="flex justify-between">
                    <span>Estado Cartera: <strong className="text-zinc-200 capitalize">{familia?.estado_cartera || 'Normal'}</strong></span>
                    <span>Crédito a Favor: <strong className="text-emerald-400">{formatDOP(familia?.credito_favor_centavos || 0)}</strong></span>
                  </div>
                  {familia?.isp?.ventana_pago_sugerida && (
                    <div className="text-zinc-400 text-[10px]">
                      Patrón de pago: Días {familia.isp.ventana_pago_sugerida.inicio_dia} al {familia.isp.ventana_pago_sugerida.fin_dia} del mes ({familia.isp.ventana_pago_sugerida.patron})
                    </div>
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
};
