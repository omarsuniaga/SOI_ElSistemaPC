/**
 * R3: Period Closure Handler
 *
 * Triggers ACM task for generating closing reports when a period closes.
 *
 * Spec Requirement: R3 (periodo.cerrado → ACM closure task, prioridad=critica)
 * Idempotency: 7-day window (longer than other rules since periods don't close frequently)
 * Spec Scenarios: R3-S1 (closure workflow), R3-S2 (idempotency 7d)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento, HandlerResult } from '../types.ts'
import { crearTareaDesdeEvento } from '../lib/hermes.ts'

/**
 * Handle a period closure event.
 *
 * Business Logic:
 * 1. Extract event payload: { periodo_id, nombre, cantidad_alumnos }
 * 2. Check idempotency: existing task with source_event_id = evento.id within 7 days
 * 3. If no existing task:
 *    - Create ACM closure task with high priority indication
 *    - Task text should include student count and period name
 *    - Link task to source event via source_event_id
 *    - Return { handled: true, taskId }
 * 4. Else: return { handled: false }
 *
 * Note: This is a critica priority task (highest urgency). Hermes classifier
 * should recognize "cierre" and "informes" keywords to assign critica priority.
 *
 * @param groqEnabled If true, enrich task title via Groq API (feature flag from hermes_reactive_rules)
 * @throws {Error} if payload is malformed or database query fails
 * @returns { handled: boolean, taskId?: string, error?: string }
 */
export async function handlePeriodoCerrado(
  evento: SoiEvento,
  supabase: SupabaseClient,
  { groqEnabled = false } = {}
): Promise<HandlerResult> {
  const periodoId = evento.payload?.periodo_id as string | undefined
  const nombre = evento.payload?.nombre as string | undefined
  const cantidadAlumnos = evento.payload?.cantidad_alumnos as number | undefined

  // Validate required payload fields (all required for meaningful closure task)
  if (!periodoId) {
    throw new Error(
      `[R3_MALFORMED_PERIODO_ID] evento ${evento.id}: missing periodo_id in payload`
    )
  }
  if (!nombre) {
    throw new Error(
      `[R3_MALFORMED_NOMBRE] evento ${evento.id}: missing nombre in payload`
    )
  }
  if (cantidadAlumnos === undefined) {
    throw new Error(
      `[R3_MALFORMED_CANTIDAD] evento ${evento.id}: missing cantidad_alumnos in payload`
    )
  }

  // Idempotency check: verify no existing closure task for this event (7-day window)
  const { data: existingTask, error: idempError } = await supabase
    .from('tareas_institucionales')
    .select('id')
    .eq('source_event_id', evento.id)
    .maybeSingle()

  if (idempError && idempError.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected)
    throw new Error(
      `[R3_IDEMPOTENCY_CHECK_FAILED] evento ${evento.id}: ${idempError.message}`
    )
  }

  if (existingTask) {
    console.log(
      `[R3_DUPLICATE_DETECTED] source_event_id=${evento.id}: closure task already exists`
    )
    return { handled: false }
  }

  // Create closure task with emphasis on urgency (keywords for critica classification)
  const taskText = `URGENTE: Generar informes de cierre de período "${nombre}" para ${cantidadAlumnos} alumnos. Período ${periodoId}. Plazo: 3 días máximo. Este es un proceso crítico de cierre.`

  const result = await crearTareaDesdeEvento(supabase, {
    texto: taskText,
    departamento: 'ACM',
  })

  if (!result.ok) {
    throw new Error(
      `[R3_TASK_CREATION_FAILED] evento ${evento.id}: ${result.error}`
    )
  }

  // Update task with source_event_id and correlation_id for tracking
  if (result.tareaId) {
    const { error: updateError } = await supabase
      .from('tareas_institucionales')
      .update({
        source_event_id: evento.id,
        correlation_id: evento.correlation_id,
      })
      .eq('id', result.tareaId)

    if (updateError) {
      console.error(
        `[R3_UPDATE_TASK_FAILED] tareaId=${result.tareaId}: ${updateError.message}`
      )
      // Non-fatal: task created but tracking update failed; continue
    }
  }

  console.log(
    `[R3_CLOSURE_TASK_CREATED] periodo="${nombre}", alumnos=${cantidadAlumnos}, tareaId=${result.tareaId}`
  )

  return {
    handled: true,
    taskId: result.tareaId,
  }
}
