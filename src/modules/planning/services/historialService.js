/**
 * historialService.js
 * Responsabilidad: Unified content history for the Historial tab in Plan view.
 * Merges observaciones_sesion + indicator_sessions, sorted by date desc.
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * @typedef {Object} HistorialItem
 * @property {string} id
 * @property {'observacion'|'indicador'} type
 * @property {string} fecha                 - ISO date string
 * @property {string} clase_id
 * @property {string} clase_nombre
 * @property {string} clase_instrumento
 * @property {string|null} contenido_raw
 * @property {string|null} contenido_ia_dsl
 * @property {string|null} node_id
 * @property {string|null} node_name
 * @property {string|null} node_type
 * @property {string|null} descripcion
 * @property {string|null} calificacion     - 'bien'|'regular'|'mal'
 * @property {'sin_planificar'|'registrado'} estado
 * @property {string} created_at
 */

/**
 * Fetches unified history: observaciones_sesion + indicator_sessions.
 * Merges, deduplicates, and sorts by date desc.
 *
 * @param {string} maestroId
 * @param {object} opts
 * @param {string|null} [opts.claseId]   - filter by class (optional)
 * @param {string|null} [opts.desde]     - ISO date string start (optional)
 * @param {string|null} [opts.hasta]     - ISO date string end (optional)
 * @param {number}      [opts.limit]     - max items (default 50)
 * @returns {Promise<HistorialItem[]>}
 */
export async function getHistorial(maestroId, opts = {}) {
  const { claseId = null, desde = null, hasta = null, limit = 50 } = opts

  const [observacionesResult, indicadoresResult] = await Promise.all([
    fetchObservaciones(maestroId, { claseId, desde, hasta }),
    fetchIndicadores(maestroId, { claseId, desde, hasta }),
  ])

  if (observacionesResult.error) throw observacionesResult.error
  if (indicadoresResult.error) throw indicadoresResult.error

  const merged = [
    ...mapObservaciones(observacionesResult.data ?? [], { claseId, desde, hasta }),
    ...mapIndicadores(indicadoresResult.data ?? []),
  ]

  merged.sort((a, b) => {
    const dateDiff = b.fecha.localeCompare(a.fecha)
    if (dateDiff !== 0) return dateDiff
    return b.created_at.localeCompare(a.created_at)
  })

  return merged.slice(0, limit)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function fetchObservaciones(maestroId, { claseId }) {
  // Note: claseId and date filters on observaciones cannot be applied server-side
  // because the relevant columns live on the joined sesiones_clase, not here.
  // Client-side filtering is applied in mapObservaciones.
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

function fetchIndicadores(maestroId, { claseId, desde, hasta }) {
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

/**
 * @param {object[]} rows
 * @param {object}   filters
 * @returns {HistorialItem[]}
 */
function mapObservaciones(rows, { claseId = null, desde = null, hasta = null } = {}) {
  return rows
    .map((row) => {
      // Supabase may return array for foreign-key joins
      const sesion = Array.isArray(row.sesiones_clase)
        ? row.sesiones_clase[0]
        : row.sesiones_clase

      if (!sesion) return null
      if (claseId && sesion.clase_id !== claseId) return null
      if (desde && sesion.fecha < desde) return null
      if (hasta && sesion.fecha > hasta) return null

      const clase = Array.isArray(sesion.clases) ? sesion.clases[0] : sesion.clases

      return /** @type {HistorialItem} */ ({
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
      })
    })
    .filter(Boolean)
}

/**
 * @param {object[]} rows
 * @returns {HistorialItem[]}
 */
function mapIndicadores(rows) {
  return rows.map((row) => {
    const node = Array.isArray(row.nodes) ? row.nodes[0] : row.nodes
    const clase = Array.isArray(row.clases) ? row.clases[0] : row.clases

    return /** @type {HistorialItem} */ ({
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
    })
  })
}
