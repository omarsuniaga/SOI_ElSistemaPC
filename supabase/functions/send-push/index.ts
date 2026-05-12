/**
 * Supabase Edge Function: send-push
 * Envía notificaciones push a través de Firebase Cloud Messaging (FCM).
 * Se invoca desde un cron job o manualmente.
 * 
 * Cuerpo esperado (JSON):
 * {
 *   "profile_id": "uuid",           // opcional — si se omite, envía a todos los activos
 *   "title": "string",
 *   "body": "string",
 *   "data": { ... }                // datos opcionales adicionales
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')
const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    // Crear cliente admin (sin RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.json().catch(() => ({}))
    const { title = 'Portal Maestros', body: notificationBody = 'Nueva notificación', data = {} } = body
    const targetProfileId = body.profile_id || null

    // Obtener subscriptions activas
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
      return new Response(JSON.stringify({ sent: 0, message: 'No subscriptions found' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    if (!FCM_SERVER_KEY) {
      throw new Error('FCM_SERVER_KEY no configurado en variables de entorno')
    }

    // Enviar a cada suscriptor
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const payload = {
          to: sub.endpoint,
          notification: { title, body: notificationBody },
          data,
          priority: 'high',
        }

        const response = await fetch(FCM_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `key=${FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errText = await response.text()
          console.error(`[send-push] FCM error for ${sub.endpoint}:`, errText)
          // Desactivar suscripción si FCM dice que es inválida
          if (errText.includes('NotRegistered') || errText.includes('InvalidRegistration')) {
            await supabase
              .from('push_subscriptions')
              .update({ activo: false })
              .eq('endpoint', sub.endpoint)
          }
          throw new Error(errText)
        }

        return sub.endpoint
      }),
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
