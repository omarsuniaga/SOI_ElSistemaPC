/**
 * send-class-reminders.js
 * Cron script: envía notificaciones push antes de cada clase.
 * 
 * Uso:
 *   node scripts/send-class-reminders.js
 * 
 * Para automatizarlo, configurá un cron en tu servidor:
 *   0 * * * * node /path/to/scripts/send-class-reminders.js
 * 
 * Requiere variables de entorno:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   FCM_SERVER_KEY
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY
const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send'

if (!SUPABASE_URL || !SERVICE_KEY || !FCM_SERVER_KEY) {
  console.error('[reminders] Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FCM_SERVER_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

/**
 * Envía una notificación push vía FCM.
 */
async function sendPush(endpoint, title, body, data = {}) {
  const payload = { to: endpoint, notification: { title, body }, data, priority: 'high' }
  const res = await fetch(FCM_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `key=${FCM_SERVER_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    // Desactivar endpoint inválido
    if (err.includes('NotRegistered') || err.includes('InvalidRegistration')) {
      await supabase.from('push_subscriptions').update({ activo: false }).eq('endpoint', endpoint)
      console.warn(`[reminders] Suscripción inválida, desactivada: ${endpoint.slice(0, 50)}...`)
    }
    throw new Error(err)
  }
  return res.json()
}

/**
 * Envía recordatorios a todos los maestros con clases en los próximos N minutos.
 */
async function sendPreClassReminders(minutesAhead = 15) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + minutesAhead * 60 * 1000)
  const today = now.toISOString().split('T')[0]

  // Obtener clases de hoy cuya hora esté dentro del rango
  const { data: sesiones, error } = await supabase
    .from('sesiones_clase')
    .select('*, clases:clase_id(nombre), maestros:maestro_id(nombre_completo,user_id)')
    .eq('fecha', today)
    .gte('hora_inicio', now.toTimeString().slice(0, 8))
    .lte('hora_inicio', cutoff.toTimeString().slice(0, 8))
    .eq('borrador', false)

  if (error) { console.error('[reminders] Error consultando sesiones:', error); return }
  if (!sesiones?.length) { console.log('[reminders] No hay clases próximas.'); return }

  const profileIds = [...new Set(sesiones.map(s => s.maestros?.user_id).filter(Boolean))]
  if (!profileIds.length) return

  // Obtener subscriptions activas para esos profile_ids
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('profile_id, endpoint')
    .eq('activo', true)
    .in('profile_id', profileIds)

  if (!subs?.length) { console.log('[reminders] Sin suscripciones activas.'); return }

  // Obtener preferencias
  const { data: prefs } = await supabase
    .from('configuracion_recordatorios')
    .select('profile_id, alerta_pre_clase, min_antes_clase')
    .eq('alerta_pre_clase', true)
    .in('profile_id', profileIds)
  const prefsMap = Object.fromEntries((prefs || []).map(p => [p.profile_id, p]))

  let sent = 0, failed = 0
  for (const sub of subs) {
    const p = prefsMap[sub.profile_id]
    if (!p?.alerta_pre_clase) continue

    const min = p.min_antes_clase || minutesAhead
    const clasesMaestro = sesiones.filter(s => s.maestros?.user_id === sub.profile_id)
    const claseNombres = clasesMaestro.map(s => s.clases?.nombre).filter(Boolean).join(', ')

    try {
      await sendPush(
        sub.endpoint,
        '🎵 Clase pronto',
        `Tu clase${claseNombres ? ` de ${claseNombres}` : ''} comienza en ${min} minutos`,
        { type: 'pre_class', session_ids: clasesMaestro.map(s => s.id) },
      )
      sent++
      console.log(`[reminders] ✓ Enviado a ${sub.profile_id.slice(0, 8)}...: ${claseNombres}`)
    } catch (err) {
      failed++
      console.error(`[reminders] ✗ Error para ${sub.endpoint.slice(0, 50)}...: ${err.message}`)
    }
  }

  console.log(`[reminders] Результат: ${sent} enviados, ${failed} fallidos`)
  return { sent, failed }
}

/**
 * Envía alerta post-clase a maestros que no registraron asistencia.
 */
async function sendPostClassAlerts(minutesAfter = 30) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const cutoff = new Date(now.getTime() - minutesAfter * 60 * 1000)

  const { data: sesiones, error } = await supabase
    .from('sesiones_clase')
    .select('*, clases:clase_id(nombre), maestros:maestro_id(nombre_completo,user_id)')
    .eq('fecha', today)
    .eq('borrador', true) // sin registrar aún

  if (error) { console.error('[reminders] Error consultando sesiones:', error); return }
  if (!sesiones?.length) { console.log('[reminders] No hay clases sin registrar.'); return }

  const profileIds = [...new Set(sesiones.map(s => s.maestros?.user_id).filter(Boolean))]
  if (!profileIds.length) return

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('profile_id, endpoint')
    .eq('activo', true)
    .in('profile_id', profileIds)

  if (!subs?.length) return

  const { data: prefs } = await supabase
    .from('configuracion_recordatorios')
    .select('profile_id, alerta_post_clase')
    .eq('alerta_post_clase', true)
    .in('profile_id', profileIds)
  const prefsMap = Object.fromEntries((prefs || []).map(p => [p.profile_id, p]))

  let sent = 0, failed = 0
  for (const sub of subs) {
    if (!prefsMap[sub.profile_id]?.alerta_post_clase) continue
    const clasesMaestro = sesiones.filter(s => s.maestros?.user_id === sub.profile_id)
    const claseNombres = clasesMaestro.map(s => s.clases?.nombre).filter(Boolean).join(', ')

    try {
      await sendPush(
        sub.endpoint,
        '📋 Registro pendiente',
        `No olvidaste pasar lista${claseNombres ? ` en ${claseNombres}` : ''}?`,
        { type: 'post_class_pending', session_ids: clasesMaestro.map(s => s.id) },
      )
      sent++
    } catch (err) {
      failed++
      console.error(`[reminders] ✗ Error post-clase para ${sub.endpoint.slice(0, 50)}...: ${err.message}`)
    }
  }

  console.log(`[reminders] Post-clase: ${sent} enviados, ${failed} fallidos`)
  return { sent, failed }
}

// Ejecutar ambas funciones
console.log(`[reminders] Iniciando... (${new Date().toISOString()})`)
await sendPreClassReminders(15)
await sendPostClassAlerts(30)
console.log(`[reminders] Finalizado.`)
