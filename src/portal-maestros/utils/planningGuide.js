/**
 * planningGuide.js
 * Lógica pura de "faro": a partir de los indicadores de una ruta (ya ordenados
 * por order_index), decide qué debería trabajar el maestro a continuación.
 *
 * Mantener PURO (sin DOM, sin red) para que sea trivial de testear y reusar
 * tanto en la vista de Planificación como, más adelante, en la sugerencia IA.
 */

/**
 * Devuelve el próximo indicador a trabajar: el primero en orden de ruta cuyo
 * estado no sea 'completado' (es decir, 'no_iniciado' o 'parcial').
 *
 * @param {Array<{node_id: string, nombre: string, estado: {estado: string}}>} indicators
 *   Indicadores en orden curricular (tal como los devuelve getIndicatorsWithStatus).
 * @returns {object|null} El indicador recomendado, o null si no hay ninguno pendiente.
 */
export function getProximoIndicador(indicators) {
  if (!Array.isArray(indicators)) return null
  return indicators.find((ind) => {
    const estado = ind?.estado?.estado
    return estado && estado !== 'completado'
  }) || null
}

/**
 * Resumen de progreso de la ruta para el encabezado del faro.
 *
 * @param {Array} indicators
 * @returns {{total: number, completados: number, pendientes: number, porcentaje: number}}
 */
export function getResumenProgreso(indicators) {
  const list = Array.isArray(indicators) ? indicators : []
  const total = list.length
  const completados = list.filter((ind) => ind?.estado?.estado === 'completado').length
  const pendientes = total - completados
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0
  return { total, completados, pendientes, porcentaje }
}
