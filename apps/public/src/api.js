/**
 * api.js — acceso de SOLO LECTURA del portal público a Supabase.
 *
 * Sin supabase-js: no hay cliente de autenticación, sesiones ni código administrativo en este bundle.
 * Usa únicamente la clave anónima (pública por diseño) y tres operaciones permitidas a `anon`:
 *   · RPC listar_publicaciones_publicas   → biblioteca (solo publicado, versión vigente)
 *   · RPC obtener_publicacion_publica     → una publicación publicada
 *   · POST /storage/v1/object/sign/…      → URL firmada de 300 s del archivo vigente (política de Storage)
 */
const BUCKET = 'soi-publico'
const SIGNED_SECONDS = 300

const env = () => ({
  url: String(import.meta.env?.VITE_SUPABASE_URL ?? '').replace(/\/+$/, ''),
  key: String(import.meta.env?.VITE_SUPABASE_ANON_KEY ?? ''),
})

function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
}

async function rpc(name, args) {
  const { url, key } = env()
  if (!url || !key) throw new Error('Sitio sin configurar')
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, { method: 'POST', headers: headers(key), body: JSON.stringify(args ?? {}) })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

/** Página de la biblioteca: [{ slug, titulo, descripcion, fecha_documento, categoria, … }]. */
export async function listarPublicaciones({ limit = 50, offset = 0 } = {}) {
  const rows = await rpc('listar_publicaciones_publicas', { p_limit: limit, p_offset: offset })
  return Array.isArray(rows) ? rows : []
}

/** Publicación publicada por slug, o null. */
export async function obtenerPublicacion(slug) {
  const rows = await rpc('obtener_publicacion_publica', { p_slug: slug })
  return Array.isArray(rows) ? (rows[0] ?? null) : null
}

/** URL firmada de corta vida para abrir (o descargar con nombre) el archivo vigente. */
export async function urlArchivo(storagePath, { download = null } = {}) {
  const { url, key } = env()
  const encoded = storagePath.split('/').map(encodeURIComponent).join('/')
  const res = await fetch(`${url}/storage/v1/object/sign/${BUCKET}/${encoded}`, {
    method: 'POST', headers: headers(key), body: JSON.stringify({ expiresIn: SIGNED_SECONDS }),
  })
  if (!res.ok) throw new Error('No se pudo obtener el documento')
  const { signedURL } = await res.json()
  const full = `${url}/storage/v1${signedURL}`
  return download ? `${full}${full.includes('?') ? '&' : '?'}download=${encodeURIComponent(download)}` : full
}
