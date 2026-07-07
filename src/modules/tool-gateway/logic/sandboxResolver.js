/**
 * sandboxResolver.js
 * Slice 2 — MCP Tool Gateway: resolucion de operaciones sandbox.
 *
 * DECISION DEL ORQUESTADOR (2026-07-06, resolviendo el cabo suelto del Slice 1):
 * Los seeds de `sandbox_behavior` en 20260708_tool_catalog_core.sql proponian
 * tablas espejo por tool (sim_planificaciones, sim_ordenes_reparacion,
 * sim_inventario_activos, sim_cuotas) que NUNCA se crearon como tablas reales.
 * En vez de crear 4 tablas nuevas, este resolver mapea TODA escritura sandbox
 * a las tablas GENERICAS ya existentes de `20260707_simulador_core.sql`:
 *   - sim_tareas: si la tool_call equivale a crear una tarea/registro operativo
 *     (heuristica: no declara envio -> se registra como tarea de seguimiento).
 *   - sim_log: SIEMPRE (auditoria append-only de toda accion en simulacion,
 *     mismo patron que usa `simulador-tick` para el timeline de animacion).
 *   - sim_outbox: SOLO si `sandbox_behavior.envia_mensaje===true` (declara un
 *     canal de comunicacion) -> se encola como mensaje simulado.
 * Los campos `tabla_destino` heredados de los seeds del Slice 1 (ej.
 * "sim_planificaciones") se IGNORAN a proposito por este resolver: son
 * metadata informativa historica, no se leen para decidir la tabla real.
 *
 * `sandbox_behavior` ausente/null -> SIEMPRE rechaza (spec:
 * simulador-tool-binding / "sandbox_behavior faltante rechaza la tool_call"),
 * sin excepcion por nivel_riesgo (incluye tools 'read', aunque en la practica
 * el pipeline nunca sandboxea reads porque resolverAutonomia() ya las ejecuta
 * directo sin pasar por aqui).
 *
 * Duplicado 1:1 (comentado) en `supabase/functions/tool-gateway/index.ts`.
 *
 * @param {{name:string, nivel_riesgo:string, sandbox_behavior:object|null}} tool
 * @param {object} args - argumentos ya validados de la tool_call.
 * @param {{runId?:string}} [ctx]
 * @returns {{ok:boolean, operaciones:Array<{tabla:string, payload:object}>}}
 */
export function resolverSandbox(tool, args, ctx = {}) {
  if (!tool || !tool.sandbox_behavior || typeof tool.sandbox_behavior !== 'object') {
    return { ok: false, operaciones: [] }
  }

  const runId = ctx.runId ?? null
  const operaciones = []

  // sim_tareas: representa la escritura simulada como tarea de seguimiento
  // del sandbox (toda tool write/critical se traduce a un registro operativo
  // visible en el panel del simulador).
  operaciones.push({
    tabla: 'sim_tareas',
    payload: {
      run_id: runId,
      titulo: `[Sandbox] ${tool.name}`,
      descripcion: `Ejecucion sandbox de la tool "${tool.name}" via tool-gateway.`,
      departamento: tool.sandbox_behavior.departamento ?? 'DIR',
      estado: 'pendiente',
      prioridad: tool.nivel_riesgo === 'critical' ? 'alta' : 'media',
      checklist: [{ item: 'tool_call_payload', completado: false, payload: args }],
    },
  })

  // sim_log: auditoria SIEMPRE presente, sin excepcion.
  operaciones.push({
    tabla: 'sim_log',
    payload: {
      run_id: runId,
      agente: 'tool-gateway',
      accion: `tool_call_sandbox:${tool.name}`,
      payload: args,
    },
  })

  // sim_outbox: solo si sandbox_behavior declara explicitamente un envio.
  if (tool.sandbox_behavior.envia_mensaje === true) {
    operaciones.push({
      tabla: 'sim_outbox',
      payload: {
        run_id: runId,
        canal: tool.sandbox_behavior.canal ?? 'whatsapp',
        mensaje: `Simulacion de envio generado por la tool "${tool.name}".`,
      },
    })
  }

  return { ok: true, operaciones }
}
