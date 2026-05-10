/**
 * ViewRegistry - Gestor de vistas persistentes para SPA del Portal Maestros
 * Mantiene las vistas en el DOM y solo cambia cual se muestra con display:none/block
 * Esto evita recargas completas y mantiene el estado de cada vista
 */

import { getMaestroLocal } from '../auth/maestroAuth.js'
import viewCache from './viewCache.js'

const _views = new Map()
let _currentRoute = null
let _router = null

export function initViewRegistry(router) {
  _router = router
  
  window.addEventListener('popstate', (e) => {
    if (e.state?.route) {
      _navigateTo(e.state.route, false)
    }
  })
}

function _navigateTo(route, pushState = true) {
  if (pushState && _router) {
    history.pushState({ route }, '', `#/${route}`)
  }
  
  if (_currentRoute === route) return
  
  _showView(route)
  _currentRoute = route
}

function _showView(route) {
  const container = document.getElementById('pm-view-container')
  if (!container) return

  _views.forEach((viewData, viewName) => {
    if (viewName === route) {
      viewData.container.style.display = 'block'
      viewData.container.classList.add('pm-view-active')
      
      if (viewData.onShow) {
        viewData.onShow(viewData.container)
      }
    } else {
      viewData.container.style.display = 'none'
      viewData.container.classList.remove('pm-view-active')
    }
  })

  _updateActiveTab(route)
}

function _updateActiveTab(route) {
  const baseRoute = route.split('?')[0]
  
  // Footer nav tabs
  document.querySelectorAll('.pm-nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === baseRoute)
  })
  
  // Header tabs (tablet+)
  document.querySelectorAll('.pm-header-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === baseRoute)
  })
  
  // Legacy bottom tabs (for compatibility)
  document.querySelectorAll('.pm-bottom-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === baseRoute)
  })
}

export function registerView(name, renderFn, onShow = null) {
  const container = document.getElementById('pm-view-container')
  if (!container) {
    console.warn('[ViewRegistry] Container no encontrado')
    return
  }

  const viewContainer = document.createElement('div')
  viewContainer.id = `pm-view-${name}`
  viewContainer.className = 'pm-view-container'
  viewContainer.style.display = 'none'
  container.appendChild(viewContainer)

  _views.set(name, {
    container: viewContainer,
    render: renderFn,
    onShow: onShow,
    rendered: false
  })

  return viewContainer
}

export async function showView(name, params = {}) {
  const viewData = _views.get(name)
  if (!viewData) {
    console.warn(`[ViewRegistry] Vista no registrada: ${name}`)
    return
  }

  if (!viewData.rendered) {
    await viewData.render(viewData.container, params)
    viewData.rendered = true
  }

  _navigateTo(name)
}

export function getView(name) {
  return _views.get(name)
}

export function invalidateView(name) {
  const viewData = _views.get(name)
  if (viewData) {
    viewData.rendered = false
  }
}

export function invalidateAllViews() {
  _views.forEach((viewData) => {
    viewData.rendered = false
  })
}

export function navigate(route) {
  _navigateTo(route, true)
}

export default {
  initViewRegistry,
  registerView,
  showView,
  getView,
  invalidateView,
  invalidateAllViews,
  navigate
}