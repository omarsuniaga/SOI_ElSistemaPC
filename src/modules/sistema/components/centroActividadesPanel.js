import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'

const REFRESH_INTERVAL_MS = 30_000
let _refreshTimer = null

const ITEMS = [
  {
    key: 'aprobaciones',
    title: 'Aprobaciones de usuarios',
    description: 'Maestros y administradores pendientes de aprobación',
    icon: 'bi-person-check',
    route: 'admin-aprobacion',
    color: '#22c55e',
  },
  {
    key: 'ausencias',
    title: 'Solicitudes de ausencia',
    description: 'Ausencias pendientes de revisión',
    icon: 'bi-calendar-x',
    route: 'admin-ausencias',
    color: '#f59e0b',
  },
  {
    key: 'permisos',
    title: 'Solicitudes de permisos',
    description: 'Permisos solicitados por maestros',
    icon: 'bi-shield-lock',
    route: 'admin-dashboard-reportes',
    color: '#8b5cf6',
  },
]

export function renderCentroActividadesPanel(container) {
  container.innerHTML = `
    <div class="sv-section sv-ca-section">
      <div class="sv-ca-header">
        <div>
          <h4 class="sv-section__title m-0">
            <i class="bi bi-inbox-fill"></i> Centro de Actividades
          </h4>
          <p class="sv-ca-subtitle">Tareas pendientes que requieren tu atención</p>
        </div>
        <button class="btn btn-sm btn-outline-light sv-ca-refresh" type="button" id="ca-refresh-btn">
          <i class="bi bi-arrow-clockwise"></i>
          <span>Actualizar</span>
        </button>
      </div>

      <div class="sv-ca-grid" id="ca-cards-grid">
        ${ITEMS.map((item) => _renderSkeletonCard(item)).join('')}
      </div>
    </div>
  `

  _bind(container)
  _loadCounts(container)

  if (_refreshTimer) clearInterval(_refreshTimer)
  _refreshTimer = setInterval(() => _loadCounts(container), REFRESH_INTERVAL_MS)
}

export function stopCentroActividadesPanel() {
  if (_refreshTimer) {
    clearInterval(_refreshTimer)
    _refreshTimer = null
  }
}

function _renderSkeletonCard(item) {
  return `
    <button class="sv-ca-card" data-key="${item.key}" data-route="${item.route}" type="button" style="--ca-color:${item.color}">
      <div class="sv-ca-card__icon">
        <i class="bi ${item.icon}"></i>
      </div>
      <div class="sv-ca-card__body">
        <div class="sv-ca-card__title">${item.title}</div>
        <div class="sv-ca-card__desc">${item.description}</div>
      </div>
      <div class="sv-ca-card__count" data-count-for="${item.key}">
        <span class="spinner-border spinner-border-sm" role="status"></span>
      </div>
    </button>
  `
}

function _bind(container) {
  container.querySelectorAll('.sv-ca-card').forEach((card) => {
    card.addEventListener('click', () => {
      const route = card.dataset.route
      if (route) router.navigate(route)
    })
  })

  container.querySelector('#ca-refresh-btn')?.addEventListener('click', () => {
    _loadCounts(container)
  })
}

async function _loadCounts(container) {
  const results = await Promise.allSettled([
    _countAprobaciones(),
    _countAusencias(),
    _countPermisos(),
  ])

  const map = {
    aprobaciones: results[0],
    ausencias: results[1],
    permisos: results[2],
  }

  for (const [key, result] of Object.entries(map)) {
    _setCount(container, key, result)
  }
}

function _setCount(container, key, result) {
  const target = container.querySelector(`[data-count-for="${key}"]`)
  if (!target) return

  if (result.status === 'fulfilled') {
    const count = result.value
    const isHighlighted = count > 0
    target.innerHTML = `<span class="sv-ca-count-badge${isHighlighted ? ' is-active' : ''}">${count}</span>`
  } else {
    target.innerHTML = `<span class="sv-ca-count-badge is-error" title="${result.reason?.message || 'Error'}">!</span>`
  }
}

async function _countAprobaciones() {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .in('rol', ['maestro', 'admin'])
    .eq('estado', 'pendiente')
  if (error) throw error
  return count ?? 0
}

async function _countAusencias() {
  const { count, error } = await supabase
    .from('ausencias')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'pendiente')
  if (error) throw error
  return count ?? 0
}

async function _countPermisos() {
  const { count, error } = await supabase
    .from('solicitudes_permisos')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'pendiente')
  if (error) throw error
  return count ?? 0
}
