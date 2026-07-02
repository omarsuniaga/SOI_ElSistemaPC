/**
 * historialService.js
 * Historial unificado:
 * - observaciones_sesion
 * - indicator_sessions legacy
 * - sesiones/progreso ACM desde student_indicator_progress
 */

import { supabase } from '../../../lib/supabaseClient.js'

export async function getHistorial(maestroId, opts = {}) {
  const { claseId = null, desde = null, hasta = null, limit = 50 } = opts

  const [observacionesResult, legacyIndicadoresResult, acmIndicadores] = await Promise.all([
    fetchObservaciones(maestroId),
    fetchIndicadoresLegacy(maestroId, { claseId, desde, hasta }),
    fetchIndicadoresAcm(maestroId, { claseId, desde, hasta }),
  ])

  if (observacionesResult.error) throw observacionesResult.error
  if (legacyIndicadoresResult.error) throw legacyIndicadoresResult.error

  const merged = [
    ...mapObservaciones(observacionesResult.data ?? [], { claseId, desde, hasta }),
    ...mapIndicadoresLegacy(legacyIndicadoresResult.data ?? []),
    ...acmIndicadores,
  ]

  merged.sort((a, b) => {
    const dateDiff = String(b.fecha || '').localeCompare(String(a.fecha || ''))
    if (dateDiff !== 0) return dateDiff
    return String(b.created_at || '').localeCompare(String(a.created_at || ''))
  })

  return merged.slice(0, limit)
}

function fetchObservaciones(maestroId) {
  return supabase
    .from('observaciones_sesion')
    .select(`
      id, contenido_raw, contenido_ia_dsl, created_at,
      sesiones_clase!observaciones_sesion_sesion_id_fkey(
        id, fecha, clase_id,
        clases(nombre, instrumento)
      )
    `)
    .eq('maestro_id', maestroId)
    .eq('es_borrador', false)
}

function fetchIndicadoresLegacy(maestroId, { claseId, desde, hasta }) {
  let query = supabase
    .from('indicator_sessions')
    .select(`
      id, fecha, descripcion, calificacion, clase_id, created_at,
      nodes(id, name, type),
      clases(nombre, instrumento)
    `)
    .eq('maestro_id', maestroId)

  if (claseId) query = query.eq('clase_id', claseId)
  if (desde) query = query.gte('fecha', desde)
  if (hasta) query = query.lte('fecha', hasta)
  return query
}

