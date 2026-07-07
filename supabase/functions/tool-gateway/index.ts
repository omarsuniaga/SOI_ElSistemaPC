/**
 * Supabase Edge Function: tool-gateway
 *
 * ÚNICO punto de escritura de producción del ecosistema de tools (spec:
 * tool-gateway / "Único punto de escritura"). MCP proxy, Simulador y futuros
 * clientes Hermes NUNCA escriben directo a Supabase — todos pasan por aquí.
 *
 * Pipeline (design: sdd/mcp-tool-gateway/design obs #2738):
 *   1. auth() — resuelve el caller (humano JWT+rol | máquina x-hermes-token |
 *      simulador con run_id) — NUNCA confía en un campo enviado por el body.
 *   2. Carga la tool desde `soi_tool_catalog` (activo=true).
 *   3. validate() — jsonSchemaMini contra `input_schema`. Args inválidos ->
 *      RECHAZA sin ejecución parcial (spec: "Validación estricta de inputSchema").
 *   4. resolverAutonomia() — decide ejecutar | pendiente_aprobacion | rechazar.
 *   5a. Si pendiente_aprobacion: resolverSandbox() NO aplica (no es sandbox),
 *       se crea la tarea Hermes de aprobación (construirTareaAprobacion) y
 *       se responde sin ejecutar.
 *   5b. Si ejecutar + sandbox=true: resolverSandbox() calcula las operaciones
 *       sim_* y se insertan (service_role, run_id del body).
 *   5c. Si ejecutar + sandbox=false: se despacha por handler_type
 *       (mcp-legacy-inline -> handlers.ts | rpc -> supabase.rpc | rest ->
 *       forward a PostgREST | edge -> functions.invoke).
 *   6. audit() en try/finally: TODA invocación (incluso rechazada) se audita
 *      en `soi_tool_log` (spec: tool-catalog / "Auditoría inmutable de toda
 *      invocación").
 *
 * Ejecución diferida (aprobación humana, design ADR#2): una SEGUNDA
 * invocación de este mismo endpoint con `tarea_id` en el body. Verifica que
 * la tarea esté 'completada'/aprobada Y que el aprobador sea humano con rol,
 * recupera el GatewayRequest original desde `checklist[0].payload`, y
 * ejecuta+audita el resultado final. NO hay trigger SQL ni función separada.
 *
 * Auth (tres vías, ninguna confía en el body):
 *   - `x-hermes-token: <HERMES_EMAIL_TOKEN>` -> caller_type='mcp' (máquinas:
 *     mcp_server.py proxy, cron jobs).
 *   - JWT de sesión humana (`Authorization: Bearer <jwt>`) validado contra
 *     `auth.users` + rol -> caller_type='humano'.
 *   - `x-sim-run-token: <SIM_RUN_TOKEN>` + `run_id` en el body ->
 *     caller_type='simulador', sandbox SIEMPRE true (spec:
 *     simulador-tool-binding / "Binding sandbox inviolable").
 *
 * Body: {
 *   tool_name: string,
 *   args: object,
 *   correlation_id?: string,
 *   run_id?: string,       // requerido si caller=simulador
 *   tarea_id?: string,     // presente SOLO en la segunda invocación (aprobación)
 *   automation_status?: 'auto' | 'manual' // normalmente resuelto server-side
 *                                          // desde soi_process_contracts; el
 *                                          // caller LLM puede sugerirlo pero
 *                                          // NUNCA se usa solo por venir del
 *                                          // body sin cruzarlo con el contrato.
 * }
 */

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validate } from './jsonSchemaMini.ts'
import { LEGACY_HANDLERS } from './handlers.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const HERMES_TOKEN = Deno.env.get('HERMES_EMAIL_TOKEN') ?? ''
const SIM_RUN_TOKEN = Deno.env.get('SIM_RUN_TOKEN') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-hermes-token, x-sim-run-token',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

