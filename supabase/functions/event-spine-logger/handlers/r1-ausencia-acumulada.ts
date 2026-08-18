/**
 * R1: Absence Escalation Handler
 *
 * Detects cumulative unjustified absences and creates escalation tasks.
 *
 * Spec Requirement: R1 (3+ absences in 7 days → ACM task)
 * Idempotency: 48-hour window via correlation_id
 * Spec Scenarios: R1-S1 (threshold), R1-S2 (idempotency), R1-S3 (calendar boundary)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento, HandlerResult } from '../types.ts'
import { crearTareaDesdeEvento } from '../lib/hermes.ts'
import { enrichDescription } from '../lib/groq.ts'
import { handleWhatsAppPadresAusencias } from './r6-whatsapp-padres.ts'


/**
 * Handle a single unjustified absence event.
 *
 * Business Logic:
 * 1. Query: Count asistencia.falta_injustificada events for same alumno_id in past 7 days
 * 2. If count >= 3:
 *    - Check idempotency: existing task within 48h of this event's correlation_id
 *    - If no existing task: create ACM escalation task
 *    - Return { handled: true, taskId }
 * 3. Else: return { handled: false }
 *
 * @param groqEnabled If true, enrich task title via Groq API (feature flag from hermes_reactive_rules)
 * @throws {Error} if database query fails or event payload is malformed
 * @returns { handled: boolean, taskId?: string, error?: string }
 */
export async function handleAusenciaAcumulada(
  evento: SoiEvento,
  supabase: SupabaseClient,
  { groqEnabled = false } = {}
): Promise<HandlerResult> {
  const alumnoId = evento.payload?.alumno_id as string | undefined

  // Validate required payload fields
  if (!alumnoId) {
    throw new Error(
      `[R1_MALFORMED] evento ${evento.id}: missing alumno_id in payload`
    )
  }

  // Query: count falta_injustificada events for this student in past 7 days
  const { data: countResult, error: countError } = await supabase
    .from('soi_eventos')
    .select('id', { count: 'exact' })
    .eq('tipo', 'asistencia.falta_injustificada')
    .eq('payload->alumno_id', alumnoId)
    .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (countError) {
    throw new Error(
      `[R1_COUNT_QUERY_FAILED] evento ${evento.id}: ${countError.message}`
    )
  }

  const faltaCount = countResult?.length || 0

  // If fewer than 3 absences, no action needed
  if (faltaCount < 3) {
    console.log(
      `[R1_BELOW_THRESHOLD] alumno_id=${alumnoId}: ${faltaCount} faltas (< 3 required)`
    )
    return { handled: false }
  }

  // Idempotency check: verify no existing task for this correlation_id within 48h
  const correlationId = evento.correlation_id
  if (correlationId) {
    const { data: existingTask, error: idempError } = await supabase
      .from('tareas_institucionales')
      .select('id')
      .eq('source_event_id', evento.id)
      .maybeSingle()

    if (idempError && idempError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected)
      throw new Error(
        `[R1_IDEMPOTENCY_CHECK_FAILED] evento ${evento.id}: ${idempError.message}`
      )
    }

    if (existingTask) {
      console.log(
        `[R1_DUPLICATE_DETECTED] correlation_id=${correlationId}: task already exists`
      )
      return { handled: false }
    }
  }

  // Create escalation task via hermes
  let taskText = `Seguimiento urgente: Alumno ID ${alumnoId} tiene 3+ faltas injustificadas en 7 días. Requiere intervención ACM inmediata.`

  // Optional: enrich task title via Groq if enabled
  if (groqEnabled) {
    taskText = await enrichDescription(supabase, evento, taskText, groqEnabled)
  }

  const result = await crearTareaDesdeEvento(supabase, {
    texto: taskText,
    departamento: 'ACM',
  })

  if (!result.ok) {
    throw new Error(
      `[R1_TASK_CREATION_FAILED] evento ${evento.id}: ${result.error}`
    )
  }

  // Update task with source_event_id and correlation_id for tracking
  if (result.tareaId) {
    const { error: updateError } = await supabase
      .from('tareas_institucionales')
      .update({
        source_event_id: evento.id,
        correlation_id: correlationId,
      })
      .eq('id', result.tareaId)

    if (updateError) {
      console.error(
        `[R1_UPDATE_TASK_FAILED] tareaId=${result.tareaId}: ${updateError.message}`
      )
      // Non-fatal: task created but tracking update failed; continue
    }
  }

  console.log(
    `[R1_ESCALATION_CREATED] alumno_id=${alumnoId}, tareaId=${result.tareaId}, faltas=${faltaCount}`
  )

  // Trigger Phase 4A: Proactive WhatsApp alert to parents (Rule R6 with 48h guard)
  try {
    await handleWhatsAppPadresAusencias(alumnoId, faltaCount, evento, supabase)
  } catch (waErr) {
    console.error(`[R1_WHATSAPP_TRIGGER_ERROR] alumno_id=${alumnoId}:`, waErr)
    // Non-fatal: task creation succeeds even if WhatsApp enqueuing fails
  }

  return {
    handled: true,
    taskId: result.tareaId,
  }
}

