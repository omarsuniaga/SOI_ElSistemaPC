/**
 * qr.js — generación local de códigos QR (PNG y SVG). Sin servicios externos:
 * usa la librería empaquetada `qrcode`; nada sale del navegador.
 *
 * El QR codifica SOLO la URL permanente /d/<slug>; por eso reemplazar el documento
 * no invalida ningún QR impreso.
 */
import QRCode from 'qrcode'

import { isValidSlug } from './slug.js'
import { configuredPublicBase, evaluatePublicBase } from './qrDomain.js'

export { isValidSlug }

/** Base pública configurada (sin barra final). No hay respaldo en window.location: ver qrDomain.js. */
export function publicBaseUrl() {
  return configuredPublicBase().replace(/\/+$/, '')
}

/** URL pública permanente de una publicación (base explícita; la usan pruebas y vistas previas). */
export function buildPublicUrl(slug, base = publicBaseUrl()) {
  if (!isValidSlug(slug)) throw new Error('Identificador público inválido')
  return `${String(base).replace(/\/+$/, '')}/d/${slug}`
}

/** URL DEFINITIVA para QR: exige que la base pertenezca a la lista blanca; si no, lanza. */
export function buildDefinitiveQrUrl(slug, base = publicBaseUrl()) {
  const status = evaluatePublicBase(base)
  if (!status.ok) throw new Error(`QR definitivo bloqueado: ${status.message}`)
  return buildPublicUrl(slug, status.origin)
}

// margin 4 = zona de silencio mínima del estándar (ISO/IEC 18004) para que el QR impreso se lea bien.
const QR_OPTS = { errorCorrectionLevel: 'M', margin: 4 }

/** SVG vectorial (string). */
export function generateQrSvg(url) {
  return QRCode.toString(url, { ...QR_OPTS, type: 'svg' })
}

/** PNG como data URL (por defecto 1024 px: nítido para imprimir). */
export function generateQrPngDataUrl(url, size = 1024) {
  return QRCode.toDataURL(url, { ...QR_OPTS, width: size, type: 'image/png' })
}

/** Convierte un data URL en Blob (descarga). */
export function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(',')
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? 'application/octet-stream'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** Descarga un Blob con el nombre dado. */
export function downloadBlob(blob, fileName) {
  const a = document.createElement('a')
  const href = URL.createObjectURL(blob)
  a.href = href
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export const qrFileName = (slug, ext) => `qr-soi-${slug}.${ext}`
