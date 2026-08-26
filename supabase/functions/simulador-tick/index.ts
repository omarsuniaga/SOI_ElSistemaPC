/**
 * Supabase Edge Function: simulador-tick
 *
 * Orquestador del Portal Simulador (sandbox aislado, ninguna tabla de
 * producción se toca). El frontend (`simuladorEngine.js`, Slice 3) llama a
 * esta función una vez por "tick" del reloj virtual, con TODOS los eventos
 * concurrentes del día simulado agrupados en un solo batch.
 *
 * Flujo (ver design: sdd/portal-simulador/design, Data Flow):
 *   1. Carga contratos AGT del/los departamento(s) del batch (asset estático).
 *   2. Carga actores relevantes (ej. representantes morosos si hay evento de cobranza).
 *   3. UNA llamada a Groq (patrón `groq-proxy`: GROQ_API_KEY server-side,
 *      modelo configurable via SIMULADOR_LLM_MODEL (default openai/gpt-oss-120b),
 *      proveedor conmutable groq|openrouter).
 *   4. Parse defensivo de la respuesta (fallback si mal formado -> no explota el tick).
 *   5. INSERT sim_tareas + sim_log (service_role).
 *   6. INSERT sim_outbox con destinatario SIEMPRE forzado a la whitelist
 *      (guard estructural: ver `resolverDestinoSeguro` más abajo).
 *   7. Despacha sim_outbox: whatsapp -> INSERT hermes_whatsapp_queue (JID fijo);
 *      email -> invoca la edge function `send-email` (to=email_destino).
 *   8. Avanza `sim_runs.fecha_actual_virtual` a la fecha del batch procesado.
 *
 * Auth: header `x-hermes-token: <HERMES_EMAIL_TOKEN>` (mismo patrón que
 * `hermes-crear-tarea`) — el simulador es una herramienta de Dirección/
 * desarrollo, reutiliza el token de máquina existente en vez de crear uno
 * nuevo (decisión de implementación, ver Riesgos/Desviaciones en
 * apply-progress).
 *
 * Body: {
 *   run_id: string,
 *   fecha_simulada: string, // ISO date del día simulado a procesar
 *   eventos: Array<{ id, titulo, descripcion?, categoria, departamento_responsable }>
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 * DECISIÓN DE DISEÑO (documentada, no silenciosa): esta edge function NO
 * importa los módulos de `src/modules/simulador/logic/*.js` aunque esa
 * lógica está probada con Vitest en ese árbol. Se DUPLICA aquí en forma
 * mínima porque:
 *   1. Ninguna otra edge function del proyecto (`hermes-crear-tarea`,
 *      `groq-proxy`, `send-email`, etc.) importa desde `src/` — el patrón
 *      establecido es que cada función Deno es 100% self-contained.
 *   2. Deno Deploy no tiene acceso al bundling de Vite; importar rutas
 *      relativas fuera de `supabase/functions/<fn>/` requeriría un paso de
 *      build adicional (esbuild/deno bundle) que el proyecto no tiene
 *      configurado para ninguna función existente.
 * La duplicación se mantiene MÍNIMA y comentada 1:1 contra el archivo
 * fuente de la verdad (que es el que tiene los tests Vitest):
 *   - src/modules/simulador/logic/simuladorSalidaSegura.js
 *   - src/modules/simulador/logic/simuladorLlmParser.js
 *   - src/modules/simulador/logic/simuladorPromptBuilder.js
 *   - src/modules/simulador/logic/simuladorCobranza.js
 *   - src/data/simuladorAgentContracts.js
 * Cualquier cambio de regla de negocio DEBE actualizarse en ambos lugares.
 * ────────────────────────────────────────────────────────────────────────
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''
const HERMES_TOKEN = Deno.env.get('HERMES_EMAIL_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SIM_RUN_TOKEN = Deno.env.get('SIM_RUN_TOKEN') ?? ''
// llama-3.3-70b-versatile fue deprecado por Groq (shutdown 08/16/26); reemplazo
// oficial recomendado: openai/gpt-oss-120b. Configurable via env var.
const SIMULADOR_LLM_MODEL = Deno.env.get('SIMULADOR_LLM_MODEL')?.trim() || 'openai/gpt-oss-120b'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hermes-token',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

// ── Duplicado mínimo: src/data/simuladorAgentContracts.js ──────────────────
const DEPARTAMENTOS_SIN_AGT_DEDICADO = ['ADM', 'LOG', 'TECNICO']
const AGENT_CONTRACTS: Record<string, { rol: string; responsabilidades: string[]; tono: string }> = {
  DIR: { rol: 'Copiloto de Dirección Ejecutiva', responsabilidades: ['Crisis institucionales', 'Bienestar estudiantil', 'Veto por saturación'], tono: 'Ejecutivo, corto y accionable.' },
  ACM: { rol: 'Copiloto Académico Musical', responsabilidades: ['Evaluaciones y audiciones', 'Seguimiento de rendimiento', 'Minutas académicas'], tono: 'Pedagógico y objetivo.' },
  FIN: { rol: 'Copiloto Financiero y Patrimonial', responsabilidades: ['Mora y cobranza', 'Caja y compras', 'Habilitación/bloqueo financiero'], tono: 'Formal y preciso.' },
  COM: { rol: 'Copiloto de Comunicaciones Institucionales', responsabilidades: ['Comunicados institucionales', 'Mensajería a familias', 'Campañas'], tono: 'Institucional y cálido.' },
  ATN: { rol: 'Copiloto de Atención y Expedientes', responsabilidades: ['Expedientes y asistencia', 'Alertas médicas', 'Bloqueo documental'], tono: 'Discreto y preciso.' },
  GENERICO: { rol: 'Agente genérico operativo (fallback)', responsabilidades: ['Registrar solicitud operativa', 'Crear tarea de seguimiento estándar'], tono: 'Neutro y operativo.' },
}
function resolverContratoPorDepartamento(codigo: string) {
  if (DEPARTAMENTOS_SIN_AGT_DEDICADO.includes(codigo)) return AGENT_CONTRACTS.GENERICO
  return AGENT_CONTRACTS[codigo] || AGENT_CONTRACTS.GENERICO
}

// ── Duplicado mínimo: src/modules/simulador/logic/simuladorPromptBuilder.js ─
function ordenarEventosDeterministico<T extends { id: string; fecha_inicio: string }>(eventos: T[]): T[] {
  return [...eventos].sort((a, b) => {
    const fa = new Date(a.fecha_inicio).getTime()
    const fb = new Date(b.fecha_inicio).getTime()
    if (fa !== fb) return fa - fb
    return String(a.id).localeCompare(String(b.id))
  })
}

const SYSTEM_HEADER = `Sos el orquestador de agentes departamentales de "El Sistema Punta Cana"
dentro de un SIMULACRO institucional (sandbox, ningún dato es real). Para
cada evento del batch de "eventos" en el mensaje del usuario, aplicá el
contrato del departamento responsable (rol, responsabilidades, tono) y
decidí qué tareas crear y qué mensajes enviar (whatsapp/email).

Reglas:
- Si el evento es de cobranza, filtrá SOLO actores con estado_pago = "moroso"
  entre los "actores_relevantes"; nunca notifiques a un actor "solvente".
- Todo mensaje de salida es SIMULADO: nunca inventes destinatarios reales,
  usá el actor ficticio provisto.
- Respondé SOLO un JSON array, un objeto por evento, con esta forma exacta:
  [{
    "sim_calendario_id": "<id del evento>",
    "departamento": "<código de departamento>",
    "tareas": [{"titulo": "...", "descripcion": "...", "prioridad": "baja|media|alta|critica"}],
    "mensajes": [{"canal": "whatsapp|email", "destinatario_original": "...", "asunto": "...", "cuerpo": "..."}],
    "resumen_accion": "resumen breve para mostrar en la animación"
  }]
- No incluyas texto fuera del JSON. No uses fences de markdown.`

function construirPromptTick(eventos: any[], actoresRelevantes: any[]) {
  const eventosOrdenados = ordenarEventosDeterministico(eventos)
  const departamentos = [...new Set(eventosOrdenados.map((e) => e.departamento_responsable))]
  const bloques = departamentos.map((depto) => {
    const c = resolverContratoPorDepartamento(depto)
    return `### Departamento ${depto}\nRol: ${c.rol}\nResponsabilidades: ${c.responsabilidades.join(', ')}\nTono: ${c.tono}`
  })
  return {
    system: `${SYSTEM_HEADER}\n\n${bloques.join('\n\n')}`,
    user: JSON.stringify({ eventos: eventosOrdenados, actores_relevantes: actoresRelevantes || [] }),
  }
}

// ── Duplicado mínimo: src/modules/simulador/logic/simuladorLlmParser.js ────
// Espejo del enum SQL `soi_departamento`. 'ATN' NO va aquí: no existe en el
// enum y el INSERT en sim_tareas fallaría; degradar 'ATN' a DIR es intencional.
const DEPARTAMENTOS_VALIDOS = ['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO']
const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'critica']
const CANALES_VALIDOS = ['whatsapp', 'email']

function parseAgentDecisions(raw: string | null | undefined) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: false, decisiones: [] as any[], accion: 'error_parseo_llm', error: 'Respuesta vacía del LLM' }
  }
  let parsed: any
  try {
    let texto = String(raw).trim()
    texto = texto.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    const match = texto.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
    parsed = JSON.parse(match ? match[0] : texto)
  } catch (err) {
    return { ok: false, decisiones: [] as any[], accion: 'error_parseo_llm', error: `JSON inválido: ${(err as Error).message}` }
  }
  const lista = Array.isArray(parsed) ? parsed : [parsed]
  const decisiones = lista
    .map((d: any) => {
      if (!d || typeof d !== 'object' || !d.sim_calendario_id) return null
      const tareas = Array.isArray(d.tareas)
        ? d.tareas
            .filter((t: any) => t && typeof t === 'object')
            .map((t: any) => ({
              titulo: (t.titulo || 'Tarea generada por simulación').toString().trim(),
              descripcion: (t.descripcion || '').toString().trim(),
              prioridad: PRIORIDADES_VALIDAS.includes(t.prioridad) ? t.prioridad : 'media',
            }))
        : []
      const mensajes = Array.isArray(d.mensajes)
        ? d.mensajes
            .filter((m: any) => m && CANALES_VALIDOS.includes(m.canal))
            .map((m: any) => ({
              canal: m.canal,
              destinatario_original: (m.destinatario_original ?? '').toString().trim(),
              asunto: m.asunto ? String(m.asunto).trim() : undefined,
              cuerpo: (m.cuerpo || '').toString().trim(),
            }))
        : []
      return {
        sim_calendario_id: d.sim_calendario_id,
        departamento: DEPARTAMENTOS_VALIDOS.includes(d.departamento) ? d.departamento : 'DIR',
        tareas,
        mensajes,
        resumen_accion: (d.resumen_accion || '').toString().trim(),
      }
    })
    .filter(Boolean)
  return { ok: true, decisiones }
}

// ── Duplicado mínimo: src/modules/simulador/logic/simuladorSalidaSegura.js ─
function construirOutboxSeguro(params: {
  runId: string
  canal: 'whatsapp' | 'email'
  destinatarioOriginal: unknown
  asunto?: string
  mensaje: string
  config: { whatsapp?: string; email?: string }
}) {
  const { runId, canal, destinatarioOriginal, asunto, mensaje, config } = params
  if (!['whatsapp', 'email'].includes(canal)) {
    throw new Error(`construirOutboxSeguro: canal no soportado "${canal}".`)
  }
  if (!config || typeof config[canal] !== 'string' || !config[canal]!.trim()) {
    throw new Error(`construirOutboxSeguro: falta config de whitelist para el canal "${canal}".`)
  }
  const original =
    destinatarioOriginal === null || destinatarioOriginal === undefined || String(destinatarioOriginal).trim() === ''
      ? 'desconocido'
      : String(destinatarioOriginal).trim()
  // El destino final SIEMPRE proviene de `config`, nunca del valor original.
  const destinatarioRedirigido = config[canal]!
  return {
    run_id: runId,
    canal,
    destinatario_original: original,
    destinatario_redirigido: destinatarioRedirigido,
    asunto: asunto ?? null,
    mensaje: `[SIMULACRO → destinatario original: ${original}] ${mensaje}`,
    estado: 'pendiente' as const,
  }
}

// ── Duplicado mínimo: src/modules/simulador/logic/simuladorCobranza.js ─────
function filtrarActoresMorosos(actores: any[]) {
  if (!Array.isArray(actores)) return []
  return actores.filter((a) => a && a.tipo === 'representante' && a.estado_pago === 'moroso')
}

// ── Duplicado 1:1: src/modules/simulador/logic/simuladorToolCatalogPrompt.js
// (Slice 4 — feature flag sim_runs.usar_tool_gateway). Ver ese archivo para
// la fuente de verdad con tests Vitest; cualquier cambio de regla de negocio
// DEBE actualizarse en AMBOS lugares.
function construirSubsetCatalogoPrompt(catalogo: any[]) {
  const filas = Array.isArray(catalogo) ? catalogo : []
  const tools = filas
    .filter((row) => row && row.sandbox_behavior && typeof row.sandbox_behavior === 'object')
    .map((row) => ({ name: row.name, descripcion: row.descripcion, nivel_riesgo: row.nivel_riesgo, input_schema: row.input_schema }))

  if (tools.length === 0) {
    return {
      tools,
      vacio: true,
      promptBlock: 'No hay tools disponibles en modo sandbox para este simulacro. Respondé con el formato JSON legacy de tareas/mensajes.',
    }
  }

  const promptBlock =
    `Además de las tareas/mensajes, podés invocar las siguientes tools disponibles en modo sandbox ` +
    `(ejecutan sobre datos simulados, nunca sobre producción):\n` +
    JSON.stringify(tools, null, 2) +
    `\n\nSi decidís usar una tool, respondé SOLO un JSON array de tool_calls con la forma ` +
    `[{"tool_name": "<name>", "args": {...}}], usando exclusivamente los nombres de la lista anterior.`

  return { tools, vacio: false, promptBlock }
}

// ── Duplicado 1:1: src/modules/simulador/logic/simuladorToolCallParser.js ──
function parseToolCalls(raw: string | null | undefined) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: false, toolCalls: [] as Array<{ tool_name: string; args: Record<string, unknown> }>, error: 'Respuesta vacía del LLM' }
  }
  let parsed: any
  try {
    let texto = String(raw).trim()
    texto = texto.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    const match = texto.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
    parsed = JSON.parse(match ? match[0] : texto)
  } catch (err) {
    return { ok: false, toolCalls: [] as Array<{ tool_name: string; args: Record<string, unknown> }>, error: `JSON inválido: ${(err as Error).message}` }
  }
  const lista = Array.isArray(parsed) ? parsed : [parsed]
  const toolCalls = lista
    .map((entry: any) => {
      if (!entry || typeof entry !== 'object') return null
      const toolName = entry.tool_name
      if (!toolName || typeof toolName !== 'string' || toolName.trim() === '') return null
      const args = entry.args && typeof entry.args === 'object' ? entry.args : {}
      return { tool_name: toolName.trim(), args }
    })
    .filter(Boolean) as Array<{ tool_name: string; args: Record<string, unknown> }>
  if (toolCalls.length === 0) {
    return { ok: false, toolCalls: [], error: 'Ninguna tool_call válida en la respuesta del LLM' }
  }
  return { ok: true, toolCalls }
}

// ── Llamada al LLM (patrón groq-proxy: server-side, modelo fijo, proveedor conmutable) ─
async function llamarLlm(system: string, user: string, provider: string) {
  if (provider === 'openrouter') {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY no configurada')
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'SOI Simulador' },
      body: JSON.stringify({
        model: SIMULADOR_LLM_MODEL,
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `OpenRouter error ${res.status}`)
    return data.choices?.[0]?.message?.content || ''
  }

  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY no configurada')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: SIMULADOR_LLM_MODEL,
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `GROQ error ${res.status}`)
  return data.choices?.[0]?.message?.content || ''
}

// ── Invocación del tool-gateway como caller=simulador (Slice 4) ────────────
// Identificación estructural del caller: header `x-sim-run-token` + `run_id`
// en el body (spec: simulador-tool-binding / "Binding sandbox inviolable por
// identificación estructural" — NUNCA un campo enviado por el LLM). El
// gateway valida el run_id contra `sim_runs` antes de confiar en el caller.
async function ejecutarToolCallViaGateway(toolCall: { tool_name: string; args: Record<string, unknown> }, runId: string) {
  if (!SIM_RUN_TOKEN) {
    return { ok: false, mensaje: 'SIM_RUN_TOKEN no configurado: no se puede invocar tool-gateway desde el simulador.' }
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/tool-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sim-run-token': SIM_RUN_TOKEN,
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
      body: JSON.stringify({ tool_name: toolCall.tool_name, args: toolCall.args, run_id: runId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, mensaje: data?.error || data?.detalle || `tool-gateway respondió ${res.status}` }
    }
    return { ok: true, mensaje: data?.detalle || 'Ejecutado en sandbox vía tool-gateway.', data }
  } catch (err) {
    return { ok: false, mensaje: `No se pudo contactar tool-gateway: ${(err as Error).message}` }
  }
}

type TickBody = {
  run_id?: string
  fecha_simulada?: string
  eventos?: Array<{
    id: string
    titulo: string
    descripcion?: string
    categoria: string
    departamento_responsable: string
    fecha_inicio: string
  }>
}

// Helper para logging detallado
async function logDetallado(sb: any, runId: string, fechaSimulada: string, accion: string, payload: any) {
  try {
    await sb.from('sim_log').insert({
      run_id: runId,
      fecha_simulada: fechaSimulada,
      departamento: 'DIR',
      agente: 'orquestador',
      accion,
      payload,
    })
  } catch (err) {
    console.error(`[LOG ERROR] No se pudo registrar ${accion}:`, err)
  }
}

async function verifyAuth(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  if (authHeader) {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { error } = await client.auth.getUser()
    if (!error) return true
  }
  const hermesToken = req.headers.get('x-hermes-token') ?? ''
  return !!(HERMES_TOKEN && hermesToken === HERMES_TOKEN)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
  if (!await verifyAuth(req)) {
    return json({ error: 'No autorizado' }, 401)
  }

  let body: TickBody
  try {
    body = await req.json()
  } catch (err) {
    return json({ error: `JSON inválido: ${(err as Error).message}` }, 400)
  }

  const runId = body.run_id
  const fechaSimulada = body.fecha_simulada
  const eventos = Array.isArray(body.eventos) ? body.eventos : []

  if (!runId) return json({ error: 'Falta "run_id"' }, 400)
  if (!fechaSimulada) return json({ error: 'Falta "fecha_simulada"' }, 400)
  if (eventos.length === 0) return json({ error: 'El batch "eventos" no puede estar vacío' }, 400)

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE)

  // LOG: inicio del tick
  await logDetallado(sb, runId, fechaSimulada, 'log_tick_inicio', {
    eventos_count: eventos.length,
    timestamp: new Date().toISOString(),
  })

  // 1. Config de whitelist + proveedor LLM (sim_config, una fila por canal)
  await logDetallado(sb, runId, fechaSimulada, 'log_leyendo_sim_config', {})
  const { data: configRows, error: configErr } = await sb.from('sim_config').select('canal, destino, proveedor_llm, activo')
  if (configErr) {
    await logDetallado(sb, runId, fechaSimulada, 'error_sim_config', { error: configErr.message })
    return json({ error: `No se pudo leer sim_config: ${configErr.message}` }, 500)
  }

  const config: { whatsapp?: string; email?: string } = {}
  let provider = 'groq'
  for (const row of configRows || []) {
    if (row.activo === false) continue
    if (row.canal === 'whatsapp') config.whatsapp = row.destino
    if (row.canal === 'email') config.email = row.destino
    provider = row.proveedor_llm || provider
  }
  if (!config.whatsapp || !config.email) {
    await logDetallado(sb, runId, fechaSimulada, 'error_sim_config_incompleta', { config })
    return json({ error: 'sim_config incompleta: faltan destinos whitelist para whatsapp/email' }, 500)
  }

  await logDetallado(sb, runId, fechaSimulada, 'log_sim_config_ok', { provider, whatsapp: config.whatsapp, email: config.email })

  // 1b. Feature flag por-run (Slice 4, migración 20260711): si está activo,
  // el prompt pide tool_calls contra el subset del catálogo con
  // sandbox_behavior definido; si está OFF, flujo legacy intacto (spec:
  // mcp-proxy / "Compatibilidad con Simulador existente" — fallback sin
  // interrumpir el tick si el catálogo/gateway no responden).
  const { data: runRow, error: runErr } = await sb.from('sim_runs').select('usar_tool_gateway').eq('id', runId).single()
  const usarToolGateway = !runErr && runRow?.usar_tool_gateway === true

  let catalogoPrompt = { tools: [] as any[], vacio: true, promptBlock: '' }
  if (usarToolGateway) {
    const { data: catalogoRows, error: catalogoErr } = await sb
      .from('soi_tool_catalog')
      .select('name, descripcion, nivel_riesgo, input_schema, sandbox_behavior')
      .eq('activo', true)
    if (catalogoErr) {
      // Catálogo no disponible -> cae al parser JSON legacy (spec: "Catálogo no disponible").
      await logDetallado(sb, runId, fechaSimulada, 'error_tool_catalog_no_disponible', { error: catalogoErr.message })
    } else {
      catalogoPrompt = construirSubsetCatalogoPrompt(catalogoRows || [])
    }
    await logDetallado(sb, runId, fechaSimulada, 'log_tool_gateway_flag_activo', { tools_disponibles: catalogoPrompt.tools.length })
  }

  // 2. Actores relevantes: si hay algún evento de cobranza/corte, traer morosos.
  const requiereCobranza = eventos.some((e) => e.categoria === 'corte')
  await logDetallado(sb, runId, fechaSimulada, 'log_requiere_cobranza', { requiereCobranza })
  let actoresRelevantes: any[] = []
  if (requiereCobranza) {
    await logDetallado(sb, runId, fechaSimulada, 'log_leyendo_actores_morosos', {})
    const { data: actores, error: actoresErr } = await sb
      .from('sim_actores')
      .select('tipo, nombre_ficticio, estado_pago, metadata')
      .eq('run_id', runId)
    if (actoresErr) {
      await logDetallado(sb, runId, fechaSimulada, 'error_leyendo_actores', { error: actoresErr.message })
      return json({ error: `No se pudo leer sim_actores: ${actoresErr.message}` }, 500)
    }
    actoresRelevantes = filtrarActoresMorosos(actores || [])
    await logDetallado(sb, runId, fechaSimulada, 'log_actores_morosos_cargados', { count: actoresRelevantes.length })
  }

  // 3. UNA llamada Groq/OpenRouter con el batch completo de eventos.
  await logDetallado(sb, runId, fechaSimulada, 'log_construyendo_prompt', { departamentos_unicos: [...new Set(eventos.map((e) => e.departamento_responsable))].length })
  const { system: systemBase, user } = construirPromptTick(eventos, actoresRelevantes)
  // Slice 4: si el flag está activo y hay tools sandbox disponibles, se
  // extiende el system prompt pidiendo tool_calls (además del formato legacy).
  const system = usarToolGateway && !catalogoPrompt.vacio ? `${systemBase}\n\n${catalogoPrompt.promptBlock}` : systemBase
  let rawRespuesta = ''
  try {
    await logDetallado(sb, runId, fechaSimulada, 'log_llamando_llm', { provider, user_length: user.length })
    rawRespuesta = await llamarLlm(system, user, provider)
    await logDetallado(sb, runId, fechaSimulada, 'log_respuesta_llm_recibida', { response_length: rawRespuesta.length, response_start: rawRespuesta.substring(0, 200) })
  } catch (err) {
    const errorMsg = (err as Error).message
    await logDetallado(sb, runId, fechaSimulada, 'error_llm', { error: errorMsg })
    return json({ ok: false, error: `Llamada LLM falló: ${errorMsg}` }, 502)
  }

  // 3b. Slice 4: si el flag está activo, intenta primero interpretar la
  // respuesta como tool_calls. Si no hay ninguna válida, cae al parser JSON
  // legacy sin interrumpir el tick (fallback documentado, spec: mcp-proxy /
  // "Compatibilidad con Simulador existente").
  if (usarToolGateway && !catalogoPrompt.vacio) {
    const toolCallResult = parseToolCalls(rawRespuesta)
    if (toolCallResult.ok) {
      await logDetallado(sb, runId, fechaSimulada, 'log_tool_calls_detectadas', { count: toolCallResult.toolCalls.length })
      const resultados: any[] = []
      for (const toolCall of toolCallResult.toolCalls) {
        const ejecucion = await ejecutarToolCallViaGateway(toolCall, runId)
        resultados.push({ tool_name: toolCall.tool_name, ok: ejecucion.ok, mensaje: ejecucion.mensaje })
        await logDetallado(sb, runId, fechaSimulada, 'log_tool_call_ejecutada', {
          tool_name: toolCall.tool_name,
          ok: ejecucion.ok,
          mensaje: ejecucion.mensaje,
        })
      }
      const { error: updateErrToolCalls } = await sb.from('sim_runs').update({ fecha_actual_virtual: fechaSimulada }).eq('id', runId)
      if (updateErrToolCalls) {
        await logDetallado(sb, runId, fechaSimulada, 'error_avanzando_reloj', { error: updateErrToolCalls.message })
        return json({ ok: false, error: `No se pudo avanzar el reloj: ${updateErrToolCalls.message}` }, 500)
      }
      await logDetallado(sb, runId, fechaSimulada, 'log_tick_completado_tool_calls', { tool_calls_ejecutadas: resultados.length })
      return json({ ok: true, fecha_simulada: fechaSimulada, modo: 'tool_calls', tool_calls_ejecutadas: resultados.length, resultados })
    }
    await logDetallado(sb, runId, fechaSimulada, 'log_tool_calls_no_detectadas', { error: toolCallResult.error })
    // Sin tool_calls válidas -> continúa al parser legacy abajo (no interrumpe el tick).
  }

  // 4. Parse defensivo — nunca explota, degrada a fallback.
  await logDetallado(sb, runId, fechaSimulada, 'log_parseando_respuesta_llm', {})
  const parseResult = parseAgentDecisions(rawRespuesta)
  if (!parseResult.ok) {
    await logDetallado(sb, runId, fechaSimulada, 'error_parseo_llm', { error: parseResult.error, raw_snippet: rawRespuesta.slice(0, 500) })
    // Fallback: tarea genérica de revisión manual por cada evento del batch, para no perder el tick.
    await logDetallado(sb, runId, fechaSimulada, 'log_creando_tareas_fallback', { eventos_count: eventos.length })
    for (const evento of eventos) {
      await sb.from('sim_tareas').insert({
        run_id: runId,
        event_id: evento.id,
        titulo: `Revisar evento manualmente: ${evento.titulo}`,
        descripcion: 'La respuesta del LLM no pudo interpretarse; requiere revisión manual.',
        departamento: DEPARTAMENTOS_VALIDOS.includes(evento.departamento_responsable) ? evento.departamento_responsable : 'DIR',
        prioridad: 'media',
      })
    }
    return json({ ok: false, accion: 'error_parseo_llm', eventos_con_fallback: eventos.length })
  }
  await logDetallado(sb, runId, fechaSimulada, 'log_parse_ok', { decisiones_count: parseResult.decisiones.length })

  // 5-6. Persistir tareas, log y outbox (seguro) por cada decisión.
  const tareasCreadas: any[] = []
  const logsCreados: any[] = []
  const outboxCreados: any[] = []

  await logDetallado(sb, runId, fechaSimulada, 'log_persistiendo_decisiones', { decisiones_count: parseResult.decisiones.length })

  for (const decision of parseResult.decisiones) {
    try {
      for (const tarea of decision.tareas) {
        const { data, error: tareaErr } = await sb
          .from('sim_tareas')
          .insert({
            run_id: runId,
            event_id: decision.sim_calendario_id,
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            departamento: decision.departamento,
            prioridad: tarea.prioridad,
          })
          .select('id')
          .single()
        if (tareaErr) {
          await logDetallado(sb, runId, fechaSimulada, 'error_insertando_tarea', { error: tareaErr.message, departamento: decision.departamento })
        } else if (data) {
          tareasCreadas.push(data.id)
        }
      }
    } catch (err) {
      await logDetallado(sb, runId, fechaSimulada, 'error_tareas_try_catch', { error: (err as Error).message })
    }

    const contrato = resolverContratoPorDepartamento(decision.departamento)
    const usoFallback = !['DIR', 'ACM', 'FIN', 'COM', 'ATN'].includes(decision.departamento)

    const { data: logRow } = await sb
      .from('sim_log')
      .insert({
        run_id: runId,
        fecha_simulada: fechaSimulada,
        departamento: decision.departamento,
        agente: usoFallback ? 'fallback_generico' : `AGT-${decision.departamento}`,
        accion: 'tarea_creada',
        evento_id: decision.sim_calendario_id,
        payload: { resumen_accion: decision.resumen_accion, rol: contrato.rol, fallback_contract: usoFallback },
      })
      .select('id')
      .single()
    if (logRow) logsCreados.push(logRow.id)

    // 6-7. Mensajes: SIEMPRE pasan por el guard de salida segura antes de cualquier despacho.
    for (const mensaje of decision.mensajes) {
      const filaOutbox = construirOutboxSeguro({
        runId,
        canal: mensaje.canal,
        destinatarioOriginal: mensaje.destinatario_original,
        asunto: mensaje.asunto,
        mensaje: mensaje.cuerpo,
        config,
      })

      const { data: outboxRow, error: outboxErr } = await sb.from('sim_outbox').insert(filaOutbox).select('id').single()
      if (outboxErr || !outboxRow) continue
      outboxCreados.push(outboxRow.id)

      // Despacho real (siempre al destino redirigido, jamás al original).
      try {
        if (filaOutbox.canal === 'whatsapp') {
          await sb.from('hermes_whatsapp_queue').insert({
            jid: `${filaOutbox.destinatario_redirigido.replace(/\D/g, '')}@s.whatsapp.net`,
            mensaje: filaOutbox.mensaje,
          })
        } else if (filaOutbox.canal === 'email') {
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-hermes-token': HERMES_TOKEN },
            body: JSON.stringify({
              to: filaOutbox.destinatario_redirigido,
              subject: filaOutbox.asunto || 'Simulacro — Portal Simulador',
              text: filaOutbox.mensaje,
            }),
          })
        }
        await sb.from('sim_outbox').update({ estado: 'enviado', procesado_at: new Date().toISOString() }).eq('id', outboxRow.id)
      } catch (err) {
        await sb
          .from('sim_outbox')
          .update({ estado: 'fallido', error_msg: (err as Error).message })
          .eq('id', outboxRow.id)
      }
    }
  }

  // 8. Avanzar el reloj virtual del run a la fecha simulada procesada.
  await logDetallado(sb, runId, fechaSimulada, 'log_avanzando_reloj', { fecha_actual_virtual: fechaSimulada })
  const { error: updateErr } = await sb.from('sim_runs').update({ fecha_actual_virtual: fechaSimulada }).eq('id', runId)
  if (updateErr) {
    await logDetallado(sb, runId, fechaSimulada, 'error_avanzando_reloj', { error: updateErr.message })
    return json({ ok: false, error: `No se pudo avanzar el reloj: ${updateErr.message}` }, 500)
  }

  await logDetallado(sb, runId, fechaSimulada, 'log_tick_completado', {
    tareas_creadas: tareasCreadas.length,
    outbox_creados: outboxCreados.length,
    decisiones_procesadas: parseResult.decisiones.length,
  })

  return json({
    ok: true,
    fecha_simulada: fechaSimulada,
    decisiones_procesadas: parseResult.decisiones.length,
    tareas_creadas: tareasCreadas.length,
    logs_creados: logsCreados.length,
    outbox_creados: outboxCreados.length,
  })
})
