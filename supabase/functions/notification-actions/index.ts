/**
 * Supabase Edge Function: notification-actions
 * Ejecuta en backend las acciones rápidas de los botones de una notificación push
 * (ej. "Marcar como Leído"), invocada desde el Service Worker aunque la PWA esté
 * cerrada. Antes, `handleBackgroundAction` en sw.js solo hacía postMessage a
 * pestañas abiertas — si no había ninguna, el botón no hacía nada real.
 *
 * Auth: usa el JWT del maestro (no service role) reenviado por el Service Worker,
 * igual patrón que otras funciones del proyecto. auth.getUser() valida el token y
 * la query además filtra por profile_id = user.id como defensa en profundidad.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VALID_ACTIONS = new Set(['mark-read'])

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Falta encabezado Authorization' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userError } = await client.auth.getUser()
    if (userError || !userData?.user) {
      return jsonResponse({ error: 'Token inválido o expirado' }, 401)
    }

    const body = await req.json().catch(() => ({}))
    const { notification_id: notificationId, action } = body

    if (!notificationId || !VALID_ACTIONS.has(action)) {
      return jsonResponse({ error: 'notification_id o action inválidos' }, 400)
    }

    if (action === 'mark-read') {
      const { error } = await client
        .from('notificaciones')
        .update({ estado: 'leida', leida_en: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('profile_id', userData.user.id)

      if (error) throw error
    }

    return jsonResponse({ success: true })
  } catch (err) {
    console.error('[notification-actions] Error:', err.message)
    return jsonResponse({ error: err.message }, 500)
  }
})
