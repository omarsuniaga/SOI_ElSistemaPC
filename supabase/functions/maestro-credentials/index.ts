import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const MAESTRO_CREDENTIALS_SECRET = Deno.env.get('MAESTRO_CREDENTIALS_SECRET') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_ROLES = new Set(['admin', 'superadmin', 'direccion', 'coordinacion_academica'])
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400) {
  return json({ ok: false, error: message }, status)
}

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase no está configurado correctamente en la Edge Function')
  }
  if (!MAESTRO_CREDENTIALS_SECRET) {
    throw new Error('MAESTRO_CREDENTIALS_SECRET no está configurado')
  }
}

function serviceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function authClient(authHeader: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) throw new Error('No autorizado')

  const client = authClient(authHeader)
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('No autorizado')

  const admin = serviceClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, rol, estado, email, nombre_completo')
    .eq('id', data.user.id)
    .maybeSingle()

  if (
    profileError ||
    !profile ||
    !ADMIN_ROLES.has(String(profile.rol || '').toLowerCase()) ||
    profile.estado !== 'activo'
  ) {
    throw new Error('No autorizado')
  }

  return { user: data.user, profile }
}

async function getMaestroOrFail(maestroId: string) {
  const db = serviceClient()
  const { data, error } = await db
    .from('maestros')
    .select(
      'id, user_id, nombre_completo, correo, especialidad, instrumento_principal, resena, activo',
    )
    .eq('id', maestroId)
    .maybeSingle()

  if (error) throw new Error(error.message || 'No se pudo cargar el maestro')
  if (!data) throw new Error('Maestro no encontrado')
  return data
}

async function getCredentialRow(maestroId: string) {
  const db = serviceClient()
  const { data, error } = await db
    .from('maestro_access_credentials')
    .select(
      'maestro_id, password_ciphertext, password_iv, password_version, last_generated_at, last_revealed_at, last_revealed_by',
    )
    .eq('maestro_id', maestroId)
    .maybeSingle()

  if (error) throw new Error(error.message || 'No se pudo leer la credencial')
  return data
}

function generatePassword(length = 14) {
  const picks = [
    _pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    _pick('abcdefghijklmnopqrstuvwxyz'),
    _pick('23456789'),
    _pick('!@#$%&*?'),
  ]

  while (picks.length < length) {
    picks.push(_pick(PASSWORD_ALPHABET))
  }

  for (let i = picks.length - 1; i > 0; i--) {
    const j = _randomInt(i + 1)
    ;[picks[i], picks[j]] = [picks[j], picks[i]]
  }

  return picks.join('').slice(0, length)
}

function _pick(chars: string) {
  return chars[_randomInt(chars.length)]
}

function _randomInt(max: number) {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return Number(arr[0] % max)
}

function _toBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function _fromBase64(value: string) {
  const bin = atob(value)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function _deriveKey(secret: string) {
  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret))
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

async function encryptPassword(plain: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await _deriveKey(MAESTRO_CREDENTIALS_SECRET)
  const encoder = new TextEncoder()
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plain))
  return {
    iv: _toBase64(iv),
    ciphertext: _toBase64(new Uint8Array(cipher)),
  }
}

async function decryptPassword(ciphertext: string, iv: string) {
  const key = await _deriveKey(MAESTRO_CREDENTIALS_SECRET)
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: _fromBase64(iv) },
    key,
    _fromBase64(ciphertext),
  )
  return new TextDecoder().decode(plain)
}

