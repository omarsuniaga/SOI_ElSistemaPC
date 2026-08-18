/**
 * R6: Proactive WhatsApp to Parents on Cumulative Absences (Phase 4A)
 *
 * Evaluates rule R6 in hermes_reactive_rules.
 * Checks 48h cooldown in soi_eventos.
 * Fetches parent/guardian phone from alumnos table.
 * Enqueues WhatsApp message into hermes_whatsapp_queue.
 * Records audit event in soi_eventos for dedup tracking.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento } from '../types.ts'

export interface WhatsAppPadresResult {
  sent: boolean
  skipped?: boolean
  reason?: string
  phone?: string
  message?: string
  error?: string
}

export async function handleWhatsAppPadresAusencias(
  alumnoId: string,
  faltaCount: number,
  evento: SoiEvento,
  supabase: SupabaseClient
): Promise<WhatsAppPadresResult> {
  // 1. Query hermes_reactive_rules for R6 in ACM department
  const { data: rule, error: ruleError } = await supabase
    .from('hermes_reactive_rules')
    .select('enabled, conditions_json')
    .eq('rule_type', 'R6')
    .eq('departamento', 'ACM')
    .maybeSingle()

  if (ruleError && ruleError.code !== 'PGRST116') {
    console.warn(`[R6_RULE_QUERY_ERROR] alumno_id=${alumnoId}: ${ruleError.message}`)
  }

  // If rule explicitly disabled, skip
  if (rule && !rule.enabled) {
    console.log(`[R6_DISABLED] Rule R6 is disabled for ACM`)
    return { sent: false, skipped: true, reason: 'rule_disabled' }
  }

  const conditions = (rule?.conditions_json as Record<string, any>) || {}
  const cooldownHours = Number(conditions.cooldown_hours) || 48
  const sinceIso = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString()

  // 2. Guard: Deduplication check in soi_eventos within 48h
  const { data: recentEvents, error: dedupError } = await supabase
    .from('soi_eventos')
    .select('id')
    .eq('tipo', 'notificacion.whatsapp_padres')
    .eq('payload->alumno_id', alumnoId)
    .gt('created_at', sinceIso)
    .limit(1)

  if (dedupError) {
    console.error(`[R6_DEDUP_QUERY_ERROR] alumno_id=${alumnoId}: ${dedupError.message}`)
  }

  if (recentEvents && recentEvents.length > 0) {
    console.log(`[R6_COOLDOWN_ACTIVE] alumno_id=${alumnoId}: WhatsApp already sent within ${cooldownHours}h`)
    return { sent: false, skipped: true, reason: 'cooldown_48h' }
  }

  // 3. Fetch student & parent details from alumnos
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido, familiar_nombre, familiar_telefono, contacto_emergencia_telefono, tlf_alumno')
    .eq('id', alumnoId)
    .single()

  if (alumnoError || !alumno) {
    console.warn(`[R6_ALUMNO_NOT_FOUND] alumno_id=${alumnoId}: ${alumnoError?.message}`)
    return { sent: false, error: 'alumno_not_found' }
  }

  // Extract best available phone
  const rawPhone = alumno.familiar_telefono || alumno.contacto_emergencia_telefono || alumno.tlf_alumno
  if (!rawPhone || !String(rawPhone).trim()) {
    console.log(`[R6_NO_PHONE] alumno_id=${alumnoId}: No contact phone found for student`)
    return { sent: false, skipped: true, reason: 'no_phone' }
  }

  const cleanPhone = String(rawPhone).replace(/\D/g, '')
  if (cleanPhone.length < 8) {
    console.log(`[R6_INVALID_PHONE] alumno_id=${alumnoId}: Phone number ${rawPhone} is too short`)
    return { sent: false, skipped: true, reason: 'invalid_phone' }
  }

  const studentFullName = `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim()
  const customTemplate =
    conditions.template ||
    'Estimado/a representante de {nombre_alumno}: Le informamos que el/la estudiante ha acumulado {faltas} inasistencias injustificadas en los últimos 7 días en El Sistema Punta Cana. Por favor comuníquese con Coordinación Académica para coordinar el seguimiento.'

  const messageText = customTemplate
    .replace('{nombre_alumno}', studentFullName)
    .replace('{faltas}', String(faltaCount))

  // 4. Enqueue WhatsApp message into hermes_whatsapp_queue
  const { error: queueError } = await supabase
    .from('hermes_whatsapp_queue')
    .insert({
      jid: cleanPhone,
      mensaje: messageText,
      estado: 'pendiente',
    })

  if (queueError) {
    console.error(`[R6_QUEUE_FAILED] alumno_id=${alumnoId}: ${queueError.message}`)
    return { sent: false, error: queueError.message }
  }

  // 5. Emit audit event to soi_eventos (used for subsequent 48h dedup)
  const { error: eventError } = await supabase
    .from('soi_eventos')
    .insert({
      tipo: 'notificacion.whatsapp_padres',
      origen_tabla: 'alumnos',
      origen_id: alumnoId,
      payload: {
        alumno_id: alumnoId,
        telefono: cleanPhone,
        nombre_alumno: studentFullName,
        faltas: faltaCount,
        mensaje: messageText,
        source_event_id: evento.id,
      },
      correlation_id: evento.correlation_id,
      procesado: true,
    })

  if (eventError) {
    console.error(`[R6_AUDIT_EVENT_FAILED] alumno_id=${alumnoId}: ${eventError.message}`)
  }

  console.log(`[R6_WHATSAPP_QUEUED] alumno_id=${alumnoId} phone=${cleanPhone}`)

  return {
    sent: true,
    phone: cleanPhone,
    message: messageText,
  }
}
