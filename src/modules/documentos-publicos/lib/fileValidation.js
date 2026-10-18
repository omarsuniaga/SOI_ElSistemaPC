/**
 * fileValidation.js — validación de archivos antes de subirlos al bucket 'soi-publico'.
 *
 * Valida extensión, tamaño y CONTENIDO (firma / magic bytes). El MIME declarado por el
 * navegador y la extensión nunca bastan: el tipo real lo determina la firma del archivo.
 * La base de datos y el bucket repiten el control de tamaño, MIME y extensión; la firma
 * solo puede comprobarse aquí (ver docs/specs/documentos-publicos-qr/ESPECIFICACION.md §6).
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024

/** @type {Record<string, { mime: string, ext: string }>} */
export const ALLOWED_TYPES = Object.freeze({
  pdf: { mime: 'application/pdf', ext: 'pdf' },
  jpg: { mime: 'image/jpeg', ext: 'jpg' },
  png: { mime: 'image/png', ext: 'png' },
  webp: { mime: 'image/webp', ext: 'webp' },
})

const EXT_ALIASES = { jpeg: 'jpg', jpe: 'jpg' }

/** Extensión normalizada en minúsculas, o '' si no hay. */
export function normalizedExtension(fileName = '') {
  const m = /\.([A-Za-z0-9]+)$/.exec(String(fileName).trim())
  if (!m) return ''
  const ext = m[1].toLowerCase()
  return EXT_ALIASES[ext] ?? ext
}

const startsWith = (bytes, sig, offset = 0) => sig.every((b, i) => bytes[offset + i] === b)

/**
 * Detecta el tipo por firma. Devuelve 'pdf' | 'jpg' | 'png' | 'webp' | null.
 * @param {Uint8Array} bytes primeros bytes del archivo (≥ 12 recomendados)
 */
export function detectSignature(bytes) {
  if (!bytes || bytes.length < 4) return null
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf' // %PDF-
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  if (bytes.length >= 12 && startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp'
  return null
}

/**
 * Valida un File/Blob. Devuelve { ok, error?, type?, mime?, ext? }.
 * Rechaza: vacío, > 10 MB, extensión no permitida, firma desconocida, firma ≠ extensión,
 * MIME declarado incompatible con la firma.
 */
export async function validateFile(file) {
  if (!file) return { ok: false, error: 'Seleccione un archivo.' }
  if (!file.size) return { ok: false, error: 'El archivo está vacío.' }
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: 'El archivo supera el máximo de 10 MB.' }

  const ext = normalizedExtension(file.name)
  if (!ALLOWED_TYPES[ext]) return { ok: false, error: 'Formato no permitido. Use PDF, JPG, PNG o WebP.' }

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const real = detectSignature(head)
  if (!real) return { ok: false, error: 'El contenido del archivo no corresponde a un PDF, JPG, PNG o WebP válido.' }
  if (real !== ext) return { ok: false, error: `El contenido es ${real.toUpperCase()} pero la extensión indica .${ext}.` }

  const declared = (file.type || '').toLowerCase()
  if (declared && declared !== ALLOWED_TYPES[real].mime && !(real === 'jpg' && declared === 'image/jpg')) {
    return { ok: false, error: 'El tipo declarado por el navegador no coincide con el contenido.' }
  }
  return { ok: true, type: real, mime: ALLOWED_TYPES[real].mime, ext: ALLOWED_TYPES[real].ext }
}

/** SHA-256 hexadecimal del contenido (Web Crypto). */
export async function sha256Hex(blob) {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Ruta de objeto: <publicacion_id>/<uuid>.<ext> (la política de Storage exige este formato). */
export function buildStoragePath(publicacionId, ext, uuid = crypto.randomUUID()) {
  return `${publicacionId}/${uuid}.${ext}`
}

export { formatBytes } from './format.js'
