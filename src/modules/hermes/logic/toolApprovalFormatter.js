/**
 * toolApprovalFormatter.js
 * Slice 4 — Aprobacion humana en tareasView.js (Domain: hermes-write-approval,
 * design obs #2738 "Aprobación humana PWA").
 *
 * Convencion de tarea de aprobacion (sin migrar tareas_institucionales, ver
 * design "Convención de tarea de aprobación"):
 *   entidad_tipo === 'tool_call'
 *   entidad_label === <tool_name>
 *   checklist[0] === { item: 'tool_call_payload', completado: false, payload: GatewayRequest }
 *
 * Funciones puras usadas por tareasView.js para decidir si mostrar el panel
 * de aprobacion de una tool_call y para formatear sus args de forma legible.
 */

const ESTADOS_YA_RESUELTOS = ['completada', 'cancelada']

/**
 * @param {object|null|undefined} tarea
 * @returns {boolean} true si la tarea es una solicitud de aprobación de
 *   tool_call pendiente de decisión humana (no resuelta aún).
 */
export function esTareaToolCallAprobable(tarea) {
  if (!tarea || tarea.entidad_tipo !== 'tool_call') return false
  if (ESTADOS_YA_RESUELTOS.includes(tarea.estado)) return false
  return extraerToolCallPayload(tarea) !== null
}

/**
 * Extrae el GatewayRequest original (tool_name, args, correlation_id?) desde
 * el checklist[0].payload de la tarea de aprobación.
 * @param {object|null|undefined} tarea
 * @returns {{tool_name:string, args:object, correlation_id?:string}|null}
 */
export function extraerToolCallPayload(tarea) {
  if (!tarea || !Array.isArray(tarea.checklist)) return null
  const item = tarea.checklist.find((c) => c && c.item === 'tool_call_payload')
  return item?.payload ?? null
}

/**
 * Convierte un objeto de args en filas clave-valor legibles para tabla HTML.
 * Valores objeto/array se serializan como JSON compacto; null/undefined se
 * muestran como guion largo.
 * @param {object|null|undefined} args
 * @returns {Array<{clave:string, valor:string}>}
 */
export function formatearArgsToolCall(args) {
  if (!args || typeof args !== 'object') return []
  return Object.entries(args).map(([clave, valor]) => {
    if (valor === null || valor === undefined) return { clave, valor: '—' }
    if (typeof valor === 'object') return { clave, valor: JSON.stringify(valor) }
    return { clave, valor: String(valor) }
  })
}
