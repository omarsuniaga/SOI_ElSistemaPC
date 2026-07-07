/**
 * resolverAutonomia.js
 * Slice 2 — MCP Tool Gateway: matriz de autonomia (funcion pura).
 *
 * Fuente de verdad de la tabla de decision del design (obs #2738) y del spec
 * (obs #2737, domain: tool-gateway / "Matriz de autonomia estructural").
 * SOLO usa campos estructurales (nivel_riesgo, caller_type, automation_status,
 * tieneTareaAprobada) — nunca instrucciones del prompt del LLM.
 *
 * Duplicado 1:1 (comentado) en `supabase/functions/tool-gateway/index.ts`
 * (mismo patron self-contained que `simulador-tick`).
 *
 * Reglas (en orden de evaluacion):
 *  1. nivel_riesgo/caller_type invalidos -> rechazar (defensivo, nunca ejecuta parcial).
 *  2. read -> ejecutar siempre.
 *  3. simulador -> ejecutar SIEMPRE en sandbox (write y critical incluidos),
 *     sandbox_behavior del catalogo decide la tabla sim_* destino (sandboxResolver.js).
 *  4. critical (no-simulador): SIEMPRE pendiente_aprobacion asignada a DIR,
 *     salvo callerType=humano CON tieneTareaAprobada=true (ejecucion diferida
 *     ya aprobada) -> ejecutar. Ignora automation_status a proposito (spec:
 *     "critical siempre requiere tarea DIR salvo ejecucion humana ya aprobada").
 *  5. write (no-simulador):
 *     - callerType=humano: ejecuta si tieneTareaAprobada=true, si no crea tarea.
 *     - callerType=llm|mcp: ejecuta si automationStatus==='auto', si no crea tarea.
 *
 * @param {{nivelRiesgo:string, callerType:string, automationStatus?:string, tieneTareaAprobada?:boolean}} input
 * @returns {{decision:'ejecutar'|'pendiente_aprobacion'|'rechazar', sandbox:boolean, asignarA?:string}}
 */

const NIVELES_VALIDOS = ['read', 'write', 'critical']
const CALLERS_VALIDOS = ['humano', 'llm', 'simulador', 'mcp']

export function resolverAutonomia({ nivelRiesgo, callerType, automationStatus, tieneTareaAprobada = false } = {}) {
  if (!NIVELES_VALIDOS.includes(nivelRiesgo) || !CALLERS_VALIDOS.includes(callerType)) {
    return { decision: 'rechazar', sandbox: false }
  }

  if (nivelRiesgo === 'read') {
    return { decision: 'ejecutar', sandbox: false }
  }

  if (callerType === 'simulador') {
    // write y critical en modo simulador SIEMPRE ejecutan sobre sim_* (sandbox
    // inviolable, ver spec: simulador-tool-binding).
    return { decision: 'ejecutar', sandbox: true }
  }

  if (nivelRiesgo === 'critical') {
    if (callerType === 'humano' && tieneTareaAprobada) {
      return { decision: 'ejecutar', sandbox: false }
    }
    return { decision: 'pendiente_aprobacion', sandbox: false, asignarA: 'DIR' }
  }

  // nivelRiesgo === 'write'
  if (callerType === 'humano') {
    return tieneTareaAprobada
      ? { decision: 'ejecutar', sandbox: false }
      : { decision: 'pendiente_aprobacion', sandbox: false }
  }

  // callerType === 'llm' | 'mcp'
  if (automationStatus === 'auto') {
    return { decision: 'ejecutar', sandbox: false }
  }
  return { decision: 'pendiente_aprobacion', sandbox: false }
}
