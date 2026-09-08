/**
 * whatsapp-gateway — Edge Function del gateway WhatsApp multi departamento.
 *
 * La app Electron (una por departamento) se autentica con su device token y
 * llama a:
 *   POST /whatsapp-gateway/claim      -> reclama la cola de su departamento
 *   POST /whatsapp-gateway/report     -> reporta resultados de envío
 *   POST /whatsapp-gateway/heartbeat  -> latido + detección de instancia única
 *
 * El `service_role` vive solo acá (secret de la función), nunca en el binario.
 * Desplegar con `verify_jwt = false` (ver supabase/config.toml).
 *
 * SDD whatsapp-gateway-multidepto · F2.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  authDevice,
  extractBearerToken,
  handleClaim,
  handleHeartbeat,
  handleReport,
  RequestError,
  routeFromPath,
} from './handlers.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'metodo_no_permitido' }, 405)

  const ruta = routeFromPath(new URL(req.url).pathname)
  if (!ruta) return json({ error: 'ruta_desconocida' }, 404)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  let device
  try {
    device = await authDevice(supabase, extractBearerToken(req.headers.get('authorization')))
  } catch (err) {
    console.error('[whatsapp-gateway] authDevice falló:', (err as Error)?.message)
    return json({ error: 'auth_no_disponible' }, 503)
  }
  if (!device) return json({ error: 'token_invalido' }, 401)

  let body: Record<string, unknown> | null = null
  try {
    const text = await req.text()
    body = text ? JSON.parse(text) : null
  } catch {
    return json({ error: 'body_invalido' }, 400)
  }

  const correlationId = crypto.randomUUID()
  try {
    if (ruta === 'claim') return json(await handleClaim(supabase, device.departamento, body))
    if (ruta === 'report') return json(await handleReport(supabase, device.departamento, body))
    return json(await handleHeartbeat(supabase, device.departamento, body))
  } catch (err) {
    if (err instanceof RequestError) {
      return json({ error: err.message }, err.status)
    }
    // No filtramos el detalle del error (podría traer nombres de columnas /
    // constraints). Queda en los logs del servidor con el correlation id.
    console.error(`[whatsapp-gateway] ${ruta} error (${correlationId}):`, (err as Error)?.message)
    return json({ error: 'error_interno', correlation_id: correlationId }, 500)
  }
})
