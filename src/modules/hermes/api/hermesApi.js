/**
 * hermesApi.js — Facade de compatibilidad para consumidores que esperan la API
 * "verbo en español" (obtenerTareas / actualizarTarea). Mapea al dispatcher real
 * tareasApi.js. Lo usa, p.ej., modules/inventario/views/dashboardInventarioView.js.
 *
 * Preferí mantener tareasApi.js como API canónica (getTareas, updateTareaEstado, ...)
 * y exponer aquí los nombres que el código consumidor ya esperaba, en vez de tocar
 * múltiples vistas. Una sola fuente de verdad, dos fachadas de nombres.
 */

import * as tareasApi from './tareasApi.js'

/**
 * @param {object} [filtros] — { departamento, estado, prioridad, asignado_a, event_id, buscar }
 * @returns {Promise<Array>}
 */
export async function obtenerTareas(filtros = {}) {
  if (filtros && Object.keys(filtros).length > 0) {
    return tareasApi.getTareasFiltradas(filtros)
  }
  return tareasApi.getTareas()
}

/**
 * Actualiza una tarea. Soporta cambios de estado y/o feedback.
 * @param {string} tareaId
 * @param {object} updates — { estado?, feedback? }
 */
export async function actualizarTarea(tareaId, updates = {}) {
  let result = null
  if (updates.estado === 'completada') {
    result = await tareasApi.completarTarea(tareaId, updates.feedback ?? null)
  } else if (updates.estado) {
    result = await tareasApi.updateTareaEstado(tareaId, updates.estado)
    if (updates.feedback != null) result = await tareasApi.guardarFeedback(tareaId, updates.feedback)
  } else if (updates.feedback != null) {
    result = await tareasApi.guardarFeedback(tareaId, updates.feedback)
  }
  return result
}

// Re-export de la API canónica para quien la quiera por este módulo.
export {
  getTareas,
  getTareaById,
  getTareasByDepartamento,
  getTareasByEvento,
  updateTareaEstado,
  updateChecklistItem,
  completarTarea,
  guardarFeedback,
  getTareasFiltradas,
} from './tareasApi.js'
