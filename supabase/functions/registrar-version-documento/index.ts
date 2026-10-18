// Edge Function: registrar-version-documento
//
// Registra un archivo YA subido a 'soi-publico' como nueva versión de una publicación, tras
// verificar en SERVIDOR su contenido real. Es el único camino para registrar versiones cuando
// está aplicada la migración staged/20261018130000 (la RPC directa queda revocada).
//
// Flujo: JWT del usuario → es admin/superadmin (RPC con su JWT) → descarga con service_role →
// firma (magic bytes) y tamaño → SHA-256 real → RPC registrar_version_documento_verificada.
// Si el contenido no es válido, borra el objeto subido y responde 422.
//
// No usa secretos propios: SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY los
// inyecta la plataforma. NO está desplegada (pendiente de autorización).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ALLOWED, verifyObject } from './signature.ts'

const BUCKET = 'soi-publico'
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const PATH_RE = new RegExp(`^(${UUID})/${UUID}\\.(pdf|jpg|png|webp)$`)

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } })

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'No autenticado' }, 401)

  let body: { publicacion_id?: string; storage_path?: string; nombre_original?: string; motivo?: string | null }
  try { body = await req.json() } catch { return json({ error: 'JSON inválido' }, 400) }
  const { publicacion_id, storage_path, nombre_original, motivo } = body
  const m = typeof storage_path === 'string' ? PATH_RE.exec(storage_path) : null
  if (!m || m[1] !== publicacion_id) return json({ error: 'Ruta de archivo inválida' }, 400)

  const url = Deno.env.get('SUPABASE_URL')!
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) return json({ error: 'No autenticado' }, 401)

  const { data: allowed, error: roleError } = await userClient.rpc('puede_gestionar_documentos_publicos')
  if (roleError || allowed !== true) return json({ error: 'No autorizado' }, 403)

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  const { data: blob, error: dlError } = await admin.storage.from(BUCKET).download(storage_path!)
  if (dlError || !blob) return json({ error: 'El archivo no existe en el almacenamiento' }, 404)

  const bytes = new Uint8Array(await blob.arrayBuffer())
  const verdict = verifyObject(bytes, storage_path!)
  if (!verdict.ok) {
    await admin.storage.from(BUCKET).remove([storage_path!]) // no dejar contenido inválido en el bucket
    return json({ error: verdict.error }, verdict.status ?? 422)
  }

  const { data, error } = await admin.rpc('registrar_version_documento_verificada', {
    p_actor: userData.user.id,
    p_publicacion_id: publicacion_id,
    p_storage_path: storage_path,
    p_mime: ALLOWED[verdict.type!].mime,
    p_size: bytes.length,
    p_sha256: await sha256Hex(bytes),
    p_nombre_original: String(nombre_original ?? 'documento').slice(0, 255),
    p_motivo: motivo ?? null,
  })
  if (error) return json({ error: error.message }, error.code === '42501' ? 403 : 400)
  return json({ version: data })
})
