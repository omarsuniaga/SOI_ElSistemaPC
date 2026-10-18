import './styles.css'
import { h } from './dom.js'

export const SITE_NAME = 'El Sistema Punta Cana'
export const MOTTO = 'Tocamos corazones, cambiamos vidas.'

/** Marco común: cabecera, <main id="contenido"> y pie. Devuelve el <main> para rellenarlo. */
export function mountLayout(root, active) {
  const link = (href, label, key) => h('a', { href, 'aria-current': active === key ? 'page' : false }, label)
  const main = h('main', { id: 'contenido', class: 'page' })
  root.replaceChildren(
    h('header', { class: 'site-header' },
      h('div', { class: 'shell' },
        h('a', { class: 'brand', href: '/', 'aria-label': `${SITE_NAME}, inicio` }, SITE_NAME),
        h('nav', { class: 'nav', 'aria-label': 'Principal' }, link('/', 'Inicio', 'home'), link('/qr-code', 'Documentos', 'library')))),
    main,
    h('footer', { class: 'site-footer' },
      h('div', { class: 'shell' },
        h('span', {}, `© ${new Date().getFullYear()} ${SITE_NAME}`),
        h('span', {}, MOTTO))))
  return main
}
