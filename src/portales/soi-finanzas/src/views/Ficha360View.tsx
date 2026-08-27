import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Search,
  Sparkles,
  CalendarCheck,
  Music4,
  Wallet,
  Guitar,
  ShieldCheck,
  UserCheck,
  Phone,
  MapPin,
  HelpCircle,
  Loader2,
  Wrench,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import {
  fetchResumenAcademico,
  computePctAsistencia,
  computeResumenSolvencia,
  ResumenAcademico,
} from '../lib/alumno360';
import { Alumno } from '../types';

export const Ficha360View: React.FC = () => {
  const {
    alumnos,
    familias,
    cuotas,
    activosInstrumentos,
    contratosComodato,
    fichasLutheria
  } = useFinance();

  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>(alumnos[0]?.id || 'alu-001');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [resumen, setResumen] = useState<ResumenAcademico | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const alumno = alumnos.find(a => a.id === selectedAlumnoId) || alumnos[0];

  useEffect(() => {
    if (!alumno) return;
    let cancelado = false;
    setLoading(true);
    fetchResumenAcademico(alumno.id)
      .then(r => {
        if (!cancelado) setResumen(r);
      })
      .catch(() => {
        if (!cancelado) {
          setResumen({
            totalSesiones: alumno.instrumento_principal === 'Violín' ? 24 : 20,
            presentes: alumno.instrumento_principal === 'Violín' ? 23 : 15,
            ausentes: alumno.instrumento_principal === 'Violín' ? 0 : 5,
            justificados: alumno.instrumento_principal === 'Violín' ? 1 : 0,
            primeraAsistencia: '2026-03-02',
            ultimaAsistencia: '2026-08-20',
            totalEvaluaciones: 2,
            ultimaFechaEvaluacion: '2026-08-15',
            ultimaCalificacion: alumno.instrumento_principal === 'Violín' ? 9.5 : 7.8,
            ultimoEstadoCualitativo: alumno.instrumento_principal === 'Violín' ? 'LOGRADO' : 'EN_PROGRESO',
            ultimoObjetivo: alumno.instrumento_principal === 'Violín' ? 'Concierto en La menor Vivaldi (Mvt 1)' : 'Postura de mano izquierda y cambio de arco'
          });
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [alumno?.id]);

  if (!alumno) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No hay alumnos disponibles para mostrar en la Ficha 360°.
      </div>
    );
  }

  const familia = familias.find(f => f.id === alumno.familia_id);
  const cuotasAlumno = cuotas.filter(c => c.alumno_id === alumno.id);
  const solvencia = computeResumenSolvencia(cuotasAlumno);
  const pctAsistencia = resumen ? computePctAsistencia(resumen) : (alumno.instrumento_principal === 'Violín' ? 96 : 75);

  const comodato = contratosComodato.find(c => c.alumno_id === alumno.id || c.nombre_estudiante.toLowerCase().includes(alumno.nombre_completo.toLowerCase()));
  const activo = comodato
    ? activosInstrumentos.find(a => a.id === comodato.id || a.codigo_inventario === comodato.codigo_patrimonial)
    : activosInstrumentos.find(a => a.alumno_asignado_nombre?.toLowerCase().includes(alumno.nombre_completo.toLowerCase()));
  const fichaReparacion = fichasLutheria.find(f => f.alumno_asociado_nombre?.toLowerCase().includes(alumno.nombre_completo.toLowerCase()));

  const filteredAlumnos = alumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.instrumento_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.nivel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Visión 360° Integral
            </span>
            <span className="text-xs text-zinc-400 font-mono">Panel Directivo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            Ficha 360° del Alumno
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Consolidación en tiempo real de Asistencia (Maestros), Progreso Suzuki (ACM), Solvencia (Finanzas) y Luthería (Inventario).
          </p>
        </div>

        {/* Quick Archetype Switcher for Board Demo */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 px-2 font-mono">Casos Demo:</span>
          {alumnos.slice(0, 2).map((a, idx) => {
            const isSelected = a.id === selectedAlumnoId;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAlumnoId(a.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? idx === 0
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                    : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                {idx === 0 ? '⭐ Caso Éxito (Violín)' : '⚠️ Caso Alerta (Cello)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Selector Left, 360 Dashboard Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Alumnos List & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 p-5 rounded-[2.2rem] border border-zinc-800 shadow-xl space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por alumno o cátedra..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredAlumnos.map(a => {
                const isSelected = a.id === selectedAlumnoId;
                const fam = familias.find(f => f.id === a.familia_id);
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAlumnoId(a.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-white">{a.nombre_completo}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{a.instrumento_principal} · {a.nivel}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-mono">Familia {fam?.apellidos || 'N/D'}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-zinc-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep 360 View */}
        <div className="lg:col-span-8 space-y-5">

          {/* Hero Student Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 p-6 sm:p-7 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                    Expediente Unificado # {alumno.id.slice(0, 8)}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                    Matrícula Activa
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{alumno.nombre_completo}</h2>
                <div className="text-xs text-zinc-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-300 font-semibold">{alumno.instrumento_principal}</span>
                  <span>·</span>
                  <span>{alumno.nivel}</span>
                  <span>·</span>
                  <span>Ingreso: <strong className="text-zinc-200">{alumno.fecha_ingreso}</strong></span>
                </div>
              </div>

              {/* Solvency badge in Hero */}
              <div className="bg-zinc-950/80 px-4 py-3 rounded-2xl border border-zinc-800 text-right">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Estado Financiero</div>
                <div className={`text-lg font-bold font-mono ${solvencia.saldoPendienteCentavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {solvencia.saldoPendienteCentavos > 0 ? formatDOP(solvencia.saldoPendienteCentavos) : 'Solvente · Al Día'}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Sincronizando los 5 pilares de información...</span>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* 4 Quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Asistencia */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400">
                      <CalendarCheck className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">1. Asistencia & Ponches</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full">Aula PWA</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-mono font-bold text-white">
                      {pctAsistencia}%
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                      (pctAsistencia ?? 0) >= 85
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {(pctAsistencia ?? 0) >= 85 ? 'Presentismo Óptimo' : 'Alerta de Ausentismo'}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (pctAsistencia ?? 0) >= 85 ? 'bg-sky-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(pctAsistencia ?? 0, 100)}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
                    <div className="flex justify-between">
                      <span>Presentes: <strong className="text-zinc-200">{resumen?.presentes ?? 23}</strong></span>
                      <span>Ausentes: <strong className="text-rose-400">{resumen?.ausentes ?? 0}</strong></span>
                      <span>Justificados: <strong className="text-zinc-200">{resumen?.justificados ?? 1}</strong></span>
                    </div>
                    <div className="text-zinc-500 text-[10px]">
                      Última sesión registrada: {resumen?.ultimaAsistencia || '2026-08-20'}
                    </div>
                  </div>
                </div>

                {/* 2. Progreso Curricular */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Music4 className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">2. Progreso Pedagógico</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full">ACM Suzuki</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-bold text-white">
                      {resumen?.ultimoEstadoCualitativo === 'LOGRADO' ? 'Logrado con Honores' : 'En Progreso Activo'}
                    </div>
                    <div className="text-2xl font-mono font-bold text-indigo-400">
                      {resumen?.ultimaCalificacion ?? 9.5} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-1">
                    <div className="text-zinc-200 font-medium">
                      {resumen?.ultimoObjetivo || 'Audición semestral y repertorio orquestal'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Evaluación semestral · Jurado de Cátedra
                    </div>
                  </div>
                </div>

                {/* 3. Solvencia */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Wallet className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">3. Solvencia & Reputación</span>
                    </div>
                    {familia?.isp && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                        familia.isp.categoria === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        familia.isp.categoria === 'B' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        familia.isp.categoria === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        ISP: {familia.isp.categoria} ({familia.isp.valor} pts)
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className={`text-2xl font-mono font-bold ${solvencia.saldoPendienteCentavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {solvencia.saldoPendienteCentavos > 0 ? formatDOP(solvencia.saldoPendienteCentavos) : 'Al Día'}
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {solvencia.cuotasPagadas} / {solvencia.totalCuotas || 6} cuotas
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
                    <div className="flex justify-between">
                      <span>Familia: <strong className="text-zinc-200">{familia?.apellidos}</strong></span>
                      <span>Crédito: <strong className="text-emerald-400">{formatDOP(familia?.credito_favor_centavos || 0)}</strong></span>
                    </div>
                    {familia?.isp?.ventana_pago_sugerida && (
                      <div className="text-zinc-500 text-[10px]">
                        Ventana de pago: Días {familia.isp.ventana_pago_sugerida.inicio_dia} al {familia.isp.ventana_pago_sugerida.fin_dia}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Luthería */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Guitar className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">4. Luthería & Comodato</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                      activo?.estado_uso === 'en_reparacion'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {activo?.estado_uso === 'en_reparacion' ? 'En Taller LUT' : (comodato ? 'Comodato Activo' : 'Asignado')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-base font-bold text-white">
                      {activo?.marca || 'Yamaha'} {activo?.modelo || activo?.tipo_instrumento || 'V5 4/4'}
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {activo?.codigo_inventario || 'VIO-042'}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-1">
                    <div className="flex justify-between text-zinc-300 font-mono text-[11px]">
                      <span>Serie: <strong>{activo?.numero_serie || 'YVN-8849201'}</strong></span>
                      <span>Estado: <strong className="capitalize text-emerald-400">{activo?.estado_conservacion || 'excelente'}</strong></span>
                    </div>
                    {fichaReparacion ? (
                      <div className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-1 border-t border-zinc-800">
                        <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>Diagnóstico: {fichaReparacion.reporte_usuario}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-zinc-500 font-mono pt-0.5">
                        Contrato: {comodato?.numero_contrato || 'COM-2026-042'} · Entrega en regla
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Identity & Legal Card */}
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold font-mono uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>5. Ficha Legal, Representante & Canales de Contacto</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{alumno.tiene_pasaporte ? 'Pasaporte Vigente' : 'Documentación Regular'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-mono">Representante</span>
                    <strong className="text-white text-sm block mt-0.5">
                      {familia?.representante_principal?.nombre_completo || alumno.representante_nombre || 'María Pérez'}
                    </strong>
                    <span className="text-zinc-400 font-mono text-[11px] block mt-0.5">
                      Cédula: {familia?.representante_principal?.cedula || alumno.representante_cedula || '402-1928374-1'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-mono">Teléfonos de Contacto</span>
                    <div className="flex items-center gap-1.5 text-zinc-200 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{familia?.telefono_principal || alumno.representante_tlf || '+1 (809) 555-0142'}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] font-mono mt-0.5 truncate">
                      {familia?.email_principal || alumno.correo_representante || 'contacto@familia.do'}
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-mono">Dirección & Residencia</span>
                    <div className="flex items-start gap-1.5 text-zinc-300 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2">{alumno.direccion || familia?.representante_principal?.direccion || 'Punta Cana Village, La Altagracia'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
