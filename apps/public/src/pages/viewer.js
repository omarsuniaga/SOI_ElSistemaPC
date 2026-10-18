import { h, formatDate } from '../dom.js'
import { mountLayout } from '../layout.js'
import { obtenerPublicacion, urlArchivo } from '../api.js'
import { isValidSlug } from '../../../../src/modules/documentos-publicos/lib/slug.js'
import { formatBytes } from '../../../../src/modules/documentos-publicos/lib/format.js'
import { categoriaLabel } from '../../../../src/modules/documentos-publicos/lib/categorias.js'

/** Extrae el slug de /d/<slug> (o null). */
export function slugFromPath(pathname) {
  const m = /^\/d\/([^/]+)\/?$/.exec(pathname || '')
  return m && isValidSlug(m[1]) ? m[1] : null
}

const unavailable = () => h('article', { class: 'doc center' },
  h('h1', {}, 'Documento no disponible'),
  h('p', { class: 'lead' }, 'Este enlace no corresponde a un documento publicado. Si lo recibiste por un código QR, consulta con la institución.'))

/**
 * Visualizador /d/<slug>. Inexistente, borrador, archivado o error de red muestran el MISMO mensaje
 * (no revela si el enlace existe). PDF: Abrir/Descargar; imagen: en línea.
 */
export async function renderViewer(root, slug = slugFromPath(window.location.pathname)) {
  const main = mountLayout(root, null)
  const shell = h('div', { class: 'shell narrow' })
  main.append(shell)
  shell.append(h('p', { class: 'state', 'aria-live': 'polite' }, 'Cargando…'))
  const back = h('a', { class: 'back', href: '/qr-code' }, '← Todos los documentos')

  if (!slug) { shell.replaceChildren(unavailable(), back); return }
  let doc
  try { doc = await obtenerPublicacion(slug) } catch { doc = null }
  if (!doc) { shell.replaceChildren(unavailable(), back); return }

  const open = h('a', { class: 'btn btn-primary', id: 'abrir', target: '_blank', rel: 'noopener noreferrer', role: 'button', 'aria-disabled': 'true' }, 'Abrir')
  const download = h('a', { class: 'btn btn-ghost', id: 'descargar', rel: 'noopener noreferrer', role: 'button', 'aria-disabled': 'true' },
    `Descargar (${(doc.extension || '').toUpperCase()}, ${formatBytes(doc.size_bytes)})`)
  const preview = h('div', { id: 'vista' })
  shell.replaceChildren(
    h('article', { class: 'doc' },
      h('p', { class: 'eyebrow' }, `${categoriaLabel(doc.categoria)} · ${formatDate(doc.fecha_documento)}`),
      h('h1', {}, doc.titulo),
      doc.descripcion ? h('p', {}, doc.descripcion) : null,
      preview,
      h('div', { class: 'actions' }, open, download)),
    back)
  document.title = `${doc.titulo} — El Sistema Punta Cana`

  try {
    const [openUrl, downloadUrl] = await Promise.all([
      urlArchivo(doc.storage_path),
      urlArchivo(doc.storage_path, { download: `${slug}.${doc.extension}` }),
    ])
    open.href = openUrl
    download.href = downloadUrl
    open.removeAttribute('aria-disabled')
    download.removeAttribute('aria-disabled')
    if ((doc.mime_type || '').startsWith('image/')) preview.append(h('img', { class: 'doc-img', src: openUrl, alt: doc.titulo }))
  } catch {
    preview.append(h('p', { class: 'alert', role: 'alert' }, 'No se pudo obtener el archivo. Intenta de nuevo en unos minutos.'))
  }
}
