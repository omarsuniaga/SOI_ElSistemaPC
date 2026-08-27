/**
 * R7: Proactive WhatsApp to Maestros on Pending Attendance
 *
 * Sub-acción de R4 (sesion.creada + 24h sin asistencia registrada). Cuando R4
 * crea el recordatorio interno, R7 evalúa si además corresponde avisarle al
 * maestro por WhatsApp — mismo patrón que R1→R6.
 *
 * Evaluates rule R7 in hermes_reactive_rules.
 * Checks cooldown in soi_eventos (evita reenviar el mismo aviso).
 * Fetches maestro phone from maestros.tlf.
 * Enqueues WhatsApp message into hermes_whatsapp_queue (pendiente_aprobacion
 * por defecto — ver Fase 3 / R6 para el mismo mecanismo de aprobación humana).
 * Records audit event in soi_eventos for dedup tracking.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SoiEvento } from '../types.ts'

export interface WhatsAppMaestroResult {
  sent: boolean
  skipped?: boolean
  reason?: string
  phone?: string
  message?: string
  error?: string
}

export async function handleWhatsAppMaestroAsistenciaPendiente(
  maestroId: string,
  sesionId: string,
  fecha: string,
  evento: SoiEvento,
  supabase: SupabaseClient
): Promise<WhatsAppMaestroResult> {
  // 0. Kill switch global (lee de system_config)
  const { data: killSwitch } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'whatsapp_ingest_enabled')
    .maybeSingle()

  if (killSwitch?.value === 'false') {
    console.log(`[R7_KILL_SWITCH] whatsapp_ingest_enabled=false: no se encola para maestro_id=${maestroId}`)
    return { sent: false, skipped: true, reason: 'whatsapp_ingest_disabled' }
  }

  // 1. Query hermes_reactive_rules for R7 in ACM department
  const { data: rule, error: ruleError } = await supabase
    .from('hermes_reactive_rules')
    .select('enabled, conditions_json')
    .eq('rule_type', 'R7')
    .eq('departamento', 'ACM')
    .maybeSingle()

  if (ruleError && ruleError.code !== 'PGRST116') {
    console.warn(`[R7_RULE_QUERY_ERROR] maestro_id=${maestroId}: ${ruleError.message}`)
  }

  if (rule && !rule.enabled) {
    console.log(`[R7_DISABLED] Rule R7 is disabled for ACM`)
    return { sent: false, skipped: true, reason: 'rule_disabled' }
  }

  const conditions = (rule?.conditions_json as Record<string, any>) || {}
  const cooldownHours = Number(conditions.cooldown_hours) || 24
  const sinceIso = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString()

  // 2. Guard: Deduplication check in soi_eventos within cooldown window
  const { data: recentEvents, error: dedupError } = await supabase
    .from('soi_eventos')
    .select('id')
    .eq('tipo', 'notificacion.whatsapp_maestro')
    .eq('payload->maestro_id', maestroId)
    .gt('created_at', sinceIso)
    .limit(1)

  if (dedupError) {
    console.error(`[R7_DEDUP_QUERY_ERROR] maestro_id=${maestroId}: ${dedupError.message}`)
  }

  if (recentEvents && recentEvents.length > 0) {
    console.log(`[R7_COOLDOWN_ACTIVE] maestro_id=${maestroId}: WhatsApp already sent within ${cooldownHours}h`)
    return { sent: false, skipped: true, reason: 'cooldown_active' }
  }

  // 3. Fetch maestro phone
  const { data: maestro, error: maestroError } = await supabase
    .from('maestros')
    .select('id, nombre_completo, tlf')
    .eq('id', maestroId)
    .single()

  if (maestroError || !maestro) {
    console.warn(`[R7_MAESTRO_NOT_FOUND] maestro_id=${maestroId}: ${maestroError?.message}`)
    return { sent: false, error: 'maestro_not_found' }
  }

  const rawPhone = maestro.tlf
  if (!rawPhone || !String(rawPhone).trim()) {
    console.log(`[R7_NO_PHONE] maestro_id=${maestroId}: No phone registered`)
    return { sent: false, skipped: true, reason: 'no_phone' }
  }

  const cleanPhone = String(rawPhone).replace(/\D/g, '')
  if (cleanPhone.length < 8) {
    console.log(`[R7_INVALID_PHONE] maestro_id=${maestroId}: Phone number ${rawPhone} is too short`)
    return { sent: false, skipped: true, reason: 'invalid_phone' }
  }

  // Respetar opt-out (SIS-COM-01). Comparación por sufijo de dígitos.
  const last8 = cleanPhone.slice(-8)
  const { data: optOutRow } = await supabase
    .from('whatsapp_optout')
    .select('jid')
    .ilike('jid', `%${last8}%`)
    .maybeSingle()

  if (optOutRow) {
    console.log(`[R7_OPTOUT] maestro_id=${maestroId}: Maestro en whatsapp_optout, no se encola`)
    return { sent: false, skipped: true, reason: 'optout' }
  }

  const nombreMaestro = (maestro.nombre_completo || 'Maestro/a').trim()
  const claseNombre = (evento.payload?.clase_nombre as string) || (evento.payload?.materia as string) || 'su clase programada'
  const deepLink = (evento.payload?.deep_link as string) || `/asistencia/${evento.payload?.clase_id || sesionId}/${fecha}`
  const fullLink = deepLink.startsWith('http') ? deepLink : `https://soi.app/#${deepLink.startsWith('/') ? '' : '/'}${deepLink}`

  const defaultTemplate =
    '🎻 *El Sistema Punta Cana* — Recordatorio de Asistencia\n\n' +
    'Hola {nombre_maestro},\n' +
    'Notamos que aún no se ha registrado la asistencia de la sesión de *{clase_nombre}* del *{fecha}*.\n\n' +
    '👉 Completa la asistencia aquí: {link}\n\n' +
    '¡Gracias por tu dedicación y compromiso!'

  const customTemplate = conditions.template || defaultTemplate

  const messageText = customTemplate
    .replace(/\{nombre_maestro\}/g, nombreMaestro)
    .replace(/\{clase_nombre\}/g, claseNombre)
    .replace(/\{fecha\}/g, fecha)
    .replace(/\{link\}/g, fullLink)
    .replace(/\{deep_link\}/g, fullLink)

  // Fase 3: por defecto requiere aprobación humana antes de encolarse para envío real.
  const requiereAprobacion = conditions.requiere_aprobacion !== false
  const estadoInicial = requiereAprobacion ? 'pendiente_aprobacion' : 'pendiente'

  // 4. Enqueue WhatsApp message into hermes_whatsapp_queue
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
    console.error(`[R7_QUEUE_FAILED] maestro_id=${maestroId}: ${queueError.message}`)
    return { sent: false, error: queueError.message }
  }

  if (requiereAprobacion) {
    const { error: tareaError } = await supabase.from('tareas_institucionales').insert({
      titulo: `Aprobar envío de WhatsApp: recordatorio de asistencia a ${nombreMaestro}`,
      descripcion: messageText,
      departamento: 'ACM',
      prioridad: 'baja',
      estado: 'pendiente',
      entidad_tipo: 'otro',
      entidad_id: queuedRow?.id ?? null,
    })
    if (tareaError) {
      console.error(`[R7_TASK_FAILED] maestro_id=${maestroId}: ${tareaError.message}`)
    }
  }

  // 5. Emit audit event to soi_eventos (used for subsequent cooldown dedup)
  const { error: eventError } = await supabase
    .from('soi_eventos')
    .insert({
      tipo: 'notificacion.whatsapp_maestro',
      entidad_tipo: 'maestros',
      entidad_id: maestroId,
      payload: {
        maestro_id: maestroId,
        telefono: cleanPhone,
        nombre_maestro: nombreMaestro,
        sesion_id: sesionId,
        mensaje: messageText,
        source_event_id: evento.id,
      },
      correlation_id: evento.correlation_id,
      procesado: true,
    })

  if (eventError) {
    console.error(`[R7_AUDIT_EVENT_FAILED] maestro_id=${maestroId}: ${eventError.message}`)
  }

  console.log(`[R7_WHATSAPP_QUEUED] maestro_id=${maestroId} phone=${cleanPhone}`)

  return {
    sent: true,
    phone: cleanPhone,
    message: messageText,
  }
}
