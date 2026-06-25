/**
 * Supabase Edge Function: send-email
 *
 * Envía correo institucional vía Resend. La API key vive en Deno.env
 * (set con `supabase secrets set RESEND_API_KEY=...`) y NUNCA se expone al browser.
 * El remitente verificado vive en RESEND_FROM (ej. "El Sistema PC <comunicaciones@tudominio.org>").
 *
 * Endpoint:
 *   POST /send-email
 *   body: { to: string[] | string, subject: string, html?: string, text?: string,
 *           replyTo?: string, from?: string }
 *
 * Resend permite hasta 50 destinatarios por request; este handler hace chunking
 * automático y devuelve el detalle por lote.
 *
 * Auth: requiere un JWT válido de Supabase (cualquier usuario logueado).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'El Sistema PC <onboarding@resend.dev>'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const MAX_PER_BATCH = 50

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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (!RESEND_API_KEY) {
    return errorResponse('RESEND_API_KEY no configurada en los secrets de la Edge Function', 500)
  }

  if (req.method !== 'POST') {
    return errorResponse('Método no permitido', 405)
  }

  const ok = await verifyAuth(req)
  if (!ok) return errorResponse('No autorizado', 401)

  let payload: {
    to?: string[] | string
    subject?: string
    html?: string
    text?: string
    replyTo?: string
    from?: string
  }
  try {
    payload = await req.json()
  } catch {
    return errorResponse('JSON inválido en el body')
  }

  const subject = (payload.subject ?? '').trim()
  const recipients = Array.isArray(payload.to)
    ? payload.to
    : payload.to
      ? [payload.to]
      : []

  const cleanRecipients = recipients
    .map((r) => String(r).trim())
    .filter((r) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r))

  if (cleanRecipients.length === 0) {
    return errorResponse('No hay destinatarios con correo válido')
  }
  if (!subject) return errorResponse('El asunto (subject) es obligatorio')
  if (!payload.html && !payload.text) return errorResponse('Falta el contenido (html o text)')

  const from = payload.from || RESEND_FROM
  const results: Array<{ batch: number; ok: boolean; id?: string; error?: string; count: number }> = []

  // Resend permite hasta 50 destinatarios por request → chunking.
  const batches = chunk(cleanRecipients, MAX_PER_BATCH)
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    try {
      const res = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          // Para envíos masivos preservando privacidad, todos van en bcc.
          to: from,
          bcc: batch,
          subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        results.push({ batch: i, ok: false, error: data?.message || `HTTP ${res.status}`, count: batch.length })
      } else {
        results.push({ batch: i, ok: true, id: data?.id, count: batch.length })
      }
    } catch (err) {
      results.push({ batch: i, ok: false, error: String(err), count: batch.length })
    }
  }

  const enviados = results.filter((r) => r.ok).reduce((a, r) => a + r.count, 0)
  const fallidos = cleanRecipients.length - enviados

  return json({
    ok: fallidos === 0,
    total: cleanRecipients.length,
    enviados,
    fallidos,
    batches: results,
  })
})
