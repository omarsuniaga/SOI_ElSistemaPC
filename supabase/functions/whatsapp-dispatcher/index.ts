// Compatibility endpoint only. The Baileys runner in scripts/whatsapp-runner
// is the single sender and owns queue claiming, ACK tracking and retries.
const DISPATCHER_INTERNAL_KEY = Deno.env.get('WHATSAPP_DISPATCHER_INTERNAL_KEY') ?? ''
const ALLOWED_ORIGINS = (Deno.env.get('WHATSAPP_ALLOWED_ORIGINS') ?? '').split(',').map((value) => value.trim()).filter(Boolean)

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-whatsapp-dispatcher-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
  if (origin && ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) })
  }
  if (req.method !== 'POST') {
    return json(req, { error: 'Método no permitido' }, 405)
  }

  // This compatibility endpoint is server-to-server only. It deliberately
  // performs no queue claim or message delivery.
  if (!DISPATCHER_INTERNAL_KEY || req.headers.get('x-whatsapp-dispatcher-key') !== DISPATCHER_INTERNAL_KEY) {
    return json(req, { error: 'No autorizado' }, 401)
  }

  return json(req, {
    status: 'runner_owned',
    message: 'El runner Baileys es el único sender. Esta función no reclama ni envía mensajes.',
  })
})
