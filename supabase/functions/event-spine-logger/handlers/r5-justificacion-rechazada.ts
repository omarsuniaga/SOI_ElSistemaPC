/**
 * R5: Justification Rejection Handler
 *
 * Notifies ACM/ADM when an absence justification is rejected.
 *
 * Spec Requirement: R5 (justificacion.rechazada → ADM notification)
 * Idempotency: 24-hour window via source_event_id
 * Spec Scenarios: R5-S1 (rejection notification), R5-S2 (idempotency 24h)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento, HandlerResult } from '../types.ts'
import { crearTareaDesdeEvento } from '../lib/hermes.ts'

/**
 * Handle a justification rejection event.
 *
 * Business Logic:
 * 1. Extract event payload: { alumno_id, maestro_id, ausencia_fecha, motivo_rechazo }
 * 2. Check idempotency: existing task with source_event_id = evento.id within 24h
 * 3. If no existing task:
 *    - Create ADM notification task with rejection reason
 *    - Link task to source event via source_event_id
 *    - Return { handled: true, taskId }
 * 4. Else: return { handled: false }
 *
 * Note: This creates an ADM task (not ACM) to route rejection workflows through
 * Administration for processing and follow-up communications.
 *
 * @param groqEnabled If true, enrich task title via Groq API (not used in R5 Phase 3)
 * @throws {Error} if payload is malformed or database query fails
 * @returns { handled: boolean, taskId?: string, error?: string }
 */
export async function handleJustificacionRechazada(
  evento: SoiEvento,
  supabase: SupabaseClient,
  { groqEnabled = false } = {}
): Promise<HandlerResult> {
  const alumnoId = evento.payload?.alumno_id as string | undefined
  const maestroId = evento.payload?.maestro_id as string | undefined
  const ausenciaFecha = evento.payload?.ausencia_fecha as string | undefined
  const motivoRechazo = evento.payload?.motivo_rechazo as string | undefined

  // Validate required payload fields
  if (!alumnoId) {
    throw new Error(
      `[R5_MALFORMED_ALUMNO_ID] evento ${evento.id}: missing alumno_id in payload`
    )
  }
  if (!maestroId) {
    throw new Error(
      `[R5_MALFORMED_MAESTRO_ID] evento ${evento.id}: missing maestro_id in payload`
    )
  }
  if (!ausenciaFecha) {
    throw new Error(
      `[R5_MALFORMED_AUSENCIA_FECHA] evento ${evento.id}: missing ausencia_fecha in payload`
    )
  }
  // motivoRechazo is required but may be empty string
  if (motivoRechazo === undefined) {
    throw new Error(
      `[R5_MALFORMED_MOTIVO] evento ${evento.id}: missing motivo_rechazo in payload`
    )
  }

  // Idempotency check: verify no existing notification for this rejection event
  const { data: existingTask, error: idempError } = await supabase
    .from('tareas_institucionales')
    .select('id')
    .eq('source_event_id', evento.id)
    .maybeSingle()

  if (idempError && idempError.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected)
    throw new Error(
      `[R5_IDEMPOTENCY_CHECK_FAILED] evento ${evento.id}: ${idempError.message}`
    )
  }

  if (existingTask) {
    console.log(
      `[R5_DUPLICATE_DETECTED] source_event_id=${evento.id}: rejection notification already exists`
    )
    return { handled: false }
  }

  // Create rejection notification task
  const taskText = `Justificación rechazada: Alumno ${alumnoId} — Ausencia del ${ausenciaFecha}. Motivo de rechazo: "${motivoRechazo}". Maestro ${maestroId} debe dar seguimiento. ADM debe notificar al alumno.`

  const result = await crearTareaDesdeEvento(supabase, {
    texto: taskText,
    departamento: 'ADM',
  })

  if (!result.ok) {
    throw new Error(
      `[R5_TASK_CREATION_FAILED] evento ${evento.id}: ${result.error}`
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
        `[R5_UPDATE_TASK_FAILED] tareaId=${result.tareaId}: ${updateError.message}`
      )
      // Non-fatal: task created but tracking update failed; continue
    }
  }

  console.log(
    `[R5_REJECTION_NOTIFICATION_CREATED] alumno_id=${alumnoId}, ausencia_fecha=${ausenciaFecha}, tareaId=${result.tareaId}`
  )

  return {
    handled: true,
    taskId: result.tareaId,
  }
}
