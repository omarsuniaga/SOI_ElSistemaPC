/**
 * R2: Task Escalation Handler
 *
 * Escalates overdue tasks to the Director (DIR) for oversight.
 *
 * Spec Requirement: R2 (tarea.vencida → DIR escalation)
 * Idempotency: 48-hour window via source_event_id
 * Spec Scenarios: R2-S1 (escalation), R2-S2 (idempotency)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento, HandlerResult } from '../types.ts'
import { crearTareaDesdeEvento } from '../lib/hermes.ts'

/**
 * Handle a task overdue event.
 *
 * Business Logic:
 * 1. Verify event payload contains: titulo, departamento, dias_vencida
 * 2. Check idempotency: existing task with source_event_id = evento.id
 * 3. If no existing task:
 *    - Create DIR escalation task with text referencing original task
 *    - Link new task to source event via source_event_id
 *    - Return { handled: true, taskId }
 * 4. Else: return { handled: false }
 *
 * @param groqEnabled If true, enrich task title via Groq API (not used in R2 Phase 3)
 * @throws {Error} if payload is malformed or database query fails
 * @returns { handled: boolean, taskId?: string, error?: string }
 */
export async function handleTareaVencida(
  evento: SoiEvento,
  supabase: SupabaseClient,
  { groqEnabled = false } = {}
): Promise<HandlerResult> {
  const titulo = evento.payload?.titulo as string | undefined
  const departamento = evento.payload?.departamento as string | undefined
  const diasVencida = evento.payload?.dias_vencida as number | undefined

  // Validate required payload fields
  if (!titulo) {
    throw new Error(
      `[R2_MALFORMED_TITULO] evento ${evento.id}: missing titulo in payload`
    )
  }
  if (!departamento) {
    throw new Error(
      `[R2_MALFORMED_DEPARTAMENTO] evento ${evento.id}: missing departamento in payload`
    )
  }

  // diasVencida is optional (may be 0) but should be a number if present
  const diasStr = diasVencida ?? 'desconocido'

  // Idempotency check: verify no existing escalation for this event
  const { data: existingTask, error: idempError } = await supabase
    .from('tareas_institucionales')
    .select('id')
    .eq('source_event_id', evento.id)
    .maybeSingle()

  if (idempError && idempError.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected)
    throw new Error(
      `[R2_IDEMPOTENCY_CHECK_FAILED] evento ${evento.id}: ${idempError.message}`
    )
  }

  if (existingTask) {
    console.log(
      `[R2_DUPLICATE_DETECTED] source_event_id=${evento.id}: escalation already exists`
    )
    return { handled: false }
  }

  // Create DIR escalation task
  const taskText = `Escalación: Tarea "${titulo}" del departamento ${departamento} está ${diasStr} día(s) vencida. Requiere revisión de DIR.`

  const result = await crearTareaDesdeEvento(supabase, {
    texto: taskText,
    departamento: 'DIR',
  })

  if (!result.ok) {
    throw new Error(
      `[R2_TASK_CREATION_FAILED] evento ${evento.id}: ${result.error}`
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
        `[R2_UPDATE_TASK_FAILED] tareaId=${result.tareaId}: ${updateError.message}`
      )
      // Non-fatal: task created but tracking update failed; continue
    }
  }

  console.log(
    `[R2_ESCALATION_CREATED] titulo="${titulo}", departamento=${departamento}, tareaId=${result.tareaId}`
  )

  return {
    handled: true,
    taskId: result.tareaId,
  }
}
