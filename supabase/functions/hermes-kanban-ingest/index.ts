/**
 * Supabase Edge Function: hermes-kanban-ingest
 *
 * Fase 1 del puente Hermes Kanban <-> portales SOI.
 * Un poller que corre en la maquina Hermes (~/.hermes/scripts/kanban_soi_sync.py)
 * lee ~/.hermes/kanban.db en solo-lectura y hace POST aca con el set COMPLETO
 * de tarjetas en estados "activos" (review, blocked, ready, running). Esta
 * funcion espeja ese set en `public.hermes_kanban_cards` (service_role).
 * El portal (admin.html > Direccion & Hermes) solo LEE esa tabla.
 *
 * Auth: header `x-hermes-token`. Se valida contra HERMES_KANBAN_INGEST_SECRET
 * si esta definido; si no, cae a HERMES_EMAIL_TOKEN (mismo token de maquina que
 * usan las otras edge fns hermes-*).
 *
 * Body:
 *   {
 *     "cards": [
 *       { "card_id": "42", "board": "default", "title": "...", "status": "review",
 *         "assignee": "soi-worker", "priority": 2, "summary": "...",
 *         "hermes_updated_at": "2026-08-27T12:00:00Z", "raw": { ... } }
 *     ],
 *     "replace": true   // opcional (default true): borra de la tabla las card_id
 *                       // que no vengan en este payload (semantica de espejo total)
 *   }
 *
 * Respuesta: { ok: true, upserted: N, deleted: M }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const HERMES_TOKEN = Deno.env.get('HERMES_EMAIL_TOKEN') ?? ''
const INGEST_SECRET = Deno.env.get('HERMES_KANBAN_INGEST_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hermes-token',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

type CardIn = {
  card_id?: unknown
  board?: unknown
  title?: unknown
  status?: unknown
  assignee?: unknown
  priority?: unknown
  summary?: unknown
  hermes_updated_at?: unknown
  raw?: unknown
}

const str = (v: unknown): string | null => (v === undefined || v === null ? null : String(v))
const num = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Metodo no permitido' }, 405)

  const expected = INGEST_SECRET || HERMES_TOKEN
  if (!expected || req.headers.get('x-hermes-token') !== expected)
    return json({ error: 'No autorizado' }, 401)

  if (!SUPABASE_URL || !SERVICE_ROLE)
    return json({ error: 'Entorno Supabase incompleto' }, 500)

  let body: { cards?: CardIn[]; replace?: boolean }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON invalido' }, 400)
  }
  if (!Array.isArray(body.cards)) return json({ error: 'Falta el arreglo "cards"' }, 400)

  const rows = body.cards
    .map((c) => {
      const card_id = str(c.card_id)
      const title = str(c.title)
      const status = str(c.status)
      if (!card_id || !title || !status) return null
      return {
        card_id,
        board: str(c.board),
        title,
        status,
        assignee: str(c.assignee),
        priority: num(c.priority),
        summary: str(c.summary),
        hermes_updated_at: str(c.hermes_updated_at),
        raw: c.raw ?? null,
        synced_at: new Date().toISOString(),
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE)

  let upserted = 0
  if (rows.length > 0) {
    const { error } = await sb
      .from('hermes_kanban_cards')
      .upsert(rows, { onConflict: 'card_id' })
    if (error) return json({ error: `upsert fallo: ${error.message}` }, 500)
    upserted = rows.length
  }

  let deleted = 0
  const replace = body.replace !== false
  if (replace) {
    const keep = rows.map((r) => r.card_id)
    let del = sb.from('hermes_kanban_cards').delete()
    del = keep.length > 0 ? del.not('card_id', 'in', `(${keep.map((k) => JSON.stringify(k)).join(',')})`) : del.neq('card_id', '__none__')
    const { error, count } = await del.select('card_id', { count: 'exact' })
    if (error) return json({ error: `delete fallo: ${error.message}` }, 500)
    deleted = count ?? 0
  }

  return json({ ok: true, upserted, deleted })
})
