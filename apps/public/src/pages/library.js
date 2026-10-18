import { h } from '../dom.js'
import { mountLayout } from '../layout.js'
import { listarPublicaciones } from '../api.js'
import { documentCard } from './home.js'

const PAGE = 24

/** Biblioteca /qr-code: solo publicaciones activas (la RPC pública no devuelve nada más). */
export async function renderLibrary(root) {
  const main = mountLayout(root, 'library')
  const list = h('div', { class: 'grid', 'aria-live': 'polite' })
  const more = h('button', { class: 'btn btn-ghost', type: 'button', hidden: true }, 'Cargar más')
  const search = h('input', { class: 'search', type: 'search', placeholder: 'Buscar por título…', 'aria-label': 'Buscar documentos por título' })
  const all = []
  let offset = 0

  main.append(h('div', { class: 'shell section' },
    h('div', { class: 'section-head' },
      h('div', {}, h('h1', {}, 'Documentos'), h('p', { class: 'muted' }, 'Programas de mano y documentos publicados por El Sistema Punta Cana.')),
      search),
    list,
    h('p', { class: 'center-btn' }, more)))

  const paint = () => {
    const q = search.value.trim().toLowerCase()
    const rows = q ? all.filter((p) => `${p.titulo} ${p.descripcion ?? ''}`.toLowerCase().includes(q)) : all
    list.replaceChildren(...(rows.length ? rows.map(documentCard) : [h('p', { class: 'state' }, all.length ? 'Ningún documento coincide con la búsqueda.' : 'Todavía no hay documentos publicados.')]))
  }

  async function load() {
    more.disabled = true
    try {
      const rows = await listarPublicaciones({ limit: PAGE, offset })
      all.push(...rows)
      offset += rows.length
      more.hidden = rows.length < PAGE
      paint()
    } catch {
      list.replaceChildren(h('p', { class: 'state' }, 'No se pudieron cargar los documentos en este momento. Intenta de nuevo más tarde.'))
    } finally {
      more.disabled = false
    }
  }
  more.addEventListener('click', load)
  search.addEventListener('input', paint)
  list.append(h('p', { class: 'state' }, 'Cargando…'))
  await load()
}