// ── Duplicado 1:1: src/modules/tool-gateway/logic/resolverAutonomia.js ─────
// (ver ese archivo para la fuente de verdad con tests Vitest; cualquier
// cambio de regla de negocio DEBE actualizarse en AMBOS lugares).
type Autonomia = { decision: 'ejecutar' | 'pendiente_aprobacion' | 'rechazar'; sandbox: boolean; asignarA?: string }
const NIVELES_VALIDOS = ['read', 'write', 'critical']
const CALLERS_VALIDOS = ['humano', 'llm', 'simulador', 'mcp']
function resolverAutonomia(input: {
  nivelRiesgo: string
  callerType: string
  automationStatus?: string
  tieneTareaAprobada?: boolean
}): Autonomia {
  const { nivelRiesgo, callerType, automationStatus, tieneTareaAprobada = false } = input
  if (!NIVELES_VALIDOS.includes(nivelRiesgo) || !CALLERS_VALIDOS.includes(callerType)) {
    return { decision: 'rechazar', sandbox: false }
  }
  if (nivelRiesgo === 'read') return { decision: 'ejecutar', sandbox: false }
  if (callerType === 'simulador') return { decision: 'ejecutar', sandbox: true }
  if (nivelRiesgo === 'critical') {
    if (callerType === 'humano' && tieneTareaAprobada) return { decision: 'ejecutar', sandbox: false }
    return { decision: 'pendiente_aprobacion', sandbox: false, asignarA: 'DIR' }
  }
  if (callerType === 'humano') {
    return tieneTareaAprobada ? { decision: 'ejecutar', sandbox: false } : { decision: 'pendiente_aprobacion', sandbox: false }
  }
  if (automationStatus === 'auto') return { decision: 'ejecutar', sandbox: false }
  return { decision: 'pendiente_aprobacion', sandbox: false }
}

