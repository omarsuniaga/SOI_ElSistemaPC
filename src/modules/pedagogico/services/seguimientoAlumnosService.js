import { supabase } from '../../../lib/supabaseClient.js'

const DEFAULT_LIMIT = 50

export function getDefaultSeguimientoPeriod(now = new Date()) {
  const to = now.toISOString().split('T')[0]
  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - 28)
  return {
    desde: fromDate.toISOString().split('T')[0],
    hasta: to,
  }
}

export function mapSeguimientoAlumnoRow(row = {}) {
  return {
    id: row.alumno_id,
    nombre_completo: row.nombre_completo || '',
    instrumento_principal: row.instrumento_principal || '',
    asistencia: {
      total: Number(row.asistencia_total || 0),
      presentes: Number(row.asistencia_presentes || 0),
      rate: row.asistencia_rate == null ? null : Number(row.asistencia_rate),
    },
    progreso: row.progreso_count > 0
      ? {
          count: Number(row.progreso_count || 0),
          promedio: Number(row.progreso_promedio || 0),
        }
      : null,
    observacionesCount: Number(row.observaciones_count || 0),
    risk_reasons: Array.isArray(row.risk_reasons) ? row.risk_reasons : [],
    en_riesgo: Boolean(row.en_riesgo),
    risk_score: Number(row.risk_score || 0),
    nivel_riesgo: row.nivel_riesgo || null,
  }
}

export async function fetchSeguimientoAlumnos({
  desde,
  hasta,
  limit = DEFAULT_LIMIT,
  offset = 0,
  busqueda = '',
} = {}) {
  const period = desde && hasta ? { desde, hasta } : getDefaultSeguimientoPeriod()
  const { data, error } = await supabase.rpc('analizar_seguimiento_alumnos', {
    p_desde: period.desde,
    p_hasta: period.hasta,
    p_limit: limit,
    p_offset: offset,
    p_busqueda: busqueda || null,
  })

  if (error) {
    console.error('[fetchSeguimientoAlumnos]', error)
    throw new Error('No se pudo cargar el seguimiento de alumnos')
  }

  const rows = data || []
  return {
    alumnos: rows.map(mapSeguimientoAlumnoRow),
    totalCount: Number(rows[0]?.total_count || 0),
    riskCount: Number(rows[0]?.risk_count || 0),
    limit,
    offset,
    desde: period.desde,
    hasta: period.hasta,
  }
}
