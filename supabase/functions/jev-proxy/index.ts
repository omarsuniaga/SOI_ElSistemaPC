/**
 * Supabase Edge Function: jev-proxy
 *
 * Proxies evaluation requests to Jev (TypeSafe AI's fast, typed-decision
 * model) through the Vercel AI Gateway. The gateway key lives in Deno.env
 * (set via `supabase secrets set AI_GATEWAY_API_KEY=...`) and is NEVER
 * exposed to the browser — same pattern as groq-proxy.
 *
 * Jev only classifies/scores; it never writes to the database and never
 * decides anything on its own (P4/P9/R6). Callers use its answers purely
 * as a triage signal for a human.
 *
 * Endpoint:
 *   POST /jev-proxy/evaluate  { state: string, questions: object }
 *   → forwards to https://ai-gateway.vercel.sh/v4/ai/evaluation-model
 *
 * Auth: requires a valid Supabase JWT in the Authorization header (any
 * logged-in user — this proxy does not gate by role; the caller's own
 * view/route already restricts who reaches this feature).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AI_GATEWAY_API_KEY = Deno.env.get('AI_GATEWAY_API_KEY') ?? ''
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v4/ai/evaluation-model'
const JEV_MODEL_ID = 'typesafe-ai/jev'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400) {
  return json({ error: message }, status)
}

async function verifyAuth(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    console.error('[jev-proxy] verifyAuth: no Authorization header present')
    return false
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const client = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { error } = await client.auth.getUser()
  if (error) {
    // Never log the token itself — only length/prefix, enough to tell
    // "empty", "malformed", or "well-formed but rejected" apart.
    console.error(
      '[jev-proxy] verifyAuth rejected:',
      error.message,
      '| header length:', authHeader.length,
      '| header prefix:', authHeader.slice(0, 12),
    )
  }
  return !error
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (!AI_GATEWAY_API_KEY) {
    return errorResponse('AI_GATEWAY_API_KEY not configured in Edge Function secrets', 500)
  }

  const url = new URL(req.url)
  if (!url.pathname.endsWith('/evaluate') || req.method !== 'POST') {
    return errorResponse('Not found', 404)
  }

  if (!(await verifyAuth(req))) {
    return errorResponse('Unauthorized', 401)
  }

  let payload: { state?: string; questions?: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return errorResponse('Invalid JSON body')
  }

  if (!payload.state || !payload.questions) {
    return errorResponse('Missing required fields: state, questions')
  }

  const gatewayRes = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
      'ai-model-id': JEV_MODEL_ID,
      'ai-evaluation-model-specification-version': '4',
      'ai-gateway-protocol-version': '0.0.1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state: payload.state, questions: payload.questions }),
  })

  let data
  try {
    data = await gatewayRes.json()
  } catch {
    return errorResponse(`AI Gateway returned a non-JSON response (status ${gatewayRes.status})`, 502)
  }

  if (!gatewayRes.ok) {
    console.error('[jev-proxy] gateway error:', gatewayRes.status, data)
    return json({ error: data }, gatewayRes.status)
  }

  return json(data)
})
