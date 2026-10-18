/**
 * documentosPublicosSupabase.js — implementación real (Supabase) del módulo.
 *
 * Escritura SOLO por RPC (crear/actualizar/estado/versiones): las tablas no admiten DML
 * directo desde el navegador. Lectura pública SOLO por obtener_publicacion_publica y por
 * URL firmada de corta vida sobre el bucket privado 'soi-publico'.
 */
import { supabase } from '../../../lib/supabaseClient.js'
import { validateFile, sha256Hex, buildStoragePath } from '../lib/fileValidation.js'

export const BUCKET = 'soi-publico'
const SIGNED_URL_SECONDS = 300

const LIST_SELECT =
  '*, version:publicaciones_documentos_versiones!publicaciones_documentos_version_actual_fk(numero,mime_type,extension,size_bytes,nombre_original,storage_path)'

function client() {
  if (!supabase) throw new Error('Supabase no está configurado')
  return supabase
}

function unwrap({ data, error }) {
  if (error) throw new Error(error.message || 'Error de base de datos')
  return data
}

export async function listarPublicaciones() {
  return unwrap(await client().from('publicaciones_documentos').select(LIST_SELECT).order('updated_at', { ascending: false })) ?? []
}

export async function obtenerPublicacion(id) {
  return unwrap(await client().from('publicaciones_documentos').select(LIST_SELECT).eq('id', id).maybeSingle())
}

export async function crearPublicacion({ titulo, descripcion, fecha, categoria }) {
  return unwrap(await client().rpc('crear_publicacion_documento', {
    p_titulo: titulo, p_descripcion: descripcion ?? null, p_fecha: fecha ?? null, p_categoria: categoria ?? 'general',
  }))
}

export async function actualizarPublicacion(id, { titulo, descripcion, fecha, categoria }) {
  return unwrap(await client().rpc('actualizar_publicacion_documento', {
    p_id: id, p_titulo: titulo, p_descripcion: descripcion ?? null, p_fecha: fecha ?? null, p_categoria: categoria ?? null,
  }))
}

export async function cambiarEstado(id, estado) {
  return unwrap(await client().rpc('cambiar_estado_publicacion_documento', { p_id: id, p_estado: estado }))
}

/**
 * Sube un archivo y lo registra como nueva versión vigente (subida inicial o reemplazo).
 * El slug —y por tanto la URL y el QR— no cambia.
 */
export async function subirVersion(publicacionId, file, motivo = null) {
  const check = await validateFile(file)
  if (!check.ok) throw new Error(check.error)
  const sha = await sha256Hex(file)
  const path = buildStoragePath(publicacionId, check.ext)
  const sb = client()

  const up = await sb.storage.from(BUCKET).upload(path, file, { contentType: check.mime, upsert: false, cacheControl: '3600' })
  if (up.error) throw new Error(`No se pudo subir el archivo: ${up.error.message}`)

  // Etapa 2 (migración staged/20261018130000): el registro pasa por la Edge Function, que verifica
  // en servidor la firma real del archivo. Mientras no esté desplegada se usa la RPC directa.
  const serverVerify = import.meta.env?.VITE_DOCS_SERVER_VERIFY === 'true'
  const reg = serverVerify
    ? await invokeVerifiedRegistration(sb, { publicacion_id: publicacionId, storage_path: path, nombre_original: file.name.slice(0, 255), motivo })
    : await sb.rpc('registrar_version_documento', {
      p_publicacion_id: publicacionId, p_storage_path: path, p_mime: check.mime, p_size: file.size,
      p_sha256: sha, p_nombre_original: file.name.slice(0, 255), p_motivo: motivo,
    })
  if (reg.error) {
    // Intento de limpieza; solo superadmin puede borrar huérfanos (si falla queda como huérfano inocuo).
    await sb.storage.from(BUCKET).remove([path]).catch(() => {})
    throw new Error(reg.error.message || 'No se pudo registrar la versión')
  }
  return reg.data
}

async function invokeVerifiedRegistration(sb, body) {
  const { data, error } = await sb.functions.invoke('registrar-version-documento', { body })
  if (error) {
    let message = error.message
    try { message = (await error.context?.json?.())?.error ?? message } catch { /* cuerpo no JSON */ }
    return { data: null, error: { message } }
  }
  return { data: data?.version ?? null, error: null }
}

export async function activarVersion(publicacionId, versionId) {
  return unwrap(await client().rpc('activar_version_documento', { p_publicacion_id: publicacionId, p_version_id: versionId }))
}

export async function listarVersiones(publicacionId) {
  return unwrap(await client().from('publicaciones_documentos_versiones').select('*').eq('publicacion_id', publicacionId).order('numero', { ascending: false })) ?? []
}

export async function listarEventos(publicacionId) {
  return unwrap(await client().from('publicaciones_documentos_eventos').select('*').eq('publicacion_id', publicacionId).order('id', { ascending: false }).limit(100)) ?? []
}

/** URL firmada para que un administrador previsualice cualquier versión (incluso borradores). */
export async function urlArchivoAdmin(storagePath) {
  const { data, error } = await client().storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_SECONDS)
  if (error) throw new Error(error.message)
  return data.signedUrl
}

/** Lectura pública (anon): metadatos de una publicación PUBLICADA, o null. */
export async function obtenerPublicacionPublica(slug) {
  const rows = unwrap(await client().rpc('obtener_publicacion_publica', { p_slug: slug }))
  return Array.isArray(rows) ? (rows[0] ?? null) : (rows ?? null)
}

/** URL firmada (5 min) del archivo vigente de una publicación publicada. */
export async function urlArchivoPublico(storagePath, { download = null } = {}) {
  const opts = download ? { download } : undefined
  const { data, error } = await client().storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_SECONDS, opts)
  if (error) throw new Error('No se pudo obtener el documento. Puede haber sido despublicado.')
  return data.signedUrl
}
