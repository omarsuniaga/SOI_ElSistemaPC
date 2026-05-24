/**
 * Supabase Edge Function: groq-proxy
 *
 * Proxies chat/completion and audio/transcription requests to the Groq API.
 * The Groq API key lives in Deno.env (set via `supabase secrets set GROQ_API_KEY=...`)
 * and is NEVER exposed to the browser.
 *
 * Supported endpoints:
 *   POST /groq-proxy/chat        → https://api.groq.com/openai/v1/chat/completions
 *   POST /groq-proxy/transcribe  → https://api.groq.com/openai/v1/audio/transcriptions
 *   GET  /groq-proxy/models      → https://api.groq.com/openai/v1/models
 *
 * Auth: requires a valid Supabase JWT in the Authorization header (any logged-in user).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const GROQ_BASE    = 'https://api.groq.com/openai/v1'

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
  if (!authHeader) return false

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const client = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { error } = await client.auth.getUser()
  return !error
}

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (!GROQ_API_KEY) {
    return errorResponse('GROQ_API_KEY not configured in Edge Function secrets', 500)
  }

  // Require valid Supabase session
  const authed = await verifyAuth(req)
  if (!authed) {
    return errorResponse('Unauthorized', 401)
  }

  const url = new URL(req.url)
  // path will be like /groq-proxy/chat or /groq-proxy/transcribe
  const path = url.pathname.split('/').pop()

  // ── GET /models ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && path === 'models') {
    const upstream = await fetch(`${GROQ_BASE}/models`, {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    })
    const data = await upstream.json()
    return json(data, upstream.status)
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  // ── POST /chat ────────────────────────────────────────────────────────────
  if (path === 'chat') {
    let body: unknown
    try { body = await req.json() } catch { return errorResponse('Invalid JSON body') }

    const upstream = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await upstream.json()
    return json(data, upstream.status)
  }

  // ── POST /transcribe ─────────────────────────────────────────────────────
  if (path === 'transcribe') {
    // Forward the multipart/form-data directly
    const contentType = req.headers.get('content-type') ?? ''
    const upstream = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': contentType,
      },
      body: req.body,
    })
    const data = await upstream.json()
    return json(data, upstream.status)
  }

  return errorResponse('Unknown endpoint. Use /chat, /transcribe, or /models')
})
