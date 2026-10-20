import { IndicadorLogro } from '../../planificacion/domain/IndicadorLogro.js'

/**
 * Valoración de clase por alumno presente (0 a 5 estrellas).
 * `null` = «Sin evaluar»; `0` es una valoración explícita y distinta.
 */
export const RATING_MIN = 0
export const RATING_MAX = 5
export const UNRATED_LABEL = 'Sin evaluar'

const RATABLE_STATES = new Set(['P', 'T', 'presente', 'tarde', 'tardanza'])

/** Solo presentes (y tarde) se evalúan; ausentes, justificados y sin marcar quedan fuera. */
export function isRatableState(state) {
  return RATABLE_STATES.has(state)
}

/** @returns {number|null} 0..5 entero, o null si no hay valoración. Lanza si es inválida. */
export function normalizeRating(value) {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'string' ? Number(value.trim()) : value
  if (!Number.isInteger(n) || n < RATING_MIN || n > RATING_MAX) {
    throw new RangeError(`La valoración debe ser un entero de ${RATING_MIN} a ${RATING_MAX} o estar sin evaluar`)
  }
  return n
}

export function ratingLabel(value) {
  if (value === null || value === undefined) return UNRATED_LABEL
  if (value === 0) return '0 estrellas'
  return `${value}/5 · ${IndicadorLogro.getEtiquetaDesempeno(value)}`
}

/**
 * Decide qué filas guardadas pueden recibir cada valoración pedida.
 * Solo se actualiza la fila existente de (sesión, alumno): nunca se inserta,
 * por lo que corregir una nota no puede duplicarla.
 *
 * @param {Array<{id:string, alumno_id:string, estado:string}>} rows filas de asistencias de la sesión
 * @param {Array<{alumno_id:string, valoracion:number|string|null}>} items valoraciones pedidas
 * @returns {{ updates: Array<{id:string, alumno_id:string, valoracion:number|null}>,
 *            rejected: Array<{alumno_id:string, reason:'sin_asistencia'|'no_presente'}> }}
 */
export function partitionRatings(rows, items) {
  const byStudent = new Map((rows || []).map(r => [r.alumno_id, r]))
  const latest = new Map()
  for (const item of items || []) latest.set(item.alumno_id, normalizeRating(item.valoracion))
  const updates = []
  const rejected = []
  for (const [alumno_id, valoracion] of latest) {
    const row = byStudent.get(alumno_id)
    if (!row) rejected.push({ alumno_id, reason: 'sin_asistencia' })
    else if (!isRatableState(row.estado)) rejected.push({ alumno_id, reason: 'no_presente' })
    else updates.push({ id: row.id, alumno_id, valoracion })
  }
  return { updates, rejected }
}

/** Promedio solo sobre lo evaluado (los 0 cuentan; los «Sin evaluar» no). */
export function summarizeRatings(values) {
  const list = (values || []).filter(v => v !== undefined)
  const rated = list.filter(v => v !== null)
  const sum = rated.reduce((a, b) => a + b, 0)
  return {
    rated: rated.length,
    unrated: list.length - rated.length,
    average: rated.length ? Math.round((sum / rated.length) * 10) / 10 : null,
  }
}

export function formatAverage(average) {
  return average === null || average === undefined ? '—' : average.toFixed(1).replace('.', ',')
}

/** Línea de resumen por alumno; sin evaluadas no se muestra un promedio vacío. */
export function ratingSummaryText({ rated, unrated, average }) {
  if (!rated && !unrated) return ''
  return rated
    ? `promedio ${formatAverage(average)}/5 (${rated} evaluadas, ${unrated} sin evaluar)`
    : `sin valoraciones (${unrated} sin evaluar)`
}
