/**
 * qr.js — generación local de códigos QR (PNG y SVG). Sin servicios externos:
 * usa la librería empaquetada `qrcode`; nada sale del navegador.
 *
 * El QR codifica SOLO la URL permanente /d/<slug>; por eso reemplazar el documento
 * no invalida ningún QR impreso.
 */
import QRCode from 'qrcode'

const SLUG_RE = /^[a-z0-9]{10}$/

export function isValidSlug(slug) {
  return typeof slug === 'string' && SLUG_RE.test(slug)
}

/** Base pública del sitio. VITE_PUBLIC_BASE_URL evita imprimir QR con dominios de preview/localhost. */
export function publicBaseUrl() {
  const configured = import.meta.env?.VITE_PUBLIC_BASE_URL
  const base = configured || (typeof window !== 'undefined' ? window.location.origin : '')
  return String(base).replace(/\/+$/, '')
}

/** URL pública permanente de una publicación. */
export function buildPublicUrl(slug, base = publicBaseUrl()) {
  if (!isValidSlug(slug)) throw new Error('Identificador público inválido')
  return `${String(base).replace(/\/+$/, '')}/d/${slug}`
}

const QR_OPTS = { errorCorrectionLevel: 'M', margin: 2 }

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
