// Firma (magic bytes) de los tipos permitidos. Lógica idéntica a
// src/modules/documentos-publicos/lib/fileValidation.js#detectSignature (una prueba de Vitest
// verifica que ambas coinciden). Sin dependencias de Deno: se puede probar con Vitest.

export type DocType = 'pdf' | 'jpg' | 'png' | 'webp'

export const ALLOWED: Record<DocType, { mime: string; ext: string }> = {
  pdf: { mime: 'application/pdf', ext: 'pdf' },
  jpg: { mime: 'image/jpeg', ext: 'jpg' },
  png: { mime: 'image/png', ext: 'png' },
  webp: { mime: 'image/webp', ext: 'webp' },
}

export const MAX_BYTES = 10 * 1024 * 1024

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b)

export function detectSignature(bytes: Uint8Array): DocType | null {
  if (!bytes || bytes.length < 4) return null
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf'
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  if (bytes.length >= 12 && startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp'
  return null
}

export interface Verdict {
  ok: boolean
  status?: number
  error?: string
  type?: DocType
  mime?: string
}

/** Decide si un objeto descargado es válido para la ruta (extensión) indicada. */
export function verifyObject(bytes: Uint8Array, storagePath: string): Verdict {
  if (bytes.length === 0) return { ok: false, status: 422, error: 'Archivo vacío' }
  if (bytes.length > MAX_BYTES) return { ok: false, status: 413, error: 'Archivo mayor a 10 MB' }
  const ext = /\.([a-z]+)$/.exec(storagePath)?.[1]
  const real = detectSignature(bytes)
  if (!real) return { ok: false, status: 422, error: 'El contenido no es PDF, JPG, PNG ni WebP válido' }
  if (real !== ext) return { ok: false, status: 422, error: `El contenido es ${real} pero la ruta indica .${ext}` }
  return { ok: true, type: real, mime: ALLOWED[real].mime }
}