async function fetchIndicadoresAcm(maestroId, { claseId, desde, hasta }) {
  let sessionsQuery = supabase
    .from('sesiones_clase')
    .select('id, fecha, clase_id, created_at, clases(nombre, instrumento)')
    .eq('maestro_id', maestroId)

  if (claseId) sessionsQuery = sessionsQuery.eq('clase_id', claseId)
  if (desde) sessionsQuery = sessionsQuery.gte('fecha', desde)
  if (hasta) sessionsQuery = sessionsQuery.lte('fecha', hasta)

  const { data: sesiones, error: sessionsError } = await sessionsQuery
  if (sessionsError || !sesiones?.length) return []

  const claseIds = [...new Set(sesiones.map((sesion) => sesion.clase_id).filter(Boolean))]
  const sessionIds = sesiones.map((sesion) => sesion.id)

  const [{ data: routes }, { data: progressRows }] = await Promise.all([
    claseIds.length
      ? supabase
          .from('acm_active_routes')
          .select('group_id, weekly_plan_id')
          .in('group_id', claseIds)
          .eq('status', 'active')
      : Promise.resolve({ data: [] }),
    sessionIds.length
      ? supabase
          .from('student_indicator_progress')
          .select('session_id, indicator_id, status, updated_at')
          .in('session_id', sessionIds)
          .neq('status', 'not_started')
      : Promise.resolve({ data: [] }),
  ])

  const weeklyPlanIds = [...new Set((routes || []).map((route) => route.weekly_plan_id).filter(Boolean))]
  const { data: planItems } = weeklyPlanIds.length
    ? await supabase
        .from('acm_weekly_plan_items')
        .select('weekly_plan_id, indicator_id, topic, objective')
        .in('weekly_plan_id', weeklyPlanIds)
    : { data: [] }

  const routeByClass = new Map((routes || []).map((route) => [route.group_id, route]))
  const itemByIndicator = new Map((planItems || []).filter((item) => item.indicator_id).map((item) => [item.indicator_id, item]))

  const grouped = new Map()
  for (const row of progressRows || []) {
    const item = itemByIndicator.get(row.indicator_id)
    if (!item) continue
    if (!grouped.has(row.session_id)) grouped.set(row.session_id, [])
    grouped.get(row.session_id).push(row)
  }

  return sesiones.flatMap((sesion) => {
    const rows = grouped.get(sesion.id) || []
    const route = routeByClass.get(sesion.clase_id)
    if (!rows.length || !route) return []

    const clase = Array.isArray(sesion.clases) ? sesion.clases[0] : sesion.clases
    const byIndicator = new Map()
    rows.forEach((row) => {
      if (!byIndicator.has(row.indicator_id)) byIndicator.set(row.indicator_id, row)
    })

    return Array.from(byIndicator.values()).map((row) => {
      const item = itemByIndicator.get(row.indicator_id)
      return {
        id: `acm-${sesion.id}-${row.indicator_id}`,
        type: 'indicador',
        fecha: sesion.fecha ?? '',
        clase_id: sesion.clase_id ?? '',
        clase_nombre: clase?.nombre ?? '',
        clase_instrumento: clase?.instrumento ?? '',
        contenido_raw: null,
        contenido_ia_dsl: null,
        node_id: row.indicator_id,
        node_name: item?.topic ?? 'Indicador ACM',
        node_type: 'acm_indicator',
        descripcion: item?.objective ?? null,
        calificacion: mapStatusToCalificacion(row.status),
        estado: 'registrado',
        created_at: row.updated_at || sesion.created_at || '',
      }
    })
  })
}

function mapStatusToCalificacion(status) {
  if (['achieved', 'exceeded'].includes(status)) return 'bien'
  if (['in_process', 'needs_reinforcement'].includes(status)) return 'regular'
  if (status === 'failed') return 'mal'
  return null
}

function mapObservaciones(rows, { claseId = null, desde = null, hasta = null } = {}) {
  return rows
    .map((row) => {
      const sesion = Array.isArray(row.sesiones_clase) ? row.sesiones_clase[0] : row.sesiones_clase
      if (!sesion) return null
      if (claseId && sesion.clase_id !== claseId) return null
      if (desde && sesion.fecha < desde) return null
      if (hasta && sesion.fecha > hasta) return null

      const clase = Array.isArray(sesion.clases) ? sesion.clases[0] : sesion.clases

      return {
        id: row.id,
        type: 'observacion',
        fecha: sesion.fecha ?? '',
        clase_id: sesion.clase_id ?? '',
        clase_nombre: clase?.nombre ?? '',
        clase_instrumento: clase?.instrumento ?? '',
        contenido_raw: row.contenido_raw ?? null,
        contenido_ia_dsl: row.contenido_ia_dsl ?? null,
        node_id: null,
        node_name: null,
        node_type: null,
        descripcion: null,
        calificacion: null,
        estado: 'sin_planificar',
        created_at: row.created_at ?? '',
      }
    })
    .filter(Boolean)
}

function mapIndicadoresLegacy(rows) {
  return rows.map((row) => {
    const node = Array.isArray(row.nodes) ? row.nodes[0] : row.nodes
    const clase = Array.isArray(row.clases) ? row.clases[0] : row.clases

    return {
      id: row.id,
      type: 'indicador',
      fecha: row.fecha ?? '',
      clase_id: row.clase_id ?? '',
      clase_nombre: clase?.nombre ?? '',
      clase_instrumento: clase?.instrumento ?? '',
      contenido_raw: null,
      contenido_ia_dsl: null,
      node_id: node?.id ?? null,
      node_name: node?.name ?? null,
      node_type: node?.type ?? null,
      descripcion: row.descripcion ?? null,
      calificacion: row.calificacion ?? null,
      estado: 'registrado',
      created_at: row.created_at ?? '',
    }
  })
}
