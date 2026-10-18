/**
 * qrDomain.js — dominio autorizado para los QR definitivos.
 *
 * Un QR impreso es permanente: solo puede codificar URLs del portal público aprobado.
 * `VITE_PUBLIC_BASE_URL` debe pertenecer a la lista blanca (`VITE_PUBLIC_ALLOWED_ORIGINS`,
 * separada por comas; por defecto solo el dominio público aprobado). Si falta, no es https
 * (salvo un origen local EXPLÍCITAMENTE incluido en la lista, para pruebas), apunta a un
 * deploy preview/alias de rama (`--`), contiene ruta/credenciales o no está en la lista,
 * la exportación de QR queda BLOQUEADA y el panel muestra el motivo.
 * Nunca hay respaldo en `window.location.origin`: ese sería el dominio del panel admin.
 */
export const DEFAULT_ALLOWED_ORIGINS = Object.freeze(['https://elsistemapc.netlify.app'])

export const BLOCK_REASONS = Object.freeze({
  missing: 'Falta configurar VITE_PUBLIC_BASE_URL con el dominio público aprobado.',
  invalid: 'VITE_PUBLIC_BASE_URL no es una URL válida (use solo el origen, p. ej. https://dominio).',
  not_https: 'El dominio público debe usar https.',
  preview: 'VITE_PUBLIC_BASE_URL apunta a un deploy preview o alias de rama: no es un dominio definitivo.',
  not_allowed: 'El dominio configurado no está en la lista de dominios autorizados para QR definitivos.',
})

/** Origen normalizado de una URL "solo origen" o null si no es válida (ruta, query, hash o credenciales invalidan). */
export function normalizeOrigin(value) {
  try {
    const u = new URL(String(value).trim())
    if (!['http:', 'https:'].includes(u.protocol)) return null
    if (u.username || u.password || u.search || u.hash || !['', '/'].includes(u.pathname)) return null
    return u.origin
  } catch {
    return null
  }
}

export function allowedOrigins(raw = import.meta.env?.VITE_PUBLIC_ALLOWED_ORIGINS) {
  const list = String(raw ?? '').split(',').map((s) => normalizeOrigin(s)).filter(Boolean)
  return list.length ? list : [...DEFAULT_ALLOWED_ORIGINS]
}

const isLocalHost = (host) => host === 'localhost' || host === '127.0.0.1' || host === '[::1]'

/** Evalúa una base pública. Devuelve { ok, origin?, reason?, message? }. */
export function evaluatePublicBase(base, allowed = allowedOrigins()) {
  if (!String(base ?? '').trim()) return { ok: false, reason: 'missing', message: BLOCK_REASONS.missing }
  const origin = normalizeOrigin(base)
  if (!origin) return { ok: false, reason: 'invalid', message: BLOCK_REASONS.invalid }
  const url = new URL(origin)
  if (url.hostname.includes('--')) return { ok: false, reason: 'preview', message: BLOCK_REASONS.preview }
  if (url.protocol !== 'https:' && !isLocalHost(url.hostname)) return { ok: false, reason: 'not_https', message: BLOCK_REASONS.not_https }
  if (!allowed.includes(origin)) return { ok: false, reason: 'not_allowed', message: BLOCK_REASONS.not_allowed }
  return { ok: true, origin }
}

export const configuredPublicBase = () => String(import.meta.env?.VITE_PUBLIC_BASE_URL ?? '').trim()

/** Estado actual de la exportación de QR definitivos para el entorno de build. */
export const qrExportStatus = () => evaluatePublicBase(configuredPublicBase())
