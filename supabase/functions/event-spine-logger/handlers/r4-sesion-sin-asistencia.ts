/**
 * R4: Session Attendance Reminder Handler
 *
 * Reminds maestros to record attendance if not done within 24 hours of session creation.
 *
 * Spec Requirement: R4 (sesion.creada + 24h gap without asistencia.registrada → reminder)
 * Idempotency: 24-hour window via source_event_id
 * Spec Scenarios: R4-S1 (24h gap detection), R4-S2 (early attendance prevents task)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento, HandlerResult } from '../types.ts'
import { crearTareaDesdeEvento } from '../lib/hermes.ts'
import { handleWhatsAppMaestroAsistenciaPendiente } from './r7-whatsapp-maestros.ts'

/**
 * Handle a session creation event.
 *
 * Business Logic:
 * 1. Extract event payload: { sesion_id, maestro_id, fecha }
 * 2. Query: check if any asistencia.registrada events exist for this sesion_id
 *    created AFTER this session creation event
 * 3. If NO attendance found:
 *    - Check idempotency: existing task with source_event_id = evento.id within 24h
 *    - If no existing task:
 *      * Create ACM reminder task for maestro
 *      * Link task to source event via source_event_id
 *      * Return { handled: true, taskId }
 * 4. If attendance already recorded: return { handled: false } (no action needed)
 * 5. Else: return { handled: false }
 *
 * Note: This handler is designed to trigger ~24h after session creation.
 * The pg_cron job runs every 10 minutes, so the handler checks:
 *   - Does an asistencia.registrada event exist for this sesion_id?
 *   - If not after 24h, create reminder.
 *
 * @param groqEnabled If true, enrich task title via Groq API (not used in R4 Phase 3)
 * @throws {Error} if payload is malformed or database query fails
 * @returns { handled: boolean, taskId?: string, error?: string }
 */
export async function handleSesionCreada(
  evento: SoiEvento,
  supabase: SupabaseClient,
  { groqEnabled = false } = {}
): Promise<HandlerResult> {
  // El trigger fn_soi_evento_sesion_creada() no incluye sesion_id en el payload
  // (solo clase_id/maestro_id/fecha/horario_id) — el id de la sesión ya viaja
  // en evento.entidad_id (NEW.id de sesiones_clase), que es la fuente correcta.
  const sesionId = (evento.payload?.sesion_id as string | undefined) ?? evento.entidad_id ?? undefined
  const maestroId = evento.payload?.maestro_id as string | undefined
  const fecha = evento.payload?.fecha as string | undefined

  // Validate required payload fields
  if (!sesionId) {
    throw new Error(
      `[R4_MALFORMED_SESION_ID] evento ${evento.id}: missing sesion_id in payload`
    )
  }
  if (!maestroId) {
    throw new Error(
      `[R4_MALFORMED_MAESTRO_ID] evento ${evento.id}: missing maestro_id in payload`
    )
  }
  if (!fecha) {
    throw new Error(
      `[R4_MALFORMED_FECHA] evento ${evento.id}: missing fecha in payload`
    )
  }

  // Query: check if attendance has been recorded for this session
  const { data: attendanceEvents, error: attendanceError } = await supabase
    .from('soi_eventos')
    .select('id', { count: 'exact' })
    .eq('tipo', 'asistencia.registrada')
    .eq('payload->sesion_id', sesionId)
    .gt('created_at', evento.created_at) // Attendance must be AFTER session creation

  if (attendanceError) {
    throw new Error(
      `[R4_ATTENDANCE_QUERY_FAILED] evento ${evento.id}: ${attendanceError.message}`
    )
  }

  const attendanceCount = attendanceEvents?.length || 0

  // If attendance already recorded, no reminder needed
  if (attendanceCount > 0) {
    console.log(
      `[R4_ATTENDANCE_FOUND] sesion_id=${sesionId}: attendance already registered`
    )
    return { handled: false }
  }

  // Idempotency check: verify no existing reminder for this event within 24h
  const { data: existingTask, error: idempError } = await supabase
    .from('tareas_institucionales')
    .select('id')
    .eq('source_event_id', evento.id)
    .maybeSingle()

  if (idempError && idempError.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected)
    throw new Error(
      `[R4_IDEMPOTENCY_CHECK_FAILED] evento ${evento.id}: ${idempError.message}`
    )
  }

  if (existingTask) {
    console.log(
      `[R4_DUPLICATE_DETECTED] source_event_id=${evento.id}: reminder already exists`
    )
    return { handled: false }
  }

  // Create maestro reminder task
  const taskText = `Recordatorio: Falta registrar asistencia para la sesión de ${fecha}. Maestro: ${maestroId}. Sesión ID: ${sesionId}. Por favor completar registro de asistencia.`

  const result = await crearTareaDesdeEvento(supabase, {
    texto: taskText,
    departamento: 'ACM',
  })

  if (!result.ok) {
    throw new Error(
      `[R4_TASK_CREATION_FAILED] evento ${evento.id}: ${result.error}`
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
        `[R4_UPDATE_TASK_FAILED] tareaId=${result.tareaId}: ${updateError.message}`
      )
      // Non-fatal: task created but tracking update failed; continue
    }
  }

  console.log(
    `[R4_REMINDER_CREATED] sesion_id=${sesionId}, maestro_id=${maestroId}, tareaId=${result.tareaId}`
  )

  // Trigger Rule R7: Proactive WhatsApp reminder to the maestro
  try {
    await handleWhatsAppMaestroAsistenciaPendiente(maestroId, sesionId, fecha, evento, supabase)
  } catch (waErr) {
    console.error(`[R4_WHATSAPP_TRIGGER_ERROR] maestro_id=${maestroId}:`, waErr)
    // Non-fatal: task creation succeeds even if WhatsApp enqueuing fails
  }

  return {
    handled: true,
    taskId: result.tareaId,
  }
}
