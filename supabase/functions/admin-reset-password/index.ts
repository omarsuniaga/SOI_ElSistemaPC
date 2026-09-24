import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    return json({ error: 'Solo administradores pueden resetear contraseñas' }, 403)
  }

  let body: { userId?: string; password?: string }
  try { body = await req.json() } catch { return json({ error: 'Body inválido' }, 400) }

  const { userId, password } = body

  if (!userId || !password) {
    return json({ error: 'userId y password son obligatorios' }, 400)
  }
  if (password.length < 8) {
    return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400)
  }

  // No permitir que un admin se resetee su propia contraseña por este atajo —
  // para eso ya existe el flujo self-service normal (perfil / forgot-password).
  if (userId === caller.id) {
    return json({ error: 'Usá tu propio flujo de cambio de contraseña, no este panel' }, 400)
  }

  const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password }
  )

  if (updateErr || !updated?.user) {
    return json({ error: updateErr?.message ?? 'No se pudo actualizar la contraseña' }, 400)
  }

  return json({ ok: true, userId: updated.user.id, email: updated.user.email }, 200)
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