// ── Duplicado 1:1: src/modules/tool-gateway/logic/sandboxResolver.js ───────
type OperacionSandbox = { tabla: string; payload: Record<string, unknown> }
// deno-lint-ignore no-explicit-any
function resolverSandbox(tool: any, args: Record<string, unknown>, ctx: { runId?: string } = {}): { ok: boolean; operaciones: OperacionSandbox[] } {
  if (!tool || !tool.sandbox_behavior || typeof tool.sandbox_behavior !== 'object') {
    return { ok: false, operaciones: [] }
  }
  const runId = ctx.runId ?? null
  const operaciones: OperacionSandbox[] = []
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
  operaciones.push({
    tabla: 'sim_log',
    payload: { run_id: runId, agente: 'tool-gateway', accion: `tool_call_sandbox:${tool.name}`, payload: args },
  })
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

// ── Duplicado 1:1: src/modules/tool-gateway/logic/construirTareaAprobacion.js
// deno-lint-ignore no-explicit-any
function construirTareaAprobacion(input: {
  toolCall: { tool_name: string; args: Record<string, unknown>; correlation_id?: string }
  logId: string
  departamento: string
  nivelRiesgo: string
  asignarA?: string
}) {
  const { toolCall, logId, departamento, nivelRiesgo, asignarA } = input
  const departamentoFinal = nivelRiesgo === 'critical' ? asignarA ?? 'DIR' : departamento
  const prioridad = nivelRiesgo === 'critical' ? 'critica' : 'alta'
  // deno-lint-ignore no-explicit-any
  const tarea: Record<string, any> = {
    titulo: `[Aprobación Tool] ${toolCall.tool_name}`,
    descripcion: `Aprobacion requerida para ejecutar la tool "${toolCall.tool_name}" (nivel_riesgo: ${nivelRiesgo}).`,
    departamento: departamentoFinal,
    estado: 'pendiente',
    prioridad,
    entidad_tipo: 'tool_call',
    entidad_id: logId,
    entidad_label: toolCall.tool_name,
    checklist: [{ item: 'tool_call_payload', completado: false, payload: toolCall }],
  }
  if (toolCall.correlation_id) tarea.correlation_id = toolCall.correlation_id
  return tarea
}

// ── Auth ─────────────────────────────────────────────────────────────────
type CallerInfo = { callerType: 'humano' | 'llm' | 'simulador' | 'mcp'; callerId: string | null; rol: string | null }

async function resolverCaller(req: Request, sbAdmin: SupabaseClient, body: Record<string, unknown>): Promise<CallerInfo | null> {
  // Vía 1: token de máquina (mcp proxy / cron / llm orquestado server-side).
  const hermesHeader = req.headers.get('x-hermes-token')
  if (hermesHeader && HERMES_TOKEN && hermesHeader === HERMES_TOKEN) {
    return { callerType: 'mcp', callerId: 'mcp-server-soi-portal', rol: null }
  }

  // Vía 2: token de run del simulador — NUNCA se decide por un campo del
  // body enviado por el LLM (spec: "Binding sandbox inviolable por
  // identificación estructural"). Requiere ADEMÁS run_id válido en el body.
  const simHeader = req.headers.get('x-sim-run-token')
  if (simHeader && SIM_RUN_TOKEN && simHeader === SIM_RUN_TOKEN && body.run_id) {
    const { data: run } = await sbAdmin.from('sim_runs').select('id').eq('id', body.run_id).limit(1)
    if (run && run.length > 0) {
      return { callerType: 'simulador', callerId: String(body.run_id), rol: null }
    }
    return null // run_id inválido -> auth falla, no degrada silenciosamente a otro caller
  }

  // Vía 3: JWT humano — valida contra auth.getUser() con el token del header
  // Authorization. El rol NO vive en una tabla de perfiles (no existe
  // `usuarios_perfil` en el proyecto) — es el mismo claim que usa `es_admin()`
  // (20260519_085000_add_admin_rls_policies_phase1.sql: `auth.jwt()->>'role'`),
  // expuesto en `user.app_metadata.role` al leer el usuario desde el JWT.
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice('Bearer '.length)
    const sbUser = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: userData, error } = await sbUser.auth.getUser(jwt)
    if (!error && userData?.user) {
      const rol = (userData.user.app_metadata?.role as string | undefined) ?? null
      return { callerType: 'humano', callerId: userData.user.id, rol }
    }
  }

  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: 'Configuración de Supabase faltante' }, 500)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const sbAdmin = createClient(SUPABASE_URL, SERVICE_ROLE)

  const caller = await resolverCaller(req, sbAdmin, body)
  if (!caller) return json({ error: 'No autorizado' }, 401)

  // ── Camino 2: ejecución diferida (segunda invocación con tarea_id) ──────
  if (body.tarea_id) {
    return await ejecutarAprobacionDiferida(sbAdmin, caller, String(body.tarea_id))
  }

  // ── Camino 1: invocación normal ─────────────────────────────────────────
  const toolName = String(body.tool_name ?? '')
  const args = (body.args && typeof body.args === 'object' ? body.args : {}) as Record<string, unknown>
  const correlationId = body.correlation_id ? String(body.correlation_id) : undefined
  const runId = body.run_id ? String(body.run_id) : undefined

  const startedAt = Date.now()
  let resultado: 'ejecutado' | 'rechazado' | 'pendiente_aprobacion' | 'error' = 'error'
  let detalle = ''
  let tareaId: string | null = null
  let responseBody: unknown = null
  let responseStatus = 200

  try {
    const { data: toolRows, error: toolError } = await sbAdmin
      .from('soi_tool_catalog')
      .select('*')
      .eq('name', toolName)
      .eq('activo', true)
      .limit(1)

    if (toolError || !toolRows || toolRows.length === 0) {
      resultado = 'rechazado'
      detalle = `Tool "${toolName}" no encontrada o inactiva en el catálogo.`
      responseStatus = 404
      responseBody = { error: detalle }
      return json(responseBody, responseStatus)
    }
    const tool = toolRows[0]

    // Validación estricta de inputSchema — rechaza sin ejecución parcial.
    const validacion = validate(tool.input_schema, args)
    if (!validacion.ok) {
      resultado = 'rechazado'
      detalle = `Args inválidos: ${validacion.errors.join('; ')}`
      responseStatus = 400
      responseBody = { error: 'SCHEMA_INVALID', detalle: validacion.errors }
      return json(responseBody, responseStatus)
    }

    // automation_status: se resuelve server-side desde soi_process_contracts
    // si el catálogo/tool declara un process_code asociado; si no hay
    // contrato vinculado, se asume 'manual' (autonomía mínima por defecto).
    let automationStatus = 'manual'
    if (tool.process_code) {
      const { data: contractRows } = await sbAdmin
        .from('soi_process_contracts')
        .select('automation_status')
        .eq('process_code', tool.process_code)
        .limit(1)
      if (contractRows && contractRows.length > 0) automationStatus = contractRows[0].automation_status
    }

    const autonomia = resolverAutonomia({
      nivelRiesgo: tool.nivel_riesgo,
      callerType: caller.callerType,
      automationStatus,
      tieneTareaAprobada: false, // la primera invocación nunca trae tarea ya aprobada
    })

    if (autonomia.decision === 'rechazar') {
      resultado = 'rechazado'
      detalle = 'Configuración de riesgo/caller inválida.'
      responseStatus = 403
      responseBody = { error: 'RISK_LEVEL_BLOCKED', detalle }
      return json(responseBody, responseStatus)
    }

    if (autonomia.decision === 'pendiente_aprobacion') {
      const { data: logRow, error: logError } = await sbAdmin
        .from('soi_tool_log')
        .insert({
          caller_type: caller.callerType,
          caller_id: caller.callerId,
          tool_name: toolName,
          args,
          resultado: 'pendiente_aprobacion',
          detalle: 'Esperando aprobación humana.',
          correlation_id: correlationId ?? null,
          duracion_ms: Date.now() - startedAt,
        })
        .select('id')
        .single()

      if (logError || !logRow) {
        resultado = 'error'
        detalle = `No se pudo auditar la invocación: ${logError?.message}`
        responseStatus = 500
        responseBody = { error: detalle }
        return json(responseBody, responseStatus)
      }

      const tareaPayload = construirTareaAprobacion({
        toolCall: { tool_name: toolName, args, correlation_id: correlationId },
        logId: logRow.id,
        departamento: tool.departamento,
        nivelRiesgo: tool.nivel_riesgo,
        asignarA: autonomia.asignarA,
      })

      const { data: tareaRow, error: tareaError } = await sbAdmin
        .from('tareas_institucionales')
        .insert(tareaPayload)
        .select('id')
        .single()

      if (!tareaError && tareaRow) {
        tareaId = tareaRow.id
        await sbAdmin.from('soi_tool_log').update({ tarea_id: tareaId }).eq('id', logRow.id)
      }

      resultado = 'pendiente_aprobacion'
      detalle = tareaError ? `Tarea de aprobación no se pudo crear: ${tareaError.message}` : 'Tarea de aprobación creada.'
      responseBody = { resultado: 'pendiente_aprobacion', tarea_id: tareaId, log_id: logRow.id }
      return json(responseBody, 202)
    }

    // autonomia.decision === 'ejecutar'
    if (autonomia.sandbox) {
      const sandbox = resolverSandbox(tool, args, { runId })
      if (!sandbox.ok) {
        resultado = 'rechazado'
        detalle = 'sandbox_behavior ausente: la tool no puede ejecutarse en sandbox.'
        responseStatus = 403
        responseBody = { error: 'RISK_LEVEL_BLOCKED', detalle }
        return json(responseBody, responseStatus)
      }
      for (const op of sandbox.operaciones) {
        await sbAdmin.from(op.tabla).insert(op.payload)
      }
      resultado = 'ejecutado'
      detalle = `Ejecutado en sandbox (run_id=${runId}).`
      responseBody = { resultado: 'ejecutado', sandbox: true }
      return json(responseBody, 200)
    }

    // Ejecución real de producción, por handler_type.
    const ejecucion = await despacharHandler(sbAdmin, tool, args)
    resultado = ejecucion.ok ? 'ejecutado' : 'error'
    detalle = ejecucion.mensaje
    responseStatus = ejecucion.ok ? 200 : 502
    responseBody = { resultado: ejecucion.ok ? 'ejecutado' : 'error', mensaje: ejecucion.mensaje, data: ejecucion.data }
    return json(responseBody, responseStatus)
  } catch (err) {
    resultado = 'error'
    detalle = `Excepción no controlada: ${(err as Error).message}`
    responseStatus = 500
    responseBody = { error: detalle }
    return json(responseBody, responseStatus)
  } finally {
    // Audit try/finally: TODA invocación se registra, incluso rechazada/error,
    // salvo el camino 'pendiente_aprobacion' que ya auditó explícitamente
    // arriba (para poder capturar el tarea_id en el mismo insert).
    if (resultado !== 'pendiente_aprobacion') {
      await sbAdmin.from('soi_tool_log').insert({
        caller_type: caller.callerType,
        caller_id: caller.callerId,
        tool_name: toolName,
        args,
        resultado,
        detalle,
        correlation_id: correlationId ?? null,
        tarea_id: tareaId,
        duracion_ms: Date.now() - startedAt,
      })
    }
  }
})

