import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !caller) return json({ error: 'Token inválido' }, 401)

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('rol')
    .eq('id', caller.id)
    .maybeSingle()

  if (callerProfile?.rol !== 'admin' && callerProfile?.rol !== 'superadmin') {
    return json({ error: 'Solo administradores pueden modificar usuarios' }, 403)
  }

  let body: { userId?: string; email?: string }
  try { body = await req.json() } catch { return json({ error: 'Body inválido' }, 400) }

  const userId = body.userId
  const email = body.email?.trim().toLowerCase()
  if (!userId || !email) return json({ error: 'userId y email son obligatorios' }, 400)
  if (!EMAIL_RE.test(email)) return json({ error: 'Correo inválido' }, 400)

  // email_confirm evita que Supabase mande un correo de confirmación: el SMTP
  // todavía no entrega a usuarios reales y el cambio lo hace un admin.
  const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { email, email_confirm: true }
  )
  if (updateErr || !updated?.user) {
    const msg = updateErr?.message ?? 'No se pudo actualizar el correo'
    const status = /already|registered|exists/i.test(msg) ? 409 : 400
    return json({ error: status === 409 ? 'Ese correo ya pertenece a otra cuenta' : msg }, status)
  }

  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .update({ email })
    .eq('id', userId)
  if (profileErr) {
    return json({ error: `Login actualizado, pero el perfil no: ${profileErr.message}` }, 500)
  }

  await supabaseAdmin.from('maestros').update({ correo: email }).eq('user_id', userId)

  return json({ ok: true, userId, email }, 200)
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
