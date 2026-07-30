import { AppToast } from '../../../shared/components/AppToast.js'
import * as weeklyPlanAdapter from '../../../modules/planificacion/api/weeklyPlanAdapter.js'

/**
 * Route selector dropdown for the attendance view.
 * Shows published route_versions matching the class instrument.
 *
 * @param {HTMLElement} container - parent DOM element
 * @param {Object} opts
 * @param {string} opts.claseId - current class ID
 * @param {string} opts.rutaId - currently active route_version ID
 * @param {Function} opts.onRouteChange - callback(newRouteId, newRoute) when teacher picks a different route
 * @returns {{ destroy: Function, getSelectedRouteId: () => string }}
 */
export function createRouteSelector(container, opts) {
  let selectedRouteId = opts.rutaId || null
  let routes = []
  let wrapEl = null
  let selectEl = null

  _injectStyles()

  async function init() {
    try {
      const allRoutes = await weeklyPlanAdapter.obtenerRutasActivas()
      routes = allRoutes.filter((r) => r.group_id === opts.claseId)

      if (opts.rutaId) {
        const match = routes.find((r) => r.id === opts.rutaId)
        if (match) selectedRouteId = match.id
      }

      render()
    } catch (err) {
      console.error('[RouteSelector] Error loading routes:', err)
      AppToast.error('No se pudieron cargar las rutas disponibles.')
    }
  }

  function render() {
    wrapEl = document.createElement('div')
    wrapEl.className = 'pm-route-selector-wrap'

    const label = document.createElement('span')
    label.className = 'pm-route-selector-label'
    label.innerHTML = '<i class="bi bi-signpost-2"></i> Ruta'

    selectEl = document.createElement('select')
    selectEl.className = 'pm-route-selector'

    if (routes.length === 0) {
      const opt = document.createElement('option')
      opt.value = ''
      opt.textContent = 'Sin rutas disponibles'
      opt.disabled = true
      selectEl.appendChild(opt)
    } else {
      routes.forEach((route) => {
        const option = document.createElement('option')
        option.value = route.id
        option.textContent = `Ruta - ${escHTML(route.group_nombre || route.group_id)}`
        if (route.id === selectedRouteId) option.selected = true
        selectEl.appendChild(option)
      })
    }

    selectEl.addEventListener('change', () => {
      const newId = selectEl.value
      if (!newId || newId === selectedRouteId) return
      selectedRouteId = newId
      const route = routes.find((r) => r.id === newId)
      if (route && typeof opts.onRouteChange === 'function') {
        opts.onRouteChange(newId, route)
      }
    })

    wrapEl.appendChild(label)
    wrapEl.appendChild(selectEl)
    container.appendChild(wrapEl)
  }

  function destroy() {
    if (wrapEl && wrapEl.parentNode) {
      wrapEl.remove()
    }
    wrapEl = null
    selectEl = null
  }

  function getSelectedRouteId() {
    return selectedRouteId
  }

  init()

  return { destroy, getSelectedRouteId }
}

function escHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function _injectStyles() {
  if (document.getElementById('pm-route-selector-styles')) return

  const style = document.createElement('style')
  style.id = 'pm-route-selector-styles'
  style.textContent = `
    .pm-route-selector-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: var(--pm-surface-2, #374151);
      border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
      border-radius: 12px;
      margin: 0 1rem 1rem;
    }

    .pm-route-selector-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--pm-text-muted, #9ca3af);
      white-space: nowrap;
    }

    .pm-route-selector {
      flex: 1;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      border: 1px solid var(--pm-border, rgba(255,255,255,0.2));
      background: var(--pm-surface, #2d3748);
      color: var(--pm-text, #e5e7eb);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%239ca3af' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2rem;
    }

    .pm-route-selector:focus {
      outline: none;
      border-color: var(--pm-primary, #007aff);
      box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
    }

    [data-theme="light"] .pm-route-selector-wrap {
      background: #f9fafb;
      border-color: #e5e7eb;
    }

    [data-theme="light"] .pm-route-selector {
      background: #fff;
      color: #374151;
      border-color: #d1d5db;
    }

    [data-theme="light"] .pm-route-selector-label {
      color: #6b7280;
    }
  `
  document.head.appendChild(style)
}
