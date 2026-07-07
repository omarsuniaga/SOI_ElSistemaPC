/**
 * construirTareaAprobacion.js
 * Slice 2 — MCP Tool Gateway: constructor de la tarea Hermes de aprobacion.
 *
 * Convencion decidida en tasks (obs #2740, "Decision de convencion de tarea
 * de aprobacion"): usa los campos polimorficos ya existentes de
 * `tareas_institucionales` (entidad_tipo/entidad_id/entidad_label) en vez de
 * una columna nueva. La deteccion de "es una tarea de tool_call" la hace el
 * caller inspeccionando `entidad_tipo === 'tool_call'`, NUNCA el contenido
 * del checklist.
 *
 * IMPORTANTE (gotcha real de este slice): el CHECK constraint
 * `tareas_entidad_tipo_check` (20260626_sp0_substrato_tareas.sql) es una
 * lista CERRADA que NO incluye 'tool_call'. Este slice agrega una migracion
 * (`20260709_tool_gateway_entidad_tipo.sql`) que amplia ese CHECK. Sin esa
 * migracion el INSERT de esta tarea fallaria en produccion.
 *
 * Duplicado 1:1 (comentado) en `supabase/functions/tool-gateway/index.ts`.
 *
 * @param {{toolCall:{tool_name:string, args:object, correlation_id?:string}, logId:string, departamento:string, nivelRiesgo:'write'|'critical', asignarA?:string}} input
 * @returns {object} payload listo para insertar en tareas_institucionales
 */
export function construirTareaAprobacion({ toolCall, logId, departamento, nivelRiesgo, asignarA }) {
  const departamentoFinal = nivelRiesgo === 'critical' ? asignarA ?? 'DIR' : departamento
  const prioridad = nivelRiesgo === 'critical' ? 'critica' : 'alta'

  const tarea = {
    titulo: `[Aprobación Tool] ${toolCall.tool_name}`,
    descripcion: `Aprobacion requerida para ejecutar la tool "${toolCall.tool_name}" (nivel_riesgo: ${nivelRiesgo}).`,
    departamento: departamentoFinal,
    estado: 'pendiente',
    prioridad,
    entidad_tipo: 'tool_call',
    entidad_id: logId,
    entidad_label: toolCall.tool_name,
    checklist: [
      { item: 'tool_call_payload', completado: false, payload: toolCall },
    ],
  }

  if (toolCall.correlation_id) {
    tarea.correlation_id = toolCall.correlation_id
  }

  return tarea
}
