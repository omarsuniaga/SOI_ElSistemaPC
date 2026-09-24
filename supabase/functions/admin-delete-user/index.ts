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

  const callerRol = callerProfile?.rol
  if (callerRol !== 'admin' && callerRol !== 'superadmin') {
    return json({ error: 'Solo administradores pueden eliminar usuarios' }, 403)
  }

  let body: { userId?: string }
  try { body = await req.json() } catch { return json({ error: 'Body inválido' }, 400) }

  const { userId } = body
  if (!userId) return json({ error: 'userId es obligatorio' }, 400)
  if (userId === caller.id) {
    return json({ error: 'No podés eliminar tu propia cuenta' }, 400)
  }

  const { data: target } = await supabaseAdmin
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle()

  if (target?.rol === 'superadmin' && callerRol !== 'superadmin') {
    return json({ error: 'Solo un superadmin puede eliminar a otro superadmin' }, 403)
  }

  const { data: fichaMaestro } = await supabaseAdmin
    .from('maestros')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (fichaMaestro) {
    return json({
      error: 'Esta cuenta está vinculada a una ficha de maestro. Desactivala en lugar de eliminarla para conservar su historial.',
    }, 409)
  }

  const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (deleteErr) {
    // Las FKs RESTRICT/NO ACTION (pagos, auditoría, calendario...) bloquean
    // el borrado cuando la cuenta tiene historial: eso es lo deseado.
    return json({
      error: 'La cuenta tiene registros asociados y no se puede eliminar. Desactivala en su lugar.',
      detalle: deleteErr.message,
    }, 409)
  }

  return json({ ok: true, userId }, 200)
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
