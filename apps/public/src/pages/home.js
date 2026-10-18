import { h, formatDate } from '../dom.js'
import { mountLayout, SITE_NAME, MOTTO } from '../layout.js'
import { listarPublicaciones } from '../api.js'
import { categoriaLabel } from '../../../../src/modules/documentos-publicos/lib/categorias.js'

/** Tarjeta de documento reutilizada por inicio y biblioteca. */
export function documentCard(p) {
  return h('a', { class: 'card', href: `/d/${p.slug}` },
    h('span', { class: 'chip' }, categoriaLabel(p.categoria)),
    h('h3', {}, p.titulo),
    p.descripcion ? h('p', {}, p.descripcion) : null,
    h('div', { class: 'meta' }, h('span', {}, formatDate(p.fecha_documento)), h('span', {}, (p.extension || '').toUpperCase())))
}

export async function renderHome(root, { institutionalUrl = import.meta.env?.VITE_INSTITUTIONAL_URL } = {}) {
  const main = mountLayout(root, 'home')
  const list = h('div', { class: 'grid', 'aria-live': 'polite' })
  const url = String(institutionalUrl ?? '').trim()
  const safeUrl = /^https:\/\//i.test(url) ? url : ''

  main.append(
    h('section', { class: 'hero' },
      h('div', { class: 'shell' },
        h('p', { class: 'eyebrow' }, 'Bienvenidos'),
        h('h1', {}, SITE_NAME),
        h('p', { class: 'lead' }, MOTTO),
        h('div', { class: 'actions' },
          h('a', { class: 'btn btn-primary', href: '/qr-code' }, 'Ver documentos y programas'),
          safeUrl ? h('a', { class: 'btn btn-ghost', href: safeUrl, rel: 'noopener noreferrer', target: '_blank' }, 'Información institucional') : null))),
    h('section', { class: 'section', 'aria-labelledby': 'recientes' },
      h('div', { class: 'shell' },
        h('div', { class: 'section-head' },
          h('div', {}, h('h2', { id: 'recientes' }, 'Documentos disponibles'), h('p', { class: 'muted' }, 'Programas de mano y documentos publicados.')),
          h('a', { class: 'btn btn-ghost', href: '/qr-code' }, 'Ver todos')),
        list)))

  list.append(h('p', { class: 'state' }, 'Cargando…'))
  try {
    const rows = await listarPublicaciones({ limit: 3 })
    list.replaceChildren(...(rows.length ? rows.map(documentCard) : [h('p', { class: 'state' }, 'Todavía no hay documentos publicados.')]))
  } catch {
    list.replaceChildren(h('p', { class: 'state' }, 'No se pudieron cargar los documentos en este momento.'))
  }
}
