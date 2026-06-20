/**
 * progressInsightService.js
 *
 * Fetches and aggregates progress records (progresos) for a class
 * over a rolling N-week window. Prepares structured data for Groq analysis.
 */

import { supabase } from '../../lib/supabaseClient.js'

/**
 * Fetches and aggregates progresos for the given class over the last N weeks.
 *
 * @param {string} claseId
 * @param {number} semanas - Number of weeks to look back (default 12)
 * @returns {Promise<{
 *   totalSesiones: number,
 *   fechaDesde: string,
 *   registros: Array<{
 *     contenido_dsl: string,
 *     tipo: string,
 *     estado: string,
 *     frecuencia: number,
 *     alumnos: string[]
 *   }>
 * }>}
 */
export async function fetchInsights(claseId, semanas = 12) {
  const fechaDesde = new Date()
  fechaDesde.setDate(fechaDesde.getDate() - semanas * 7)
  const fechaDesdeStr = fechaDesde.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('progresos')
    .select(`
      contenido_dsl,
      tipo,
      estado_cualitativo,
      fecha_evaluacion,
      alumnos ( nombre_completo )
    `)
    .eq('clase_id', claseId)
    .eq('evaluacion_tipo', 'observacion')
    .gte('fecha_evaluacion', fechaDesdeStr)
    .not('contenido_dsl', 'is', null)
    .neq('contenido_dsl', '')
    .order('fecha_evaluacion', { ascending: false })

  if (error) throw new Error('Error al obtener registros de progreso: ' + error.message)
  if (!data || data.length === 0) {
    return { totalSesiones: 0, fechaDesde: fechaDesdeStr, registros: [] }
  }

  // Count unique session dates for totalSesiones
  const sesionesUnicas = new Set(data.map(r => r.fecha_evaluacion))

  // Group rows by contenido_dsl (normalized: trim + lowercase)
  const groups = new Map()
  for (const row of data) {
    const key = (row.contenido_dsl || '').trim().toLowerCase()
    if (!key) continue

  if (!groups.has(key)) {
    groups.set(key, {
      contenido_dsl: row.contenido_dsl.trim(),
      tipo: row.tipo || 'otro',
      estados: [],
      fechas: new Set(),
      alumnos: new Set(),
    })
  }
  const group = groups.get(key)
  group.estados.push(row.estado_cualitativo || 'EN_PROGRESO')
  group.fechas.add(row.fecha_evaluacion)
  const nombreAlumno = row.alumnos?.nombre_completo
  if (nombreAlumno) group.alumnos.add(nombreAlumno)
}

  // Build registros: most recent estado wins, frecuencia = unique session count
  const registros = Array.from(groups.values()).map(g => ({
    contenido_dsl: g.contenido_dsl,
    tipo: g.tipo,
    estado: g.estados[0] || 'EN_PROGRESO', // first = most recent (sorted desc)
    frecuencia: g.fechas.size,
    alumnos: Array.from(g.alumnos),
  }))

  // Sort by frecuencia descending — most recurring content first
  registros.sort((a, b) => b.frecuencia - a.frecuencia)

  return {
    totalSesiones: sesionesUnicas.size,
    fechaDesde: fechaDesdeStr,
    registros,
  }
}
