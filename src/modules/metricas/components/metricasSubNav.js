import { router } from '../../../core/router/router.js'

const SUB_RUTAS = [
  { id: 'metricas',             label: 'Dashboard',   icon: 'bi-speedometer2' },
  { id: 'metricas-alertas',     label: 'Alertas',     icon: 'bi-bell-fill' },
  { id: 'metricas-riesgo',      label: 'Riesgo',      icon: 'bi-exclamation-triangle-fill' },
  { id: 'metricas-maestros',    label: 'Maestros',    icon: 'bi-person-workspace' },
  { id: 'metricas-patron',      label: 'Asistencia',  icon: 'bi-calendar-week' },
  { id: 'metricas-destacados',  label: 'Destacados',  icon: 'bi-star-fill' },
  { id: 'periodos',             label: 'Períodos',    icon: 'bi-calendar3' },
]

export function renderMetricasSubNav(currentRoute) {
  const nav = document.createElement('div')
  nav.className = 'metricas-subnav border-bottom px-3 pt-2'
  nav.style.cssText = 'position:sticky;top:0;z-index:100;background:var(--bs-body-bg);'
  nav.innerHTML = `
    <div class="d-flex gap-1 overflow-auto" style="scrollbar-width:none">
      ${SUB_RUTAS.map(r => `
        <button
          class="btn btn-sm px-3 py-2 border-0 d-flex align-items-center gap-1 text-nowrap
            ${currentRoute === r.id
              ? 'btn-primary fw-semibold'
              : 'text-secondary bg-transparent'}"
          data-route="${r.id}"
          style="border-radius:.375rem .375rem 0 0;border-bottom: 2px solid ${currentRoute === r.id ? 'var(--bs-primary)' : 'transparent'} !important">
          <i class="bi ${r.icon}" style="font-size:.85rem"></i>
          <span style="font-size:.85rem">${r.label}</span>
        </button>
      `).join('')}
    </div>
  `

  nav.querySelectorAll('button[data-route]').forEach(btn => {
    btn.addEventListener('click', () => router.navigate(btn.dataset.route))
  })

  return nav
}