async function ensureAuthAndProfile(
  maestro: {
    id: string
    user_id: string | null
    nombre_completo: string
    correo: string
    especialidad?: string | null
    instrumento_principal?: string | null
    resena?: string | null
  },
  password: string,
) {
  const db = serviceClient()
  const email = String(maestro.correo || '')
    .trim()
    .toLowerCase()
  if (!email) throw new Error('El maestro no tiene correo registrado')

  let userId = maestro.user_id || null

  if (!userId) {
    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    userId = profile?.id || null
  }

  const metadata = {
    full_name: maestro.nombre_completo || email,
    rol: 'maestro',
    instrumento: maestro.instrumento_principal || maestro.especialidad || '',
    resena: maestro.resena || null,
  }

  if (!userId) {
    const { data: created, error: createError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    })

    if (createError || !created.user) {
      throw new Error(createError?.message || 'No se pudo crear el acceso de maestro')
    }

    userId = created.user.id
  } else {
    const { error: updateError } = await db.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    })

    if (updateError) {
      throw new Error(updateError.message || 'No se pudo actualizar la contraseña del maestro')
    }
  }

  const { error: profileUpsertError } = await db.from('profiles').upsert(
    {
      id: userId,
      email,
      nombre_completo: maestro.nombre_completo || email,
      rol: 'maestro',
      estado: 'activo',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (profileUpsertError) {
    throw new Error(profileUpsertError.message || 'No se pudo sincronizar el profile del maestro')
  }

  const { error: maestroUpdateError } = await db
    .from('maestros')
    .update({
      user_id: userId,
      correo: email,
      nombre_completo: maestro.nombre_completo,
      especialidad: maestro.especialidad || maestro.instrumento_principal || '',
      activo: maestro.activo !== false,
    })
    .eq('id', maestro.id)

  if (maestroUpdateError) {
    throw new Error(maestroUpdateError.message || 'No se pudo vincular el maestro al usuario')
  }

  return { userId, email }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    assertConfig()
  } catch (err) {
    return errorResponse(String((err as Error).message), 500)
  }

  if (req.method !== 'POST') return errorResponse('Método no permitido', 405)

  let payload: { action?: string; maestroId?: string }
  try {
    payload = await req.json()
  } catch {
    return errorResponse('JSON inválido en el body')
  }

  const action = String(payload.action || '').trim()
  const maestroId = String(payload.maestroId || '').trim()

  if (!action) return errorResponse('La acción es obligatoria')
  if (!maestroId) return errorResponse('El maestroId es obligatorio')

  let caller
  try {
    caller = await requireAdmin(req)
  } catch (err) {
    return errorResponse(String((err as Error).message), 401)
  }

  const maestro = await getMaestroOrFail(maestroId)
  if (!maestro.activo && action !== 'status') {
    return errorResponse('El maestro está inactivo', 422)
  }

  if (action === 'status') {
    const vault = await getCredentialRow(maestroId)
    return json({
      ok: true,
      maestroId: maestro.id,
      nombre_completo: maestro.nombre_completo,
      email: maestro.correo,
      userLinked: !!maestro.user_id,
      hasCredentials: !!vault,
      lastGeneratedAt: vault?.last_generated_at || null,
      lastRevealedAt: vault?.last_revealed_at || null,
      passwordVersion: vault?.password_version || 0,
    })
  }

  if (action === 'reveal') {
    const vault = await getCredentialRow(maestroId)
    if (!vault)
      return errorResponse('Todavía no se ha generado una contraseña para este maestro', 404)

    const password = await decryptPassword(vault.password_ciphertext, vault.password_iv)
    const db = serviceClient()
    await db
      .from('maestro_access_credentials')
      .update({
        last_revealed_at: new Date().toISOString(),
        last_revealed_by: caller.profile.id,
      })
      .eq('maestro_id', maestroId)

    return json({
      ok: true,
      maestroId: maestro.id,
      email: maestro.correo,
      password,
      lastGeneratedAt: vault.last_generated_at,
    })
  }

  if (action === 'generate' || action === 'regenerate') {
    const db = serviceClient()
    const password = generatePassword()
    const { userId, email } = await ensureAuthAndProfile(maestro, password)
    const { data: existingVault } = await db
      .from('maestro_access_credentials')
      .select('password_version')
      .eq('maestro_id', maestro.id)
      .maybeSingle()

    const encrypted = await encryptPassword(password)

    const { error: upsertError } = await db.from('maestro_access_credentials').upsert(
      {
        maestro_id: maestro.id,
        password_ciphertext: encrypted.ciphertext,
        password_iv: encrypted.iv,
        password_version: (existingVault?.password_version || 0) + 1,
        last_generated_at: new Date().toISOString(),
        last_revealed_at: null,
        last_revealed_by: null,
      },
      { onConflict: 'maestro_id' },
    )

    if (upsertError) {
      return errorResponse(upsertError.message || 'No se pudo guardar la contraseña cifrada', 500)
    }

    return json({
      ok: true,
      maestroId: maestro.id,
      userId,
      email,
      password,
      passwordVersion: (existingVault?.password_version || 0) + 1,
      generatedAt: new Date().toISOString(),
      message: 'Credenciales actualizadas correctamente',
    })
  }

  return errorResponse(`Acción no soportada: ${action}`, 400)
})
