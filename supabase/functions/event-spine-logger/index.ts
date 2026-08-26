/**
 * SOI Event Spine Consumer — Phase 2 Implementation
 *
 * This Edge Function polls soi_eventos WHERE procesado = false,
 * processes each event according to its tipo via handlers (R1–R5),
 * then marks as procesado = true.
 *
 * Handler Routing:
 * - asistencia.falta_injustificada → R1 (absence escalation)
 * - tarea.vencida → R2 (task escalation to DIR)
 * - periodo.cerrado → R3 (closure report generation)
 * - sesion.creada → R4 (attendance reminder if 24h gap)
 * - justificacion.rechazada → R5 (rejection notification)
 *
 * Spec Requirements: AC-CON-01 through AC-CON-06
 *
 * Deployment:
 *   supabase functions deploy event-spine-logger --project-ref {project}
 *
 * Scheduling (Phase 3):
 *   Schedule via pg_cron migration: every 10 min on weekdays 07:00-21:00
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento, HandlerResult } from './types.ts'
import { handleAusenciaAcumulada } from './handlers/r1-ausencia-acumulada.ts'
import { handleTareaVencida } from './handlers/r2-tarea-vencida.ts'
import { handlePeriodoCerrado } from './handlers/r3-periodo-cerrado.ts'
import { handleSesionCreada } from './handlers/r4-sesion-sin-asistencia.ts'
import { handleJustificacionRechazada } from './handlers/r5-justificacion-rechazada.ts'

const BATCH_SIZE = 100
const INTERNAL_KEY = Deno.env.get('INTERNAL_KEY') || 'INTERNAL_KEY_NOT_SET'

// Initialize Supabase service client (bypass RLS)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

/**
 * Route an event to the appropriate handler based on its tipo.
 *
 * Spec Requirement: AC-CON-02 (routing)
 * Phase 3 Enhancement: Load rule metadata from hermes_reactive_rules before routing
 *
 * Rule Loading (Spec AC-RUL-01):
 * 1. Determine applicable rule_type (R1-R5) based on event tipo
 * 2. Query hermes_reactive_rules WHERE rule_type=? AND departamento=?
 * 3. If rule.enabled=false: skip handler, log skip, return { handled: false }
 * 4. If rule not found: treat as enabled=true (backward-compat fallback)
 * 5. Pass groq_enabled flag from rule.conditions_json to handler
 *
 * @throws {Error} if handler throws (will be caught by processBatch)
 * @returns {HandlerResult} { handled: boolean, taskId?: string, reason?: string }
 */
async function routeAndProcessEvent(
  evento: SoiEvento
): Promise<HandlerResult> {
  console.log(`[EVENT_ROUTE] tipo=${evento.tipo} id=${evento.id}`)

  // Map event tipo to rule_type and target department
  // Using spec: R1-ACM, R2-DIR, R3-ACM, R4-ACM, R5-ADM
  const ruleMapping: Record<string, { ruleType: string; departamento: string }> = {
    'asistencia.falta_injustificada': { ruleType: 'R1', departamento: 'ACM' },
    'tarea.vencida': { ruleType: 'R2', departamento: 'DIR' },
    'periodo.cerrado': { ruleType: 'R3', departamento: 'ACM' },
    'sesion.creada': { ruleType: 'R4', departamento: 'ACM' },
    'justificacion.rechazada': { ruleType: 'R5', departamento: 'ADM' },
  }

  const mapping = ruleMapping[evento.tipo]
  if (!mapping) {
    // Unknown event type: gracefully skip
    console.warn(`[UNKNOWN_EVENT_TYPE] tipo=${evento.tipo} id=${evento.id}`)
    return { handled: false }
  }

  const { ruleType, departamento } = mapping

  // Query rule metadata from hermes_reactive_rules
  const { data: rule, error: ruleError } = await supabase
    .from('hermes_reactive_rules')
    .select('enabled, conditions_json')
    .eq('rule_type', ruleType)
    .eq('departamento', departamento)
    .maybeSingle()

  // Handle rule query errors gracefully
  if (ruleError && ruleError.code !== 'PGRST116') {
    // PGRST116 = no rows (expected if rule doesn't exist)
    console.warn(
      `[RULE_QUERY_ERROR] ruleType=${ruleType} dept=${departamento}: ${ruleError.message}`
    )
    // Continue with fallback behavior: treat as enabled=true
  }

  // Check if rule is disabled
  if (rule && !rule.enabled) {
    console.log(`[RULE_DISABLED] ${ruleType} disabled for ${departamento}`)
    return { handled: false, reason: 'rule_disabled' }
  }

  // Extract groq_enabled flag from conditions_json (default false)
  const groqEnabled = (rule?.conditions_json as any)?.groq_enabled ?? false

  // Route to handler with rule metadata
  switch (evento.tipo) {
    case 'asistencia.falta_injustificada':
      return await handleAusenciaAcumulada(evento, supabase, { groqEnabled })
    case 'tarea.vencida':
      return await handleTareaVencida(evento, supabase, { groqEnabled })
    case 'periodo.cerrado':
      return await handlePeriodoCerrado(evento, supabase, { groqEnabled })
    case 'sesion.creada':
      return await handleSesionCreada(evento, supabase, { groqEnabled })
    case 'justificacion.rechazada':
      return await handleJustificacionRechazada(evento, supabase, { groqEnabled })
    default:
      // Should not reach here (already checked above)
      return { handled: false }
  }
}

