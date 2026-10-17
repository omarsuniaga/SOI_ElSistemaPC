/**
 * storageFiles.js
 *
 * Acceso a archivos privados de Supabase Storage mediante URLs firmadas.
 *
 * Los buckets con documentos sensibles (justificaciones, ausencias, planificación,
 * contratos de comodato) son PRIVADOS: no se guardan URLs públicas, se guarda la
 * ruta (path) del objeto y se genera una URL firmada de corta duración al mostrarlo.
 *
 * El helper acepta tres formas de referencia para mantener compatibilidad:
 *   1. Ruta relativa al bucket por defecto:   "justificaciones/123_abc.jpg"
 *   2. URL pública/firmada heredada de Supabase:
 *        ".../storage/v1/object/(public|sign|authenticated)/<bucket>/<path>"
 *   3. data: / blob: / URLs externas → se devuelven tal cual (legado base64).
 */

import { supabase } from './supabaseClient.js'

export const DEFAULT_BUCKET = 'documentos'
export const SIGNED_URL_TTL_SECONDS = 300

const SUPABASE_OBJECT_URL = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?#]+)/

/**
 * Normaliza una referencia a { bucket, path }, o null si no es un objeto de Storage.
 * @param {string|null|undefined} ref
 * @param {string} [defaultBucket]
 * @returns {{bucket: string, path: string} | null}
 */
export function parseStorageRef(ref, defaultBucket = DEFAULT_BUCKET) {
  if (!ref || typeof ref !== 'string') return null
  if (/^(data|blob):/i.test(ref)) return null

  if (/^https?:\/\//i.test(ref)) {
    const match = ref.match(SUPABASE_OBJECT_URL)
    if (!match) return null
    return { bucket: match[1], path: decodeURIComponent(match[2]) }
  }

  const path = ref.replace(/^\/+/, '')
  if (!path || path.includes('..')) return null
  return { bucket: defaultBucket, path }
}

/**
 * Devuelve una URL utilizable en <a href> / <img src> para la referencia dada.
 * Para objetos de Storage genera una URL firmada; para el resto devuelve el valor original.
 * @param {string|null|undefined} ref
 * @param {{ bucket?: string, expiresIn?: number }} [opts]
 * @returns {Promise<string|null>}
 */
export async function resolveStorageUrl(ref, opts = {}) {
  if (!ref) return null
  const parsed = parseStorageRef(ref, opts.bucket || DEFAULT_BUCKET)
  if (!parsed) return ref

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, opts.expiresIn || SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) {
    throw error || new Error('No se pudo generar la URL firmada del archivo.')
  }
  return data.signedUrl
}

/** Abre el archivo en una pestaña nueva usando una URL firmada recién generada. */
export async function openStorageFile(ref, opts = {}) {
  // La pestaña se abre de forma síncrona para no ser bloqueada por el navegador.
  const tab = window.open('', '_blank', 'noopener')
  try {
    const url = await resolveStorageUrl(ref, opts)
    if (!url) throw new Error('Archivo no disponible.')
    if (tab) tab.location.href = url
    else window.open(url, '_blank', 'noopener')
  } catch (err) {
    if (tab) tab.close()
    throw err
  }
}

/** Atributos HTML para un enlace que se resuelve al hacer clic (ver installStorageLinkHandler). */
export function storageLinkAttrs(ref, bucket = DEFAULT_BUCKET) {
  const safe = String(ref ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  // Referencias que no son objetos de Storage (http externo, legado) se enlazan directamente.
  if (!parseStorageRef(ref, bucket)) return `href="${safe}"`
  return `href="#" data-storage-ref="${safe}" data-storage-bucket="${bucket}"`
}

let handlerInstalled = false

/**
 * Instala un único listener delegado: los enlaces con data-storage-ref piden la URL
 * firmada en el momento del clic. Idempotente.
 */
export function installStorageLinkHandler(root = document) {
  if (handlerInstalled || !root?.addEventListener) return
  handlerInstalled = true
  root.addEventListener('click', async (event) => {
    const link = event.target.closest?.('[data-storage-ref]')
    if (!link) return
    event.preventDefault()
    try {
      await openStorageFile(link.dataset.storageRef, { bucket: link.dataset.storageBucket || DEFAULT_BUCKET })
    } catch (err) {
      console.error('[storageFiles] No se pudo abrir el archivo:', err)
      window.alert?.('No se pudo abrir el archivo. Intenta de nuevo.')
    }
  })
}
