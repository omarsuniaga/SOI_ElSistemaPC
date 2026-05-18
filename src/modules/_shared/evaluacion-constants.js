/**
 * Shared evaluation constants — single source of truth for:
 *  - Canonical observacion tipo set (mirrors DB CHECK constraint)
 *  - Legacy tipo mapping (for service-boundary shim + SQL migration)
 *  - Calificacion range (mirrors DB CHECK constraint on progresos)
 *  - Permission key for evaluacion writes
 */

export const OBSERVACION_TIPOS = Object.freeze([
  'academica',
  'conductual',
  'asistencia',
  'tecnica',
  'motivacional',
  'administrativa',
  'otra',
])

export const OBSERVACION_TIPO_LABELS = Object.freeze({
  academica:      'Académica',
  conductual:     'Conductual',
  asistencia:     'Asistencia',
  tecnica:        'Técnica',
  motivacional:   'Motivacional',
  administrativa: 'Administrativa',
  otra:           'Otra',
})

/**
 * Legacy JS-model values → canonical DB values.
 * Mirrors the UPDATE statements in the SQL migration.
 */
export const LEGACY_TIPO_MAP = Object.freeze({
  comportamiento: 'conductual',
  academico:      'academica',
  social:         'otra',
  disciplina:     'conductual',
})

export const CALIFICACION_MIN = 0
export const CALIFICACION_MAX = 10

export const PERMISO_EVALUACION_WRITE = 'evaluacion:write'

/**
 * Normalize a tipo value: passthrough canonical, translate legacy, return null for unknown.
 * @param {string} tipo
 * @returns {string|null}
 */
export function normalizeTipo(tipo) {
  if (!tipo) return null
  if (OBSERVACION_TIPOS.includes(tipo)) return tipo
  if (LEGACY_TIPO_MAP[tipo]) {
    console.warn(`[evaluacion] legacy tipo "${tipo}" mapped to "${LEGACY_TIPO_MAP[tipo]}"`)
    return LEGACY_TIPO_MAP[tipo]
  }
  return null
}
