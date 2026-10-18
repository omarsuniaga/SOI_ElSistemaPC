/**
 * documentoPublicoView.js — página pública /d/<slug> (sin sesión).
 *
 * Responsiva. Muestra título, descripción, fecha y categoría; imágenes en línea; PDF mediante
 * botones "Abrir" y "Descargar" (la CSP del sitio no permite incrustar PDFs de otro origen).
 * Solo funciona para publicaciones en estado 'publicado'; en cualquier otro caso muestra un
 * mensaje genérico idéntico (no revela si el enlace existe, está en borrador o archivado).
 */
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import * as api from '../api/documentosPublicosApi.js'
import { categoriaLabel } from '../lib/estados.js'
import { isValidSlug } from '../lib/qr.js'
import { formatBytes } from '../lib/fileValidation.js'

/** Extrae el slug de /d/<slug> (o null). */
export function slugFromPath(pathname) {
  const m = /^\/d\/([^/]+)\/?$/.exec(pathname || '')
  return m && isValidSlug(m[1]) ? m[1] : null
}

const shell = (inner) => `<main class="dp-wrap">${inner}</main>`

const notAvailable = () => shell(`
  <div class="dp-card text-center">
    <div class="dp-icon"><i class="bi bi-file-earmark-x"></i></div>
    <h1 class="h4">Documento no disponible</h1>
    <p class="text-muted mb-0">Este enlace no corresponde a un documento publicado. Si lo recibiste por un código QR, consulta con la institución.</p>
  </div>`)

export async function renderDocumentoPublicoView(container, slug) {
  container.innerHTML = shell('<div class="dp-card text-center text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Cargando…</div>')
  if (!slug) { container.innerHTML = notAvailable(); return }
  let doc
  try {
    doc = await api.obtenerPublicacionPublica(slug)
  } catch {
    container.innerHTML = notAvailable()
    return
  }
  if (!doc) { container.innerHTML = notAvailable(); return }

  const fecha = new Date(`${doc.fecha_documento}T00:00:00`).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })
  const esImagen = doc.mime_type.startsWith('image/')
  container.innerHTML = shell(`
    <article class="dp-card">
      <div class="small text-uppercase text-muted mb-1">${escapeHTML(categoriaLabel(doc.categoria))} · ${escapeHTML(fecha)}</div>
      <h1 class="h3 mb-2">${escapeHTML(doc.titulo)}</h1>
      ${doc.descripcion ? `<p class="mb-3">${escapeHTML(doc.descripcion)}</p>` : ''}
      <div id="dpPreview" class="mb-3"></div>
      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-primary" id="dpAbrir" target="_blank" rel="noopener" role="button" aria-disabled="true"><i class="bi bi-box-arrow-up-right me-1"></i>Abrir</a>
        <a class="btn btn-outline-primary" id="dpDescargar" rel="noopener" role="button" aria-disabled="true"><i class="bi bi-download me-1"></i>Descargar (${escapeHTML(doc.extension.toUpperCase())}, ${escapeHTML(formatBytes(doc.size_bytes))})</a>
      </div>
    </article>`)

  const fileName = `${slug}.${doc.extension}`
  try {
    const [openUrl, downloadUrl] = await Promise.all([
      api.urlArchivoPublico(doc.storage_path),
      api.urlArchivoPublico(doc.storage_path, { download: fileName }),
    ])
    const abrir = container.querySelector('#dpAbrir')
    const descargar = container.querySelector('#dpDescargar')
    if (!openUrl || !downloadUrl) throw new Error('sin enlace')
    abrir.href = openUrl
    descargar.href = downloadUrl
    abrir.removeAttribute('aria-disabled')
    descargar.removeAttribute('aria-disabled')
    if (esImagen) {
      const img = document.createElement('img')
      img.src = openUrl
      img.alt = doc.titulo
      img.className = 'dp-img'
      container.querySelector('#dpPreview').appendChild(img)
    }
  } catch {
    container.querySelector('#dpPreview').innerHTML = '<div class="alert alert-warning mb-0">No se pudo obtener el archivo. Intenta de nuevo en unos minutos.</div>'
  }
}
