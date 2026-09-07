// Ficha 360° del Alumno: asistencia + progreso musical (vía RPC de solo
// agregados fn_alumno_ficha_360) + solvencia (derivada de las cuotas que
// FinanceContext ya trae). Cada pilar distingue "sin datos registrados"
// de un valor real en 0 — nunca se muestra un 0% que parezca dato real
// cuando en realidad nunca se marcó nada.

import { supabaseRpc } from '../infrastructure/supabase/SupabaseRestClient';
import { Cuota } from '../types';

export interface ResumenAcademico {
  totalSesiones: number;
  presentes: number;
  ausentes: number;
  justificados: number;
  primeraAsistencia: string | null;
  ultimaAsistencia: string | null;
  totalEvaluaciones: number;
  ultimaFechaEvaluacion: string | null;
  ultimaCalificacion: number | null;
  ultimoEstadoCualitativo: string | null;
  ultimoObjetivo: string | null;
}

interface FichaRow {
  total_sesiones: number;
  presentes: number;
  ausentes: number;
  justificados: number;
  primera_asistencia: string | null;
  ultima_asistencia: string | null;
  total_evaluaciones: number;
  ultima_fecha_evaluacion: string | null;
  ultima_calificacion: number | string | null;
  ultimo_estado_cualitativo: string | null;
  ultimo_objetivo: string | null;
}

export async function fetchResumenAcademico(alumnoId: string): Promise<ResumenAcademico> {
  const rows = await supabaseRpc<FichaRow[]>('fn_alumno_ficha_360', { p_alumno_id: alumnoId });
  const row = rows?.[0];

  if (!row) {
    return {
      totalSesiones: 0,
      presentes: 0,
      ausentes: 0,
      justificados: 0,
      primeraAsistencia: null,
      ultimaAsistencia: null,
      totalEvaluaciones: 0,
      ultimaFechaEvaluacion: null,
      ultimaCalificacion: null,
      ultimoEstadoCualitativo: null,
      ultimoObjetivo: null,
    };
  }

  return {
    totalSesiones: row.total_sesiones ?? 0,
    presentes: row.presentes ?? 0,
    ausentes: row.ausentes ?? 0,
    justificados: row.justificados ?? 0,
    primeraAsistencia: row.primera_asistencia,
    ultimaAsistencia: row.ultima_asistencia,
    totalEvaluaciones: row.total_evaluaciones ?? 0,
    ultimaFechaEvaluacion: row.ultima_fecha_evaluacion,
    ultimaCalificacion: row.ultima_calificacion === null ? null : Number(row.ultima_calificacion),
    ultimoEstadoCualitativo: row.ultimo_estado_cualitativo,
    ultimoObjetivo: row.ultimo_objetivo,
  };
}

/** % de asistencia sobre sesiones con estado definitivo (presente+ausente). `justificado` no cuenta ni a favor ni en contra. Null si no hay ninguna sesión registrada. */
export function computePctAsistencia(resumen: ResumenAcademico): number | null {
  const base = resumen.presentes + resumen.ausentes;
  if (base === 0) return null;
  return Math.round((resumen.presentes / base) * 100);
}

export interface ResumenSolvencia {
  totalCuotas: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  saldoPendienteCentavos: number;
  proximaFechaVencimiento: string | null;
  tieneCuotasVencidas: boolean;
}

/** Sin cuotas registradas para el alumno -> totalCuotas=0, distinto de "0 pendientes porque ya pagó todo". */
export function computeResumenSolvencia(cuotas: Cuota[]): ResumenSolvencia {
  if (cuotas.length === 0) {
    return {
      totalCuotas: 0,
      cuotasPagadas: 0,
      cuotasPendientes: 0,
      saldoPendienteCentavos: 0,
      proximaFechaVencimiento: null,
      tieneCuotasVencidas: false,
    };
  }

  const hoy = new Date();
  const pendientes = cuotas.filter(c => c.estado === 'pendiente' || c.estado === 'parcial');
  const pagadas = cuotas.filter(c => c.estado === 'pagada');
  const saldoPendienteCentavos = pendientes.reduce((acc, c) => acc + c.saldo_centavos, 0);
  const tieneCuotasVencidas = pendientes.some(c => new Date(c.fecha_vencimiento) < hoy);
  const proximaFechaVencimiento = pendientes
    .map(c => c.fecha_vencimiento)
    .sort()
    .find(fecha => new Date(fecha) >= hoy) ?? pendientes.map(c => c.fecha_vencimiento).sort()[0] ?? null;

  return {
    totalCuotas: cuotas.length,
    cuotasPagadas: pagadas.length,
    cuotasPendientes: pendientes.length,
    saldoPendienteCentavos,
    proximaFechaVencimiento,
    tieneCuotasVencidas,
  };
}
