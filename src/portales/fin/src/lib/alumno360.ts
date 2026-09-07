// Ficha 360° del Alumno: asistencia + progreso musical (vía RPC de solo
// agregados fn_alumno_ficha_360) + solvencia (derivada de las cuotas que
// FinanceContext ya trae). Cada pilar distingue "sin datos registrados"
// de un valor real en 0 — nunca se muestra un 0% que parezca dato real
// cuando en realidad nunca se marcó nada.

import { supabaseRpc } from '../infrastructure/supabase/SupabaseRestClient';
import { Cuota } from '../types';
import { INITIAL_CONTRATOS_COMODATO, INITIAL_ACTIVOS } from '../data/initialData';

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

// ── Instrumentos en comodato ────────────────────────────────────────────────
// Los instrumentos asignados al alumno viven en `comodatos_activos` +
// `inventario_activos` (los gestiona el módulo LUT / inventario). El RPC
// `fn_alumno_instrumentos_comodato` devuelve una fila por comodato activo, con
// los datos del instrumento y el estado de reparación abierta si la hay.

export interface InstrumentoComodatoRow {
  comodato_id: string;
  tipo_comodato: string | null;
  fecha_entrega: string | null;
  fecha_vencimiento: string | null;
  comodato_estado: string;
  contrato_firmado_url: string | null;
  activo_id: string;
  codigo_inventario: string;
  tipo_instrumento: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  estado_conservacion: string | null;
  estado_uso: string | null;
  ubicacion: string | null;
  en_reparacion: boolean;
  reparacion_estado: string | null;
  reparacion_descripcion: string | null;
  reparacion_fecha_ingreso: string | null;
}

export interface InstrumentoComodato {
  comodatoId: string;
  tipoComodato: string | null;
  fechaEntrega: string | null;
  fechaVencimiento: string | null;
  comodatoEstado: string;
  contratoFirmadoUrl: string | null;
  activoId: string;
  codigoInventario: string;
  tipoInstrumento: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  estadoConservacion: string | null;
  estadoUso: string | null;
  ubicacion: string | null;
  enReparacion: boolean;
  reparacionEstado: string | null;
  reparacionDescripcion: string | null;
  reparacionFechaIngreso: string | null;
}

export function mapInstrumentoComodato(row: InstrumentoComodatoRow): InstrumentoComodato {
  return {
    comodatoId: row.comodato_id,
    tipoComodato: row.tipo_comodato ?? null,
    fechaEntrega: row.fecha_entrega ?? null,
    fechaVencimiento: row.fecha_vencimiento ?? null,
    comodatoEstado: row.comodato_estado,
    contratoFirmadoUrl: row.contrato_firmado_url ?? null,
    activoId: row.activo_id,
    codigoInventario: row.codigo_inventario,
    tipoInstrumento: row.tipo_instrumento,
    marca: row.marca ?? null,
    modelo: row.modelo ?? null,
    numeroSerie: row.numero_serie ?? null,
    estadoConservacion: row.estado_conservacion ?? null,
    estadoUso: row.estado_uso ?? null,
    ubicacion: row.ubicacion ?? null,
    enReparacion: row.en_reparacion === true,
    reparacionEstado: row.reparacion_estado ?? null,
    reparacionDescripcion: row.reparacion_descripcion ?? null,
    reparacionFechaIngreso: row.reparacion_fecha_ingreso ?? null,
  };
}

export interface ResumenInstrumentos {
  total: number;
  algunoEnReparacion: boolean;
  proximoVencimiento: string | null;
}

export function computeResumenInstrumentos(items: InstrumentoComodato[]): ResumenInstrumentos {
  const vencimientos = items
    .map(i => i.fechaVencimiento)
    .filter((f): f is string => !!f)
    .sort();
  return {
    total: items.length,
    algunoEnReparacion: items.some(i => i.enReparacion),
    proximoVencimiento: vencimientos[0] ?? null,
  };
}

export function separarInstrumentosComodato(items: InstrumentoComodato[]): {
  activos: InstrumentoComodato[];
  historial: InstrumentoComodato[];
} {
  const activos = items.filter(i => i.comodatoEstado.toLowerCase() === 'activo' || i.comodatoEstado.toLowerCase() === 'vigente');
  const historial = items.filter(i => i.comodatoEstado.toLowerCase() !== 'activo' && i.comodatoEstado.toLowerCase() !== 'vigente');
  return { activos, historial };
}

export async function fetchInstrumentosComodato(alumnoId: string): Promise<InstrumentoComodato[]> {
  let rpcRows: InstrumentoComodatoRow[] | null = null;
  try {
    rpcRows = await supabaseRpc<InstrumentoComodatoRow[]>('fn_alumno_instrumentos_comodato', {
      p_alumno_id: alumnoId,
    });
  } catch (err) {
    console.warn('[fetchInstrumentosComodato] RPC falló o no disponible, usando fallback local:', err);
  }

  if (Array.isArray(rpcRows) && rpcRows.length > 0) {
    return rpcRows.map(mapInstrumentoComodato);
  }

  // Fallback Mock-First: buscar contratos del alumno en INITIAL_CONTRATOS_COMODATO
  const contratos = INITIAL_CONTRATOS_COMODATO.filter(c => c.alumno_id === alumnoId);
  if (contratos.length > 0) {
    return contratos.map(c => {
      const activo = INITIAL_ACTIVOS.find(a => a.codigo_inventario === c.codigo_patrimonial);
      return {
        comodatoId: c.id,
        tipoComodato: 'Comodato Instrumental',
        fechaEntrega: c.fecha_inicio,
        fechaVencimiento: c.fecha_termino,
        comodatoEstado: c.estado === 'vigente' ? 'activo' : c.estado,
        contratoFirmadoUrl: null,
        activoId: activo?.id ?? `act-${c.codigo_patrimonial}`,
        codigoInventario: c.codigo_patrimonial,
        tipoInstrumento: c.tipo_instrumento,
        marca: activo?.marca ?? (c.marca_modelo ? c.marca_modelo.split(' ')[0] : null),
        modelo: activo?.modelo ?? (c.marca_modelo ? c.marca_modelo.split(' ').slice(1).join(' ') : null),
        numeroSerie: c.numero_serie || activo?.numero_serie || null,
        estadoConservacion: activo?.estado_conservacion ?? 'bueno',
        estadoUso: activo?.estado_uso ?? (c.estado === 'vigente' ? 'en_comodato' : 'disponible'),
        ubicacion: 'Sede Bávaro / Res. Alumno',
        enReparacion: activo?.estado_uso === 'en_reparacion',
        reparacionEstado: null,
        reparacionDescripcion: null,
        reparacionFechaIngreso: null,
      };
    });
  }

  return [];
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
