/**
 * R8: Proactive WhatsApp for Overdue Institutional Tasks
 *
 * Sub-acción de R2 (tarea.vencida → escalación a DIR). Cuando R2 crea la
 * tarea de escalación interna, R8 evalúa si además corresponde avisar por
 * WhatsApp a un contacto de seguimiento — mismo patrón que R1→R6 y R4→R7.
 *
 * A diferencia de R6/R7, no existe en el esquema actual un teléfono asociado
 * a "responsable de departamento" ni a "responsable de tarea" (ni profiles,
 * ni departamentos, ni tareas_institucionales tienen columna de teléfono).
 * Por eso R8 NO intenta resolver un teléfono por tarea individual: notifica
 * a un contacto FIJO configurado en conditions_json.telefono_contacto de la
 * propia regla — un resumen de seguimiento, no un mensaje personalizado por
 * responsable. Si en el futuro se agrega un directorio telefónico real, este
 * handler puede evolucionar a resolución por tarea sin cambiar el resto del
 * pipeline (HERMES sigue leyendo el parámetro, no hardcodeado en código).
 *
 * Evaluates rule R8 in hermes_reactive_rules.
 * Checks cooldown in soi_eventos (evita reenviar el mismo aviso muy seguido).
 * Enqueues WhatsApp message into hermes_whatsapp_queue (pendiente_aprobacion
 * por defecto).
 * Records audit event in soi_eventos for dedup tracking.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento } from '../types.ts'

export interface WhatsAppTareaResult {
  sent: boolean
  skipped?: boolean
  reason?: string
  phone?: string
  message?: string
  error?: string
}

export async function handleWhatsAppTareaVencida(
  titulo: string,
  departamento: string,
  diasVencida: number | undefined,
  evento: SoiEvento,
  supabase: SupabaseClient
): Promise<WhatsAppTareaResult> {
  // 0. Kill switch global (lee de system_config)
  const { data: killSwitch } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'whatsapp_ingest_enabled')
    .maybeSingle()

  if (killSwitch?.value === 'false') {
    console.log(`[R8_KILL_SWITCH] whatsapp_ingest_enabled=false: no se encola para tarea="${titulo}"`)
    return { sent: false, skipped: true, reason: 'whatsapp_ingest_disabled' }
  }

  // 1. Query hermes_reactive_rules for R8 in DIR department
  const { data: rule, error: ruleError } = await supabase
    .from('hermes_reactive_rules')
    .select('enabled, conditions_json')
    .eq('rule_type', 'R8')
    .eq('departamento', 'DIR')
    .maybeSingle()

  if (ruleError && ruleError.code !== 'PGRST116') {
    console.warn(`[R8_RULE_QUERY_ERROR] tarea="${titulo}": ${ruleError.message}`)
  }

  if (rule && !rule.enabled) {
    console.log(`[R8_DISABLED] Rule R8 is disabled for DIR`)
    return { sent: false, skipped: true, reason: 'rule_disabled' }
  }

  const conditions = (rule?.conditions_json as Record<string, any>) || {}

  // Sin teléfono configurado, no hay a quién avisar — no es un error, es config pendiente.
  const rawPhone = conditions.telefono_contacto as string | undefined
  if (!rawPhone || !String(rawPhone).trim()) {
    console.log(`[R8_NO_CONTACT_CONFIGURED] No hay telefono_contacto en conditions_json de R8`)
    return { sent: false, skipped: true, reason: 'no_contact_configured' }
  }

  const cleanPhone = String(rawPhone).replace(/\D/g, '')
  if (cleanPhone.length < 8) {
    console.log(`[R8_INVALID_PHONE] telefono_contacto=${rawPhone} is too short`)
    return { sent: false, skipped: true, reason: 'invalid_phone' }
  }

  const cooldownHours = Number(conditions.cooldown_hours) || 24
  const sinceIso = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString()

  // 2. Guard: Deduplication check in soi_eventos within cooldown window
  //    (por departamento, no por tarea individual — es un resumen de seguimiento)
  const { data: recentEvents, error: dedupError } = await supabase
    .from('soi_eventos')
    .select('id')
    .eq('tipo', 'notificacion.whatsapp_tarea_vencida')
    .eq('payload->departamento', departamento)
    .gt('created_at', sinceIso)
    .limit(1)

  if (dedupError) {
    console.error(`[R8_DEDUP_QUERY_ERROR] departamento=${departamento}: ${dedupError.message}`)
  }

  if (recentEvents && recentEvents.length > 0) {
    console.log(`[R8_COOLDOWN_ACTIVE] departamento=${departamento}: WhatsApp already sent within ${cooldownHours}h`)
    return { sent: false, skipped: true, reason: 'cooldown_active' }
  }

  // Respetar opt-out (SIS-COM-01). Comparación por sufijo de dígitos.
  const last8 = cleanPhone.slice(-8)
  const { data: optOutRow } = await supabase
    .from('whatsapp_optout')
    .select('jid')
    .ilike('jid', `%${last8}%`)
    .maybeSingle()

  if (optOutRow) {
    console.log(`[R8_OPTOUT] telefono_contacto en whatsapp_optout, no se encola`)
    return { sent: false, skipped: true, reason: 'optout' }
  }

  const diasStr = diasVencida ?? 'varios'
  const customTemplate =
    conditions.template ||
    'Seguimiento HERMES: la tarea "{titulo}" del departamento {departamento} lleva {dias} día(s) vencida. Requiere revisión.'

  const messageText = customTemplate
    .replace(/\{titulo\}/g, titulo)
    .replace(/\{departamento\}/g, departamento)
    .replace(/\{dias\}/g, String(diasStr))

  // Fase 3: por defecto requiere aprobación humana antes de encolarse para envío real.
  const requiereAprobacion = conditions.requiere_aprobacion !== false
  const estadoInicial = requiereAprobacion ? 'pendiente_aprobacion' : 'pendiente'

  // 3. Enqueue WhatsApp message into hermes_whatsapp_queue
  const { data: queuedRow, error: queueError } = await supabase
    .from('hermes_whatsapp_queue')
    .insert({
      jid: cleanPhone,
      mensaje: messageText,
      estado: estadoInicial,
    })
    .select('id')
    .single()

  if (queueError) {
    console.error(`[R8_QUEUE_FAILED] tarea="${titulo}": ${queueError.message}`)
    return { sent: false, error: queueError.message }
  }

  if (requiereAprobacion) {
    const { error: tareaError } = await supabase.from('tareas_institucionales').insert({
      titulo: `Aprobar envío de WhatsApp: seguimiento de tarea vencida (${departamento})`,
      descripcion: messageText,
      departamento: 'DIR',
      prioridad: 'baja',
      estado: 'pendiente',
      entidad_tipo: 'otro',
      entidad_id: queuedRow?.id ?? null,
    })
    if (tareaError) {
      console.error(`[R8_TASK_FAILED] tarea="${titulo}": ${tareaError.message}`)
    }
  }

  // 4. Emit audit event to soi_eventos (used for subsequent cooldown dedup)
  const { error: eventError } = await supabase
    .from('soi_eventos')
    .insert({
      tipo: 'notificacion.whatsapp_tarea_vencida',
      entidad_tipo: 'tareas_institucionales',
      payload: {
        titulo,
        departamento,
        dias_vencida: diasVencida ?? null,
        telefono: cleanPhone,
        mensaje: messageText,
        source_event_id: evento.id,
      },
      correlation_id: evento.correlation_id,
      procesado: true,
    })

  if (eventError) {
    console.error(`[R8_AUDIT_EVENT_FAILED] tarea="${titulo}": ${eventError.message}`)
  }

  console.log(`[R8_WHATSAPP_QUEUED] tarea="${titulo}" phone=${cleanPhone}`)

  return {
    sent: true,
    phone: cleanPhone,
    message: messageText,
  }
}
