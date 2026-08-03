import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VALID_ROLES = ['admin', 'maestro', 'cajero', 'inventarista'] as const
type Role = typeof VALID_ROLES[number]

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

  // Verify caller JWT and fetch their profile
  const token = authHeader.replace('Bearer ', '')
  const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !caller) return json({ error: 'Token inválido' }, 401)

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('rol')
    .eq('id', caller.id)
    .maybeSingle()

  if (callerProfile?.rol !== 'admin') {
    return json({ error: 'Solo administradores pueden crear usuarios' }, 403)
  }

  // Parse body
  let body: { nombre?: string; email?: string; password?: string; rol?: string; maestroId?: string }
  try { body = await req.json() } catch { return json({ error: 'Body inválido' }, 400) }

  const { nombre, email, password, rol, maestroId } = body

  if (!nombre || !email || !password) {
    return json({ error: 'nombre, email y password son obligatorios' }, 400)
  }
  if (!VALID_ROLES.includes(rol as Role)) {
    return json({ error: `Rol inválido. Opciones: ${VALID_ROLES.join(', ')}` }, 400)
  }

  // Create Supabase auth user (email already confirmed, no magic link needed).
  // Uses admin.createUser (service role) instead of client-side signUp so this
  // never touches the caller's own session, and never triggers the "send
  // confirmation email" auth hook that client-side signUp() goes through.
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: nombre, rol },
  })

  if (createErr || !created?.user) {
    return json({ error: createErr?.message ?? 'Error al crear usuario en auth' }, 400)
  }

  // Upsert profile row
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: created.user.id,
      email,
      nombre_completo: nombre,
      rol: rol as Role,
      estado: 'activo',
    })

  if (profileErr) {
    // Rollback auth user to avoid orphan accounts
    await supabaseAdmin.auth.admin.deleteUser(created.user.id)
    return json({ error: `Perfil no creado: ${profileErr.message}` }, 500)
  }

  // Vincular/crear la fila en `maestros` explícitamente. El trigger
  // on_profile_insert_maestro también hace esto sobre el insert de arriba,
  // pero no dependemos únicamente de él: esto es la fuente de verdad,
  // idempotente, y cualquier fallo queda visible en los logs de esta función
  // en vez de perderse en un trigger silencioso.
  if (rol === 'maestro') {
    // Si el llamador ya sabe a qué maestro apunta (ej: botón "Dar acceso"
    // desde el perfil de un maestro precargado en ACM), vincula por ID en
    // vez de por correo — el correo de login puede no coincidir con el que
    // ACM tiene registrado para esa persona.
    let existing: { id: string } | null = null
    if (maestroId) {
      const { data, error: findErr } = await supabaseAdmin
        .from('maestros')
        .select('id')
        .eq('id', maestroId)
        .maybeSingle()
      if (findErr) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id)
        return json({ error: `No se pudo buscar el maestro indicado: ${findErr.message}` }, 500)
      }
      if (!data) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id)
        return json({ error: 'El maestro indicado no existe' }, 404)
      }
      existing = data
    } else {
      const { data, error: findErr } = await supabaseAdmin
        .from('maestros')
        .select('id')
        .ilike('correo', email)
        .maybeSingle()
      if (findErr) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id)
        return json({ error: `No se pudo buscar maestro existente: ${findErr.message}` }, 500)
      }
      existing = data
    }

    if (existing) {
      const { error: linkErr } = await supabaseAdmin
        .from('maestros')
        .update({ user_id: created.user.id, correo: email, activo: true })
        .eq('id', existing.id)

      if (linkErr) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id)
        return json({ error: `No se pudo vincular al maestro existente: ${linkErr.message}` }, 500)
      }
    } else {
      const { error: insertErr } = await supabaseAdmin
        .from('maestros')
        .upsert({
          user_id: created.user.id,
          nombre_completo: nombre,
          correo: email,
          especialidad: '',
          activo: true,
        }, { onConflict: 'user_id' })

      if (insertErr) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id)
        return json({ error: `No se pudo crear la ficha de maestro: ${insertErr.message}` }, 500)
      }
    }
  }

  return json({ ok: true, user: { id: created.user.id, email, rol, estado: 'activo' } }, 200)
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