/**
 * Process a single event: route, execute handler, mark as processed.
 *
 * Spec Requirement: AC-CON-06 (error isolation)
 *
 * Error Handling:
 * - If handler throws: error logged, event NOT marked procesado=true (will retry next cycle)
 * - If handler returns { handled: false }: no action taken, event marked procesado=true (graceful skip)
 * - If handler returns { handled: true }: event marked procesado=true with task tracking
 *
 * @returns true if event was successfully processed and marked, false if error occurred
 */
async function processEvent(evento: SoiEvento): Promise<boolean> {
  try {
    // Route to handler
    const result = await routeAndProcessEvent(evento)

    // Mark event as processed (regardless of handled status)
    // unknown event types or unmet conditions are gracefully skipped
    const { error: updateError } = await supabase
      .from('soi_eventos')
      .update({ procesado: true })
      .eq('id', evento.id)

    if (updateError) {
      console.error(`[UPDATE_FAILED] evento ${evento.id}: ${updateError.message}`)
      return false
    }

    if (result.handled) {
      console.log(`[EVENT_HANDLED] tipo=${evento.tipo} taskId=${result.taskId}`)
    } else {
      console.log(`[EVENT_SKIPPED] tipo=${evento.tipo} (condition not met)`)
    }

    return true
  } catch (error) {
    // Error: do NOT mark procesado=true; event will retry next cycle
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[EVENT_ERROR] evento ${evento.id}: ${errorMsg}`)
    return false
  }
}

/**
 * Fetch and process a batch of unprocessed events.
 *
 * Spec Requirement: AC-CON-01 (batch ≤100 events)
 *
 * Returns: { processed: number, errors: number, skipped: number, timestamp: string }
 */
async function processBatch(): Promise<{
  processed: number
  errors: number
  skipped: number
  timestamp: string
}> {
  const result = { processed: 0, errors: 0, skipped: 0, timestamp: new Date().toISOString() }

  try {
    // Fetch unprocessed events (FIFO by created_at)
    // Spec Requirement: AC-CON-01 (batch ≤100)
    const { data: eventos, error: fetchError } = await supabase
      .from('soi_eventos')
      .select('*')
      .eq('procesado', false)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (fetchError) {
      console.error('[FETCH_ERROR]', fetchError)
      return result
    }

    if (!eventos || eventos.length === 0) {
      console.log('[BATCH] No events to process')
      return result
    }

    console.log(`[BATCH_START] Processing ${eventos.length} events...`)

    // Process each event sequentially to maintain ordering
    // Error isolation: one event error does NOT prevent others from processing
    for (const evento of eventos) {
      const success = await processEvent(evento)
      if (success) {
        result.processed += 1
      } else {
        result.errors += 1
      }
    }

    console.log(
      `[BATCH_COMPLETE] processed=${result.processed}, errors=${result.errors}`
    )
    return result
  } catch (error) {
    console.error('[BATCH_ERROR]', error)
    return result
  }
}

/**
 * Main handler: fetch and process one batch of events.
 *
 * Authentication:
 * - Required header: x-internal-key (matches INTERNAL_KEY environment variable)
 * - Prevents unauthorized invocations from external sources
 *
 * Can be invoked:
 * - Manually: curl -H 'x-internal-key: {INTERNAL_KEY}' https://{project}.supabase.co/functions/v1/event-spine-logger
 * - Scheduled: pg_cron every 10 minutes on weekdays 07:00–21:00 (Phase 3)
 * - Reactive: Supabase Webhooks (Phase 3+)
 *
 * Spec Requirements: AC-CON-01, AC-CON-02, AC-CON-06
 */
Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  // Authentication check (accepts x-internal-key or service_role bearer)
  const authHeader = req.headers.get('Authorization') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const isServiceRole = serviceKey && authHeader.includes(serviceKey)
  const internalKey = req.headers.get('x-internal-key')

  if (!isServiceRole && internalKey !== INTERNAL_KEY) {
    console.warn('[AUTH_FAILED] Invalid credentials for event-spine-logger')
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized: invalid x-internal-key or Authorization',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    let body: Record<string, any> | null = null
    try {
      if (req.method === 'POST') {
        body = await req.json()
      }
    } catch {
      // Body is optional (e.g. pg_cron GET/POST without payload)
    }

    // Direct Webhook Single-Event Processing (Phase 4E Sub-second Realtime)
    if (body?.record && (body.table === 'soi_eventos' || !body.table)) {
      const singleEvent = body.record as SoiEvento
      if (!singleEvent.procesado) {
        console.log(`[WEBHOOK_DIRECT] Processing single event ${singleEvent.id} in real-time`)
        const success = await processEvent(singleEvent)
        return new Response(
          JSON.stringify({
            success: true,
            mode: 'webhook_direct',
            processed: success ? 1 : 0,
            errors: success ? 0 : 1,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    const result = await processBatch()

    return new Response(
      JSON.stringify({
        success: true,
        processed: result.processed,
        errors: result.errors,
        skipped: result.skipped,
        timestamp: result.timestamp,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[HANDLER_ERROR]', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