// deno-lint-ignore no-explicit-any
async function despacharHandler(sbAdmin: SupabaseClient, tool: any, args: Record<string, unknown>): Promise<{ ok: boolean; mensaje: string; data?: unknown }> {
  switch (tool.handler_type) {
    case 'mcp-legacy-inline': {
      const handler = LEGACY_HANDLERS[tool.handler_target]
      if (!handler) return { ok: false, mensaje: `Handler legacy "${tool.handler_target}" no implementado.` }
      return await handler(sbAdmin, args)
    }
    case 'rpc': {
      const { data, error } = await sbAdmin.rpc(tool.handler_target, args)
      if (error) return { ok: false, mensaje: error.message }
      return { ok: true, mensaje: 'RPC ejecutada.', data }
    }
    case 'edge': {
      const { data, error } = await sbAdmin.functions.invoke(tool.handler_target, { body: args })
      if (error) return { ok: false, mensaje: error.message }
      return { ok: true, mensaje: 'Edge function invocada.', data }
    }
    case 'rest': {
      // handler_target = "tabla:columna_filtro". Toma el primer arg presente
      // que matchee la columna de filtro (o el primer arg si no matchea) para
      // construir un GET simple contra PostgREST.
      const [tabla, columnaFiltro] = String(tool.handler_target).split(':')
      let query = sbAdmin.from(tabla).select('*')
      if (columnaFiltro && args[columnaFiltro] !== undefined) {
        query = query.eq(columnaFiltro, args[columnaFiltro] as string)
      } else {
        // fallback: usa el primer valor de args disponible como filtro por id
        const primerValor = Object.values(args)[0]
        if (primerValor !== undefined) query = query.eq('id', primerValor as string)
      }
      const { data, error } = await query
      if (error) return { ok: false, mensaje: error.message }
      return { ok: true, mensaje: 'Consulta REST ejecutada.', data }
    }
    default:
      return { ok: false, mensaje: `handler_type "${tool.handler_type}" no soportado.` }
  }
}

