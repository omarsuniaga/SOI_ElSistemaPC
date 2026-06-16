/**
 * historialService.js
 * Responsabilidad: Unified content history for the Historial tab in Plan view.
 * Fetches observaciones_sesion, sorted by date desc.
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * @typedef {Object} HistorialItem
 * @property {string} id
 * @property {'observacion'} type
 * @property {string} fecha                 - ISO date string
 * @property {string} clase_id
 * @property {string} clase_nombre
 * @property {string} clase_instrumento
 * @property {string|null} contenido_raw
 * @property {string|null} contenido_ia_dsl
 * @property {'sin_planificar'|'registrado'} estado
 * @property {string} created_at
 */

/**
 * Fetches observaciones history for the Historial tab.
 * Sorted by date desc.
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

  const observacionesResult = await fetchObservaciones(maestroId, { claseId, desde, hasta })

  if (observacionesResult.error) throw observacionesResult.error

  const merged = mapObservaciones(observacionesResult.data ?? [], { claseId, desde, hasta })

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
        estado: 'sin_planificar',
        created_at: row.created_at ?? '',
      })
    })
    .filter(Boolean)
}

