import { getSemesterAdapter } from './semesterApi.js'
// La asignación la devuelve el servidor. Esta visibilidad no sustituye sus permisos RPC/RLS.
export async function installAuditionLinks(nav, onNavigate, adapter = getSemesterAdapter()) {
  try {
    const context = await adapter.execute('contexto')
    if (!nav?.isConnected) return
    const links = []
    if (context.convocatorias.some((c) => c.jurados.includes(context.user.id)))
      links.push(['mis-audiciones', 'Mis audiciones', 'bi-clipboard-check'])
    if (context.invitaciones.length)
      links.push(['mis-invitados', 'Mis invitados', 'bi-person-badge'])
    for (const [route, label, icon] of links) {
      if (nav.querySelector(`[data-route="${route}"]`)) continue
      const link = document.createElement('button')
      link.type = 'button'
      link.className = nav.classList.contains('pm-footer-nav__inner')
        ? 'pm-nav-tab'
        : 'pm-sidebar-link'
      link.dataset.route = route
      const glyph = document.createElement('i')
      glyph.className = `bi ${icon}`
      const text = document.createElement('span')
      text.textContent = label
      link.append(glyph, text)
      link.addEventListener('click', () => onNavigate(route))
      nav.appendChild(link)
    }
  } catch {
    /* Módulo no migrado: conserva íntegro el portal habitual. */
  }
}
