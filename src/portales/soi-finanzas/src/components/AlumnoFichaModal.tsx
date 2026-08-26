import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, CalendarCheck, Music4, Wallet, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
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
}

const ESTADO_LABEL: Record<string, string> = {
  EN_PROGRESO: 'En progreso',
  LOGRADO: 'Logrado',
  INICIADO: 'Iniciado',
  DIFICULTAD: 'Con dificultad',
};

export const AlumnoFichaModal: React.FC<AlumnoFichaModalProps> = ({ alumno, onClose }) => {
  const { cuotas } = useFinance();
  const [resumen, setResumen] = useState<ResumenAcademico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const cuotasAlumno = cuotas.filter(c => c.alumno_id === alumno.id);
  const solvencia = computeResumenSolvencia(cuotasAlumno);
  const pctAsistencia = resumen ? computePctAsistencia(resumen) : null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-800 space-y-5 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Ficha 360° del Alumno
            </span>
            <h2 className="text-lg font-semibold text-white mt-0.5">{alumno.nombre_completo}</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{alumno.instrumento_principal} · {alumno.nivel}</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-zinc-500 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Cargando asistencia y progreso...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && resumen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Pilar 1: Asistencia */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-400">
                <CalendarCheck className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Asistencia</span>
              </div>
              {resumen.totalSesiones === 0 ? (
                <div className="flex items-start gap-2 text-zinc-500 text-xs pt-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Sin datos suficientes — nunca se le ha marcado asistencia.</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-mono font-bold text-white">
                    {pctAsistencia === null ? '—' : `${pctAsistencia}%`}
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                    <div>{resumen.presentes} presentes · {resumen.ausentes} ausentes · {resumen.justificados} justificados</div>
                    <div className="text-zinc-500">Última: {resumen.ultimaAsistencia || '—'}</div>
                  </div>
                </>
              )}
            </div>

            {/* Pilar 2: Progreso Musical */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Music4 className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Progreso Musical</span>
              </div>
              {resumen.totalEvaluaciones === 0 ? (
                <div className="flex items-start gap-2 text-zinc-500 text-xs pt-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Sin datos suficientes — no tiene evaluaciones cualitativas registradas.</span>
                </div>
              ) : (
                <>
                  <div className="text-base font-semibold text-white">
                    {resumen.ultimoEstadoCualitativo ? (ESTADO_LABEL[resumen.ultimoEstadoCualitativo] || resumen.ultimoEstadoCualitativo) : '—'}
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-0.5">
                    {resumen.ultimoObjetivo && <div className="truncate">Objetivo: {resumen.ultimoObjetivo}</div>}
                    {resumen.ultimaCalificacion !== null && (
                      <div className="font-mono">Calificación: {resumen.ultimaCalificacion}</div>
                    )}
                    <div className="font-mono text-zinc-500">
                      {resumen.totalEvaluaciones} evaluación{resumen.totalEvaluaciones === 1 ? '' : 'es'} · Última: {resumen.ultimaFechaEvaluacion || '—'}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pilar 3: Solvencia */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Solvencia</span>
              </div>
              {solvencia.totalCuotas === 0 ? (
                <div className="flex items-start gap-2 text-zinc-500 text-xs pt-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Sin cuotas registradas todavía para este alumno.</span>
                </div>
              ) : (
                <>
                  <div className={`text-xl font-mono font-bold ${solvencia.saldoPendienteCentavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {solvencia.saldoPendienteCentavos > 0 ? formatDOP(solvencia.saldoPendienteCentavos) : 'Al día'}
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                    <div>{solvencia.cuotasPagadas} de {solvencia.totalCuotas} cuotas pagadas</div>
                    {solvencia.tieneCuotasVencidas && (
                      <div className="text-rose-400 font-semibold">Tiene cuotas vencidas</div>
                    )}
                    {solvencia.proximaFechaVencimiento && (
                      <div className="text-zinc-500">Próximo vencimiento: {solvencia.proximaFechaVencimiento}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
