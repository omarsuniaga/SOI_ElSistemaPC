/**
 * Supabase Edge Function: send-push
 * Envía notificaciones push usando el estándar Web Push VAPID.
 * Compatible nativamente con iOS, Android, Chrome, Safari, Edge.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

// Configuración VAPID (Las llaves deben estar en Deno.env)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT = 'mailto:soporte@soi-academico.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('❌ Faltan las variables VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY en Supabase')
    }

    // Cliente admin para saltar RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.json().catch(() => ({}))
    const { title = 'Portal Maestros', body: notificationBody = 'Nueva notificación', data = {} } = body
    const targetProfileId = body.profile_id || null

    // Buscar suscripciones activas
    let query = supabase
      .from('push_subscriptions')
      .select('profile_id, endpoint, p256dh, auth')
      .eq('activo', true)

    if (targetProfileId) {
      query = query.eq('profile_id', targetProfileId)
    }

    const { data: subscriptions, error: subError } = await query
    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No hay suscripciones activas' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const payload = JSON.stringify({
      title,
      body: notificationBody,
      data
    })

    // Enviar notificaciones en paralelo
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        try {
          await webpush.sendNotification(pushSubscription, payload)
          return sub.endpoint
        } catch (error) {
          // Si el endpoint expiró (410) o es inválido (404), desactivarlo
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.warn(`[WebPush] Suscripción expirada. Desactivando endpoint: ${sub.endpoint}`)
            await supabase
              .from('push_subscriptions')
              .update({ activo: false })
              .eq('endpoint', sub.endpoint)
          }
          throw error
        }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[send-push] Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
