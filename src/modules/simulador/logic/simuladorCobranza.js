/**
 * simuladorCobranza.js
 * Slice 2 — Portal Simulador: regla de negocio del agente de cobranza.
 *
 * Spec: simulador-agentes-departamentales / Exclusión de morosos al día en
 * cobranza — "El agente de cobranza SHALL excluir representantes con pago
 * al día de cualquier notificación de mora." Solo los representantes con
 * `estado_pago = 'moroso'` (enum `sim_estado_pago` de la migración de
 * Slice 1) son relevantes para el evento de cobranza; 'solvente' y
 * 'no_aplica' quedan siempre excluidos.
 */

/**
 * Filtra actores de `sim_actores` a solo representantes morosos, únicos
 * candidatos a recibir notificación de cobranza.
 *
 * @param {Array<{tipo: string, estado_pago: string}>} actores
 * @returns {Array<object>}
 */
export function filtrarActoresMorosos(actores) {
  if (!Array.isArray(actores)) return []
  return actores.filter((actor) => actor && actor.tipo === 'representante' && actor.estado_pago === 'moroso')
}
