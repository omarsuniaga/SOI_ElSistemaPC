/**
 * storageFiles.js
 *
 * Acceso a archivos privados de Supabase Storage mediante URLs firmadas.
 *
 * Los buckets con documentos sensibles (justificaciones, ausencias, planificación,
 * contratos de comodato, adjuntos de tareas) son PRIVADOS: no se guardan URLs públicas, se
 * guarda la ruta (path) del objeto y se genera una URL firmada de corta duración al mostrarlo.
 *
 * Referencias aceptadas (por compatibilidad con datos antiguos):
 *   1. Ruta relativa al bucket por defecto:     "justificaciones/<uid>/123_abc.jpg"
 *   2. URL de objeto de Supabase (public/sign/authenticated):
 *        ".../storage/v1/object/<modo>/<bucket>/<path>"
 *      → si el bucket es privado se firma; si es público se devuelve tal cual.
 *   3. data: de imagen/PDF (legado base64), blob: y http(s) externas → se devuelven tal cual.
 *
 * Seguridad:
 *   - Solo se firman buckets de PRIVATE_BUCKETS; la autorización real la impone la RLS de
 *     storage.objects (createSignedUrl exige permiso SELECT del usuario), no este helper.
 *   - Las rutas se validan (sin "..", ".", segmentos vacíos, barras invertidas, caracteres de
 *     control ni esquemas como "javascript:").
 *   - Los enlaces generados solo admiten esquemas seguros; cualquier otro valor se anula a "#".
 */

import { supabase } from './supabaseClient.js'

export const DEFAULT_BUCKET = 'documentos'
export const SIGNED_URL_TTL_SECONDS = 300

/** Buckets privados que este helper puede firmar. */
export const PRIVATE_BUCKETS = Object.freeze(['documentos', 'planificacion-docs', 'tareas'])

const SUPABASE_OBJECT_URL = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?#]+)/
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i
const SAFE_DATA_URL = /^data:(?:image\/(?:png|jpe?g|webp|gif)|application\/pdf);base64,[a-z0-9+/=\s]+$/i

/** true si la ruta es segura (sin traversal, vacíos ni caracteres de control). */
function isSafePath(path) {
  if (!path || path.length > 1024) return false
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(path)) return false
  return path.split('/').every((seg) => seg !== '' && seg !== '.' && seg !== '..')
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

/**
 * Normaliza una referencia a { bucket, path }, o null si no es un objeto de Storage.
 * @param {string|null|undefined} ref
 * @param {string} [defaultBucket]
 * @returns {{bucket: string, path: string} | null}
 */
export function parseStorageRef(ref, defaultBucket = DEFAULT_BUCKET) {
  if (!ref || typeof ref !== 'string') return null
  const value = ref.trim()
  if (!value || /^(data|blob):/i.test(value)) return null

  if (/^https?:\/\//i.test(value)) {
    const match = value.match(SUPABASE_OBJECT_URL)
    if (!match) return null
    const path = safeDecode(match[2])
    if (path === null || !isSafePath(path)) return null
    return { bucket: match[1], path }
  }

  // Cualquier otro esquema (javascript:, vbscript:, file:, ...) no es una ruta de Storage.
  if (HAS_SCHEME.test(value)) return null

  const path = value.replace(/^\/+/, '')
  return isSafePath(path) ? { bucket: defaultBucket, path } : null
}

/** true si el esquema de una URL ya resuelta es seguro para navegar o usar en <img>/<a>. */
export function isSafeUrl(url) {
  if (typeof url !== 'string') return false
  return /^(https?:|blob:)/i.test(url) || SAFE_DATA_URL.test(url)
}

/**
 * Devuelve una URL utilizable en <a href> / <img src> para la referencia dada.
 * Objetos de buckets privados → URL firmada. Referencias que no son objetos de Storage
 * (http externo, data:, blob:) o que apuntan a buckets públicos → valor original.
 * @param {string|null|undefined} ref
 * @param {{ bucket?: string, expiresIn?: number }} [opts]
 * @returns {Promise<string|null>}
 */
export async function resolveStorageUrl(ref, opts = {}) {
  if (!ref) return null
  const parsed = parseStorageRef(ref, opts.bucket || DEFAULT_BUCKET)
  if (!parsed) {
    if (typeof ref === 'string' && /^https?:\/\//i.test(ref.trim()) && SUPABASE_OBJECT_URL.test(ref)) {
      // URL de Supabase con ruta inválida (p. ej. traversal): nunca se devuelve.
      throw new Error('Referencia de archivo no válida.')
    }
    return isSafeUrl(ref) ? ref : null
  }

  // Bucket público (instrumentos-fotos, signage…): la URL pública ya funciona sin firma.
  if (!PRIVATE_BUCKETS.includes(parsed.bucket)) {
    if (/^https?:\/\//i.test(ref.trim())) return ref
    return supabase.storage.from(parsed.bucket).getPublicUrl(parsed.path)?.data?.publicUrl || null
  }

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, opts.expiresIn || SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl || !isSafeUrl(data.signedUrl)) {
    throw error || new Error('No se pudo generar la URL firmada del archivo.')
  }
  return data.signedUrl
}

/**
 * Abre el archivo en una pestaña nueva con una URL firmada recién generada.
 * La pestaña se abre de forma síncrona (dentro del gesto del usuario) para que el navegador
 * no la bloquee, y se desvincula de la página actual (opener = null).
 */
export async function openStorageFile(ref, opts = {}) {
  const tab = window.open('', '_blank')
  if (tab) {
    try { tab.opener = null } catch { /* navegadores que no lo permiten */ }
  }
  try {
    const url = await resolveStorageUrl(ref, opts)
    if (!url) throw new Error('Archivo no disponible.')
    if (tab) tab.location.href = url
    else window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err) {
    if (tab) tab.close()
    throw err
  }
}

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Atributos HTML para un enlace a un archivo guardado:
 *   - objeto de Storage → href="#" + data-storage-* (se firma al hacer clic);
 *   - URL ya utilizable (http/https/blob/data de imagen o PDF) → href directo;
 *   - cualquier otra cosa → href="#" inerte (nunca "javascript:" ni "data:text/html").
 */
export function storageLinkAttrs(ref, bucket = DEFAULT_BUCKET) {
  if (parseStorageRef(ref, bucket)) {
    return `href="#" data-storage-ref="${escapeAttr(ref)}" data-storage-bucket="${escapeAttr(bucket)}"`
  }
  return isSafeUrl(ref) ? `href="${escapeAttr(ref)}"` : 'href="#" aria-disabled="true"'
}

let handlerInstalled = false

/**
 * Instala un único listener delegado: los enlaces con data-storage-ref piden la URL firmada
 * en el momento del clic. Idempotente. Si nadie atiende el evento "storage:error"
 * (cancelable), se avisa con alert().
 */
export function installStorageLinkHandler(root = document) {
  if (handlerInstalled || !root?.addEventListener) return
  handlerInstalled = true
  root.addEventListener('click', async (event) => {
    const link = event.target?.closest?.('[data-storage-ref]')
    if (!link) return
    event.preventDefault()
    try {
      await openStorageFile(link.dataset.storageRef, { bucket: link.dataset.storageBucket || DEFAULT_BUCKET })
    } catch (err) {
      console.error('[storageFiles] No se pudo abrir el archivo:', err)
      const notified = new CustomEvent('storage:error', { detail: { error: err }, cancelable: true })
      if (window.dispatchEvent(notified)) {
        window.alert?.('No se pudo abrir el archivo. Intenta de nuevo.')
      }
    }
  })
}
