/**
 * IdJerarquico.js — Espejo puro (sin base de datos) del algoritmo SQL que
 * materializa el ID jerárquico de un indicador ('Nivel.Objetivo.Indicador',
 * ej. '2.1.3').
 *
 * La lógica real vive en el trigger `fn_asignar_id_jerarquico()` de
 * `supabase/migrations/20260731000002_mapa_clase_id_jerarquico.sql` (BEFORE
 * INSERT en `clase_mapa_indicadores`), que no es ejecutable directamente
 * desde Vitest. Esta función espejo existe para poder testear la regla de
 * negocio (REQ-04) sin una base de datos real; cualquier cambio al algoritmo
 * SQL debe reflejarse acá también.
 */

/**
 * Compone el ID jerárquico a partir de sus tres tramos.
 * @param {Object} params
 * @param {number} params.levelNumber — Nivel (levels.level_number), entero >= 1
 * @param {number} params.ordenObjetivo — Tramo 2, entero >= 1. INMUTABLE.
 * @param {number} params.ordenIndicador — Tramo 3, entero >= 1. INMUTABLE.
 * @returns {string} ej. '2.1.3'
 */
export function componerIdJerarquico({ levelNumber, ordenObjetivo, ordenIndicador }) {
  if (!Number.isInteger(levelNumber) || levelNumber < 1) {
    throw new Error('[IdJerarquico] levelNumber debe ser un entero >= 1')
  }
  if (!Number.isInteger(ordenObjetivo) || ordenObjetivo < 1) {
    throw new Error('[IdJerarquico] ordenObjetivo debe ser un entero >= 1')
  }
  if (!Number.isInteger(ordenIndicador) || ordenIndicador < 1) {
    throw new Error('[IdJerarquico] ordenIndicador debe ser un entero >= 1')
  }
  return `${levelNumber}.${ordenObjetivo}.${ordenIndicador}`
}

/**
 * Espejo de `COALESCE(MAX(orden_indicador), 0) + 1` — el siguiente
 * orden_indicador disponible dentro de un objetivo, dado el listado de
 * indicadores hermanos ya existentes (mismo objetivo_id).
 * @param {Array<{ordenIndicador: number}>} indicadoresHermanos
 * @returns {number}
 */
export function siguienteOrdenIndicador(indicadoresHermanos = []) {
  const max = indicadoresHermanos.reduce(
    (acc, ind) => Math.max(acc, ind?.ordenIndicador ?? 0),
    0
  )
  return max + 1
}

/**
 * Compone el ID jerárquico completo para un nuevo indicador, asignando
 * automáticamente `ordenIndicador` cuando no se provee — mismo comportamiento
 * que `fn_asignar_id_jerarquico()` cuando `NEW.orden_indicador IS NULL`.
 * @param {Object} params
 * @param {number} params.levelNumber
 * @param {number} params.ordenObjetivo
 * @param {Array<{ordenIndicador: number}>} params.indicadoresHermanos
 * @param {number} [params.ordenIndicador] — si se provee, se usa tal cual (no autogenerar)
 * @returns {{ordenIndicador: number, idJerarquico: string}}
 */
export function asignarIdJerarquico({ levelNumber, ordenObjetivo, indicadoresHermanos = [], ordenIndicador }) {
  const ordenResuelto = ordenIndicador ?? siguienteOrdenIndicador(indicadoresHermanos)
  return {
    ordenIndicador: ordenResuelto,
    idJerarquico: componerIdJerarquico({ levelNumber, ordenObjetivo, ordenIndicador: ordenResuelto }),
  }
}