async function ejecutarAprobacionDiferida(sbAdmin: SupabaseClient, caller: CallerInfo, tareaId: string): Promise<Response> {
  // Solo un humano con rol puede disparar la ejecución diferida (design ADR#2).
  if (caller.callerType !== 'humano' || !caller.rol) {
    return json({ error: 'Solo un humano autenticado con rol puede aprobar la ejecución diferida.' }, 401)
  }

  const { data: tareaRows, error: tareaError } = await sbAdmin
    .from('tareas_institucionales')
    .select('*')
    .eq('id', tareaId)
    .eq('entidad_tipo', 'tool_call')
    .limit(1)

  if (tareaError || !tareaRows || tareaRows.length === 0) {
    return json({ error: 'Tarea de aprobación no encontrada.' }, 404)
  }
  const tarea = tareaRows[0]

  if (tarea.estado !== 'completada') {
    return json({ error: `La tarea debe estar en estado "completada" (aprobada) para ejecutar. Estado actual: ${tarea.estado}` }, 409)
  }

  const checklistItem = Array.isArray(tarea.checklist)
    ? tarea.checklist.find((c: { item?: string }) => c.item === 'tool_call_payload')
    : null
  if (!checklistItem?.payload) {
    return json({ error: 'La tarea no contiene un payload de tool_call recuperable.' }, 500)
  }

  const toolCall = checklistItem.payload as { tool_name: string; args: Record<string, unknown>; correlation_id?: string }

  const { data: toolRows, error: toolError } = await sbAdmin
    .from('soi_tool_catalog')
    .select('*')
    .eq('name', toolCall.tool_name)
    .eq('activo', true)
    .limit(1)
  if (toolError || !toolRows || toolRows.length === 0) {
    return json({ error: `Tool "${toolCall.tool_name}" ya no existe o está inactiva.` }, 404)
  }
  const tool = toolRows[0]

  const autonomia = resolverAutonomia({
    nivelRiesgo: tool.nivel_riesgo,
    callerType: 'humano',
    tieneTareaAprobada: true,
  })

  const startedAt = Date.now()
  let resultado: 'ejecutado' | 'error' = 'error'
  let detalle = ''
  let responseBody: unknown
  let responseStatus = 200

  try {
    if (autonomia.decision !== 'ejecutar') {
      detalle = 'La matriz de autonomía no autorizó la ejecución diferida.'
      responseStatus = 403
      responseBody = { error: detalle }
      return json(responseBody, responseStatus)
    }
    const ejecucion = await despacharHandler(sbAdmin, tool, toolCall.args)
    resultado = ejecucion.ok ? 'ejecutado' : 'error'
    detalle = ejecucion.mensaje
    responseStatus = ejecucion.ok ? 200 : 502
    responseBody = { resultado, mensaje: ejecucion.mensaje, data: ejecucion.data }
    return json(responseBody, responseStatus)
  } catch (err) {
    detalle = `Excepción no controlada: ${(err as Error).message}`
    responseStatus = 500
    responseBody = { error: detalle }
    return json(responseBody, responseStatus)
  } finally {
    await sbAdmin.from('soi_tool_log').insert({
      caller_type: 'humano',
      caller_id: caller.callerId,
      tool_name: toolCall.tool_name,
      args: toolCall.args,
      resultado,
      detalle,
      correlation_id: toolCall.correlation_id ?? null,
      tarea_id: tareaId,
      duracion_ms: Date.now() - startedAt,
    })
  }
}
